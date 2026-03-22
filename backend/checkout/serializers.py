from rest_framework import serializers


class CheckoutSerializer(serializers.Serializer):
    email = serializers.EmailField()
    shipping_name = serializers.CharField(max_length=255)
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_zip = serializers.CharField(max_length=20)
    billing_same_as_shipping = serializers.BooleanField(default=True)
    payment_method = serializers.ChoiceField(choices=['credit_card', 'paypal', 'purchase_order'])
    purchase_order_number = serializers.CharField(max_length=100, required=False, default='')
    organization_name = serializers.CharField(max_length=255, required=False, default='')
    tax_exempt = serializers.BooleanField(default=False)
    notes = serializers.CharField(required=False, default='')
    coupon_code = serializers.CharField(max_length=50, required=False, default='')
