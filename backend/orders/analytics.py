from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from .models import Order, OrderItem
from catalog.models import Product, Review
from django.contrib.auth import get_user_model

User = get_user_model()


def get_analytics_summary():
    now = timezone.now()
    last_30 = now - timedelta(days=30)
    last_7 = now - timedelta(days=7)

    all_orders = Order.objects.all()
    recent_orders = all_orders.filter(created_at__gte=last_30)

    total_revenue = all_orders.aggregate(total=Sum('total'))['total'] or 0
    monthly_revenue = recent_orders.aggregate(total=Sum('total'))['total'] or 0

    # Top products by purchase count
    top_products = (
        OrderItem.objects
        .values('product_name', 'product_sku')
        .annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('subtotal'),
        )
        .order_by('-total_sold')[:10]
    )

    # Orders by status
    status_breakdown = dict(
        all_orders.values_list('status')
        .annotate(count=Count('id'))
        .values_list('status', 'count')
    )

    # Revenue by day (last 30 days)
    daily_revenue = list(
        recent_orders
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(revenue=Sum('total'), orders=Count('id'))
        .order_by('date')
        .values('date', 'revenue', 'orders')
    )
    # Convert dates to strings
    for d in daily_revenue:
        d['date'] = d['date'].isoformat()

    # Category breakdown
    category_revenue = list(
        OrderItem.objects
        .values(category=F('product__category__name'))
        .annotate(revenue=Sum('subtotal'), items_sold=Sum('quantity'))
        .order_by('-revenue')
    )

    # Conversion funnel (simplified)
    total_users = User.objects.count()
    users_with_orders = all_orders.values('user').distinct().count()
    total_orders = all_orders.count()

    return {
        'overview': {
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue),
            'total_orders': total_orders,
            'monthly_orders': recent_orders.count(),
            'total_customers': total_users,
            'avg_order_value': float(all_orders.aggregate(avg=Avg('total'))['avg'] or 0),
            'total_products': Product.objects.filter(is_active=True).count(),
            'total_reviews': Review.objects.count(),
        },
        'conversion_funnel': {
            'registered_users': total_users,
            'users_with_orders': users_with_orders,
            'total_orders': total_orders,
            'conversion_rate': round(users_with_orders / max(total_users, 1) * 100, 1),
        },
        'top_products': list(top_products),
        'status_breakdown': status_breakdown,
        'daily_revenue': daily_revenue,
        'category_revenue': category_revenue,
    }
