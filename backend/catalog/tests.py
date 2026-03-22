from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from .models import Category, Product, Coupon

User = get_user_model()


class CatalogAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.cat = Category.objects.create(name='Test', slug='test', description='Test category')
        self.product = Product.objects.create(
            name='Test Product', slug='test-product', description='A test product',
            price=29.99, sku='TEST-001', category=self.cat, stock_quantity=10,
        )

    def test_product_list(self):
        r = self.client.get('/api/catalog/products/')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['name'], 'Test Product')

    def test_product_detail(self):
        r = self.client.get('/api/catalog/products/test-product/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['name'], 'Test Product')

    def test_category_list(self):
        r = self.client.get('/api/catalog/categories/')
        self.assertEqual(r.status_code, 200)

    def test_product_search(self):
        r = self.client.get('/api/catalog/products/?search=test')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['count'], 1)

    def test_product_filter_by_price(self):
        r = self.client.get('/api/catalog/products/?min_price=20&max_price=40')
        self.assertEqual(r.json()['count'], 1)
        r2 = self.client.get('/api/catalog/products/?min_price=50')
        self.assertEqual(r2.json()['count'], 0)

    def test_search_suggestions(self):
        r = self.client.get('/api/catalog/search-suggestions/?q=test')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)

    def test_recommendations(self):
        Product.objects.create(
            name='Another', slug='another', description='x', price=10,
            sku='TEST-002', category=self.cat, stock_quantity=5,
        )
        r = self.client.get('/api/catalog/products/test-product/recommendations/')
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 1)

    def test_coupon_validate(self):
        Coupon.objects.create(code='TEST20', discount_type='percentage', discount_value=20, min_purchase=0)
        r = self.client.post('/api/catalog/coupon/validate/', {'code': 'TEST20'}, content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['code'], 'TEST20')

    def test_coupon_invalid(self):
        r = self.client.post('/api/catalog/coupon/validate/', {'code': 'INVALID'}, content_type='application/json')
        self.assertEqual(r.status_code, 404)

    def test_health_check(self):
        r = self.client.get('/api/health/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['status'], 'healthy')


class CartCheckoutTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='buyer', password='pass1234!', email='b@t.com')
        self.cat = Category.objects.create(name='Cat', slug='cat')
        self.product = Product.objects.create(
            name='Item', slug='item', description='x', price=50.00,
            sku='ITEM-001', category=self.cat, stock_quantity=10,
        )

    def _login(self):
        r = self.client.post('/api/auth/token/', {'username': 'buyer', 'password': 'pass1234!'}, content_type='application/json')
        token = r.json()['access']
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_add_to_cart(self):
        headers = self._login()
        r = self.client.post('/api/cart/add/', {'product_id': self.product.id, 'quantity': 2}, content_type='application/json', **headers)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['item_count'], 2)

    def test_checkout_flow(self):
        headers = self._login()
        self.client.post('/api/cart/add/', {'product_id': self.product.id, 'quantity': 1}, content_type='application/json', **headers)
        r = self.client.post('/api/checkout/', {
            'email': 'b@t.com', 'shipping_name': 'Buyer', 'shipping_address': '123 St',
            'shipping_city': 'NY', 'shipping_state': 'NY', 'shipping_zip': '10001',
            'payment_method': 'credit_card',
        }, content_type='application/json', **headers)
        self.assertEqual(r.status_code, 201)
        self.assertIn('order_number', r.json())
        # Verify stock decremented
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 9)

    def test_checkout_with_coupon(self):
        Coupon.objects.create(code='HALF', discount_type='percentage', discount_value=50, min_purchase=0)
        headers = self._login()
        self.client.post('/api/cart/add/', {'product_id': self.product.id, 'quantity': 1}, content_type='application/json', **headers)
        r = self.client.post('/api/checkout/', {
            'email': 'b@t.com', 'shipping_name': 'B', 'shipping_address': '1',
            'shipping_city': 'X', 'shipping_state': 'X', 'shipping_zip': '1',
            'payment_method': 'credit_card', 'coupon_code': 'HALF',
        }, content_type='application/json', **headers)
        self.assertEqual(r.status_code, 201)
        self.assertEqual(float(r.json()['discount']), 25.00)

    def test_out_of_stock_rejection(self):
        self.product.stock_quantity = 0
        self.product.save()
        headers = self._login()
        r = self.client.post('/api/cart/add/', {'product_id': self.product.id, 'quantity': 1}, content_type='application/json', **headers)
        self.assertEqual(r.status_code, 400)


class AuthTest(TestCase):
    def test_register(self):
        r = self.client.post('/api/auth/register/', {
            'username': 'new', 'email': 'n@t.com', 'password': 'secure123!',
            'password2': 'secure123!', 'first_name': 'New', 'last_name': 'User',
        }, content_type='application/json')
        self.assertEqual(r.status_code, 201)
        self.assertIn('tokens', r.json())

    def test_password_change(self):
        user = User.objects.create_user(username='pwuser', password='old12345!')
        r = self.client.post('/api/auth/token/', {'username': 'pwuser', 'password': 'old12345!'}, content_type='application/json')
        token = r.json()['access']
        r2 = self.client.post('/api/auth/change-password/', {
            'current_password': 'old12345!', 'new_password': 'new12345!', 'confirm_password': 'new12345!',
        }, content_type='application/json', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(r2.status_code, 200)

    def test_guest_order_lookup(self):
        from orders.models import Order
        Order.objects.create(
            order_number='UL-TEST-001', email='guest@t.com', status='confirmed',
            payment_method='credit_card', subtotal=50, total=54, shipping_name='G',
            shipping_address='1', shipping_city='X', shipping_state='X', shipping_zip='1',
        )
        r = self.client.post('/api/orders/lookup/', {
            'order_number': 'UL-TEST-001', 'email': 'guest@t.com',
        }, content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['order_number'], 'UL-TEST-001')
