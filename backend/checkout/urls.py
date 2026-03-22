from django.urls import path
from . import views

urlpatterns = [
    path('', views.CheckoutView.as_view(), name='checkout'),
    path('payment-intent/', views.PaymentIntentView.as_view(), name='payment-intent'),
    path('paypal/create/', views.PayPalCreateView.as_view(), name='paypal-create'),
    path('paypal/capture/', views.PayPalCaptureView.as_view(), name='paypal-capture'),
]
