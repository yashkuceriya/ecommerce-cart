"""
Mock email service — logs emails to console and database.
Replace with real SMTP/SendGrid/SES in production.
"""
import logging
from django.conf import settings

logger = logging.getLogger('orders.emails')


def send_order_confirmation(order):
    """Send order confirmation email (mock: logs to console)."""
    subject = f'Order Confirmed — #{order.order_number}'
    body = f"""
Hi {order.shipping_name},

Thank you for your order from Upstream Literacy!

Order Number: {order.order_number}
Total: ${order.total}
Status: {order.status}

Items:
"""
    for item in order.items.all():
        body += f"  - {item.product_name} x{item.quantity} — ${item.subtotal}\n"

    body += f"""
Shipping to:
  {order.shipping_name}
  {order.shipping_address}
  {order.shipping_city}, {order.shipping_state} {order.shipping_zip}

Track your order: /order-lookup

Thank you for supporting evidence-based literacy education!
— The Upstream Literacy Team
"""

    logger.info(f'EMAIL TO: {order.email} | SUBJECT: {subject}')
    logger.info(body)

    # In production, replace with:
    # from django.core.mail import send_mail
    # send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [order.email])

    return True


def send_order_status_update(order):
    """Send order status update email (mock)."""
    logger.info(
        f'EMAIL TO: {order.email} | '
        f'SUBJECT: Order #{order.order_number} — Status Update: {order.status}'
    )
    return True
