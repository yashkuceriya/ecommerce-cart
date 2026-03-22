from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet)
router.register('products', views.ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('coupon/validate/', views.CouponValidateView.as_view(), name='coupon-validate'),
    path('products/<slug:slug>/recommendations/', views.ProductRecommendationsView.as_view(), name='product-recommendations'),
    path('search-suggestions/', views.search_suggestions, name='search-suggestions'),
]
