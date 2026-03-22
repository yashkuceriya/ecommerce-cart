from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'quantity', 'unit_price', 'subtotal',
        ]


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'email', 'status', 'payment_method',
            'payment_status', 'subtotal', 'tax', 'total', 'created_at',
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'email', 'status',
            'payment_method', 'payment_status', 'payment_id',
            'subtotal', 'discount', 'coupon_code', 'tax', 'total',
            'shipping_name', 'shipping_address', 'shipping_city',
            'shipping_state', 'shipping_zip', 'billing_same_as_shipping',
            'purchase_order_number', 'organization_name', 'tax_exempt',
            'notes', 'items', 'created_at', 'updated_at',
        ]
