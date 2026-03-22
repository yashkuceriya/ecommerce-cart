from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order-list'),
    path('lookup/', views.GuestOrderLookupView.as_view(), name='guest-order-lookup'),
    path('<str:order_number>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_number>/status/', views.OrderStatusView.as_view(), name='order-status'),
    path('analytics/dashboard/', views.analytics_view, name='analytics-dashboard'),
]
