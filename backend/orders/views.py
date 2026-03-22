from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes as perm
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import OrderSerializer, OrderDetailSerializer
from .analytics import get_analytics_summary


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.filter(user=self.request.user)
        order_status = self.request.query_params.get('status')
        if order_status:
            qs = qs.filter(status=order_status)
        return qs


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    lookup_field = 'order_number'

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Order.objects.filter(user=self.request.user)
        return Order.objects.none()


class GuestOrderLookupView(APIView):
    """Allows guests to look up their order by order number + email."""

    def post(self, request):
        order_number = request.data.get('order_number', '').strip()
        email = request.data.get('email', '').strip().lower()
        if not order_number or not email:
            return Response({'error': 'Order number and email are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            order = Order.objects.get(order_number=order_number, email__iexact=email)
            return Response(OrderDetailSerializer(order).data)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found. Check your order number and email.'}, status=status.HTTP_404_NOT_FOUND)


class OrderStatusView(generics.UpdateAPIView):
    serializer_class = OrderDetailSerializer
    lookup_field = 'order_number'
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Order.objects.all()

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status and new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save(update_fields=['status', 'updated_at'])
            return Response(OrderDetailSerializer(order).data)
        return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@perm([permissions.IsAdminUser])
def analytics_view(request):
    return Response(get_analytics_summary())
