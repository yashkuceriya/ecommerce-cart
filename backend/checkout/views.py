import uuid
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.views import get_or_create_cart
from orders.models import Order, OrderItem
from orders.serializers import OrderDetailSerializer
from .payment import get_payment_backend
from .serializers import CheckoutSerializer


def generate_order_number():
    date_str = timezone.now().strftime('%Y%m%d')
    suffix = uuid.uuid4().hex[:4].upper()
    return f'UL-{date_str}-{suffix}'


class CheckoutView(APIView):
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart = get_or_create_cart(request)
        items = cart.items.select_related('product').all()

        if not items.exists():
            return Response(
                {'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST
            )

        # Verify stock
        for item in items:
            if item.product.track_inventory and item.quantity > item.product.stock_quantity:
                return Response(
                    {'error': f'{item.product.name}: only {item.product.stock_quantity} available.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        subtotal = cart.total
        discount = Decimal('0.00')
        coupon_code = data.get('coupon_code', '').strip().upper()
        applied_coupon = None

        if coupon_code:
            from catalog.models import Coupon
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if coupon.is_valid:
                    if subtotal >= coupon.min_purchase:
                        if coupon.discount_type == 'percentage':
                            discount = (subtotal * coupon.discount_value / 100).quantize(Decimal('0.01'))
                        else:
                            discount = min(coupon.discount_value, subtotal)
                        applied_coupon = coupon
            except Coupon.DoesNotExist:
                pass

        after_discount = subtotal - discount
        tax = Decimal('0.00')
        if not data.get('tax_exempt'):
            tax = (after_discount * Decimal('0.08')).quantize(Decimal('0.01'))
        total = after_discount + tax

        # Process payment
        backend = get_payment_backend()
        payment_id = ''

        if data['payment_method'] == 'credit_card':
            result = backend.create_payment_intent(float(total))
            confirm = backend.confirm_payment(result['id'])
            if confirm['status'] != 'succeeded':
                return Response(
                    {'error': 'Payment failed.'}, status=status.HTTP_402_PAYMENT_REQUIRED
                )
            payment_id = result['id']
        elif data['payment_method'] == 'paypal':
            result = backend.create_paypal_order(float(total))
            capture = backend.capture_paypal_order(result['id'])
            if capture['status'] != 'COMPLETED':
                return Response(
                    {'error': 'PayPal payment failed.'}, status=status.HTTP_402_PAYMENT_REQUIRED
                )
            payment_id = result['id']

        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            order_number=generate_order_number(),
            email=data['email'],
            status='confirmed',
            payment_method=data['payment_method'],
            payment_status='paid' if data['payment_method'] != 'purchase_order' else 'pending',
            payment_id=payment_id,
            subtotal=subtotal,
            discount=discount,
            coupon_code=coupon_code if applied_coupon else '',
            tax=tax,
            total=total,
            shipping_name=data['shipping_name'],
            shipping_address=data['shipping_address'],
            shipping_city=data['shipping_city'],
            shipping_state=data['shipping_state'],
            shipping_zip=data['shipping_zip'],
            billing_same_as_shipping=data['billing_same_as_shipping'],
            purchase_order_number=data.get('purchase_order_number', ''),
            organization_name=data.get('organization_name', ''),
            tax_exempt=data.get('tax_exempt', False),
            notes=data.get('notes', ''),
        )

        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_sku=item.product.sku,
                quantity=item.quantity,
                unit_price=item.product.price,
                subtotal=item.subtotal,
            )
            if item.product.track_inventory:
                item.product.stock_quantity -= item.quantity
                item.product.save(update_fields=['stock_quantity'])

        cart.items.all().delete()

        if applied_coupon:
            applied_coupon.times_used += 1
            applied_coupon.save(update_fields=['times_used'])

        # Send confirmation email (mock — logs to console)
        from orders.emails import send_order_confirmation
        send_order_confirmation(order)

        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)


class PaymentIntentView(APIView):
    def post(self, request):
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount required.'}, status=status.HTTP_400_BAD_REQUEST)
        backend = get_payment_backend()
        result = backend.create_payment_intent(float(amount))
        return Response(result)


class PayPalCreateView(APIView):
    def post(self, request):
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount required.'}, status=status.HTTP_400_BAD_REQUEST)
        backend = get_payment_backend()
        result = backend.create_paypal_order(float(amount))
        return Response(result)


class PayPalCaptureView(APIView):
    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'error': 'Order ID required.'}, status=status.HTTP_400_BAD_REQUEST)
        backend = get_payment_backend()
        result = backend.capture_paypal_order(order_id)
        return Response(result)
