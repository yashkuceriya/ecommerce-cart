import abc
import uuid

from django.conf import settings


class PaymentBackend(abc.ABC):
    @abc.abstractmethod
    def create_payment_intent(self, amount, currency='usd', metadata=None):
        pass

    @abc.abstractmethod
    def confirm_payment(self, payment_id):
        pass

    @abc.abstractmethod
    def create_paypal_order(self, amount, currency='usd', metadata=None):
        pass

    @abc.abstractmethod
    def capture_paypal_order(self, order_id):
        pass


class MockPaymentBackend(PaymentBackend):
    def create_payment_intent(self, amount, currency='usd', metadata=None):
        return {
            'id': f'mock_pi_{uuid.uuid4().hex[:16]}',
            'client_secret': f'mock_secret_{uuid.uuid4().hex[:24]}',
            'status': 'requires_confirmation',
            'amount': amount,
        }

    def confirm_payment(self, payment_id):
        return {'id': payment_id, 'status': 'succeeded'}

    def create_paypal_order(self, amount, currency='usd', metadata=None):
        order_id = f'mock_paypal_{uuid.uuid4().hex[:16]}'
        return {
            'id': order_id,
            'approval_url': f'/api/checkout/paypal/mock-approve/{order_id}/',
            'status': 'CREATED',
        }

    def capture_paypal_order(self, order_id):
        return {'id': order_id, 'status': 'COMPLETED'}


class StripePaymentBackend(PaymentBackend):
    """Activate by setting PAYMENT_BACKEND='stripe' and providing STRIPE_SECRET_KEY."""

    def __init__(self):
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.stripe = stripe

    def create_payment_intent(self, amount, currency='usd', metadata=None):
        intent = self.stripe.PaymentIntent.create(
            amount=int(amount * 100),
            currency=currency,
            metadata=metadata or {},
        )
        return {
            'id': intent.id,
            'client_secret': intent.client_secret,
            'status': intent.status,
            'amount': amount,
        }

    def confirm_payment(self, payment_id):
        intent = self.stripe.PaymentIntent.retrieve(payment_id)
        return {'id': intent.id, 'status': intent.status}

    def create_paypal_order(self, amount, currency='usd', metadata=None):
        raise NotImplementedError("Use PayPal backend for PayPal orders")

    def capture_paypal_order(self, order_id):
        raise NotImplementedError("Use PayPal backend for PayPal orders")


def get_payment_backend():
    backend = getattr(settings, 'PAYMENT_BACKEND', 'mock')
    if backend == 'stripe':
        return StripePaymentBackend()
    return MockPaymentBackend()
