from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, NumberFilter, CharFilter
from django.db.models import Avg, Count

from .models import Category, Product, Wishlist, Coupon
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class ProductFilter(FilterSet):
    min_price = NumberFilter(field_name='price', lookup_expr='gte')
    max_price = NumberFilter(field_name='price', lookup_expr='lte')
    category = CharFilter(field_name='category__slug')
    in_stock = CharFilter(method='filter_in_stock')
    bestseller = CharFilter(method='filter_bestseller')

    class Meta:
        model = Product
        fields = ['category', 'is_digital']

    def filter_in_stock(self, queryset, name, value):
        if value.lower() == 'true':
            return queryset.filter(stock_quantity__gt=0) | queryset.filter(track_inventory=False)
        return queryset

    def filter_bestseller(self, queryset, name, value):
        if value.lower() == 'true':
            return queryset.filter(is_bestseller=True)
        return queryset


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category')
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'tags', 'sku']
    ordering_fields = ['price', 'created_at', 'name', 'times_purchased']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = Wishlist.objects.filter(user=request.user).select_related('product', 'product__category')
        products = [item.product for item in items]
        return Response(ProductListSerializer(products, many=True).data)

    def post(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        Wishlist.objects.get_or_create(user=request.user, product=product)
        return Response({'status': 'added', 'product_id': product_id})

    def delete(self, request):
        product_id = request.data.get('product_id')
        Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
        return Response({'status': 'removed', 'product_id': product_id})


class CouponValidateView(APIView):
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code.'}, status=status.HTTP_404_NOT_FOUND)
        if not coupon.is_valid:
            return Response({'error': 'This coupon has expired or reached its usage limit.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': str(coupon.discount_value),
            'min_purchase': str(coupon.min_purchase),
        })


class ProductRecommendationsView(APIView):
    """Returns products frequently bought with the given product (same category + bestsellers)."""

    def get(self, request, slug):
        try:
            product = Product.objects.get(slug=slug, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Same category products, ordered by popularity
        related = (
            Product.objects.filter(is_active=True, category=product.category)
            .exclude(id=product.id)
            .order_by('-times_purchased')[:4]
        )

        # If not enough in same category, fill with bestsellers
        if related.count() < 4:
            extra_ids = list(related.values_list('id', flat=True)) + [product.id]
            extra = (
                Product.objects.filter(is_active=True, is_bestseller=True)
                .exclude(id__in=extra_ids)
                .order_by('-times_purchased')[:4 - related.count()]
            )
            related = list(related) + list(extra)

        return Response(ProductListSerializer(related, many=True).data)


@api_view(['GET'])
def search_suggestions(request):
    """Quick search returning top 5 product name matches."""
    q = request.query_params.get('q', '')
    if len(q) < 2:
        return Response([])
    products = Product.objects.filter(
        is_active=True, name__icontains=q
    ).values('name', 'slug', 'price', 'image')[:5]
    return Response(list(products))


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'healthy', 'service': 'upstream-literacy-api'})
