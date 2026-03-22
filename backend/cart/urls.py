from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.AddToCartView.as_view(), name='cart-add'),
    path('items/<int:pk>/update/', views.UpdateCartItemView.as_view(), name='cart-update'),
    path('items/<int:pk>/remove/', views.RemoveCartItemView.as_view(), name='cart-remove'),
]
