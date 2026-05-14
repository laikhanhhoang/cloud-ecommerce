from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from apps.orders.models import Order, OrderItem
from apps.products.models import Product, ProductVariant
from apps.users.models import UserAuth


class CartAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = UserAuth.objects.create_user(
            email="user1@example.com",
            username="user1",
            password="password123",
        )
        self.other_user = UserAuth.objects.create_user(
            email="user2@example.com",
            username="user2",
            password="password123",
        )

        self.product = Product.objects.create(
            name="Test Product",
            base_price=Decimal("1000"),
            brand="Brand",
            category="Category",
            description="Desc",
            specs={},
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            price=Decimal("1500"),
            version="2024",
            color="Black",
            stock=10,
        )

    def test_get_cart_no_cart_returns_message(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/cart/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get("message"), "Người dùng chưa có cart.")

    def test_get_cart_count_no_cart_returns_zero(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/cart/count/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get("count"), 0)

    def test_get_cart_count_with_items_returns_sum_quantity(self):
        cart = Order.objects.create(user=self.user, status=Order.Status.IN_CART, total_amount=0)
        OrderItem.objects.create(
            order=cart,
            product_variant=self.variant,
            quantity=2,
            unit_price=self.variant.price,
        )

        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/cart/count/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get("count"), 2)

    def test_add_item_creates_cart_and_item(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(
            "/api/cart/items/",
            {"product_variant_id": self.variant.id, "quantity": 2},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get("message"), "Đã thêm sản phẩm vào giỏ hàng.")

        cart = Order.objects.filter(user=self.user, status=Order.Status.IN_CART).first()
        self.assertIsNotNone(cart)

        item = OrderItem.objects.filter(order=cart, product_variant=self.variant).first()
        self.assertIsNotNone(item)
        self.assertEqual(item.quantity, 2)

    def test_add_item_accumulates_quantity(self):
        self.client.force_authenticate(user=self.user)

        self.client.post(
            "/api/cart/items/",
            {"product_variant_id": self.variant.id, "quantity": 1},
            format="json",
        )
        self.client.post(
            "/api/cart/items/",
            {"product_variant_id": self.variant.id, "quantity": 3},
            format="json",
        )

        cart = Order.objects.filter(user=self.user, status=Order.Status.IN_CART).first()
        item = OrderItem.objects.get(order=cart, product_variant=self.variant)
        self.assertEqual(item.quantity, 4)

    def test_add_item_variant_not_found_returns_404(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(
            "/api/cart/items/",
            {"product_variant_id": 999999, "quantity": 1},
            format="json",
        )
        self.assertEqual(res.status_code, 404)
        # Custom exception handler wraps DRF errors
        self.assertIn("error", res.data)

    def test_add_item_over_stock_returns_400(self):
        self.variant.stock = 2
        self.variant.save(update_fields=["stock"])

        self.client.force_authenticate(user=self.user)
        res = self.client.post(
            "/api/cart/items/",
            {"product_variant_id": self.variant.id, "quantity": 3},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.data)

    def test_patch_update_quantity_disallows_zero(self):
        cart = Order.objects.create(user=self.user, status=Order.Status.IN_CART, total_amount=0)
        item = OrderItem.objects.create(
            order=cart,
            product_variant=self.variant,
            quantity=1,
            unit_price=self.variant.price,
        )

        self.client.force_authenticate(user=self.user)
        res = self.client.patch(
            f"/api/cart/items/{item.id}/",
            {"quantity": 0},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.data)

    def test_patch_update_quantity_over_stock_returns_400(self):
        self.variant.stock = 1
        self.variant.save(update_fields=["stock"])

        cart = Order.objects.create(user=self.user, status=Order.Status.IN_CART, total_amount=0)
        item = OrderItem.objects.create(
            order=cart,
            product_variant=self.variant,
            quantity=1,
            unit_price=self.variant.price,
        )

        self.client.force_authenticate(user=self.user)
        res = self.client.patch(
            f"/api/cart/items/{item.id}/",
            {"quantity": 2},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.data)

    def test_patch_update_quantity_other_users_item_returns_404(self):
        cart = Order.objects.create(user=self.other_user, status=Order.Status.IN_CART, total_amount=0)
        item = OrderItem.objects.create(
            order=cart,
            product_variant=self.variant,
            quantity=1,
            unit_price=self.variant.price,
        )

        self.client.force_authenticate(user=self.user)
        res = self.client.patch(
            f"/api/cart/items/{item.id}/",
            {"quantity": 2},
            format="json",
        )
        self.assertEqual(res.status_code, 404)
        self.assertIn("error", res.data)

    def test_patch_update_quantity_item_not_found_returns_404(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.patch(
            "/api/cart/items/999999/",
            {"quantity": 2},
            format="json",
        )
        self.assertEqual(res.status_code, 404)
        self.assertIn("error", res.data)

    def test_delete_item_keeps_empty_cart_order(self):
        cart = Order.objects.create(user=self.user, status=Order.Status.IN_CART, total_amount=0)
        item = OrderItem.objects.create(
            order=cart,
            product_variant=self.variant,
            quantity=1,
            unit_price=self.variant.price,
        )

        self.client.force_authenticate(user=self.user)
        res = self.client.delete(f"/api/cart/items/{item.id}/")
        self.assertEqual(res.status_code, 200)

        cart.refresh_from_db()
        self.assertTrue(Order.objects.filter(pk=cart.pk).exists())
        self.assertEqual(cart.total_amount, Decimal("0"))
        self.assertEqual(OrderItem.objects.filter(order=cart).count(), 0)

    def test_delete_other_users_item_returns_404(self):
        cart = Order.objects.create(user=self.other_user, status=Order.Status.IN_CART, total_amount=0)
        item = OrderItem.objects.create(
            order=cart,
            product_variant=self.variant,
            quantity=1,
            unit_price=self.variant.price,
        )

        self.client.force_authenticate(user=self.user)
        res = self.client.delete(f"/api/cart/items/{item.id}/")
        self.assertEqual(res.status_code, 404)
        self.assertIn("error", res.data)

    def test_get_cart_syncs_unit_price_for_in_cart(self):
        cart = Order.objects.create(user=self.user, status=Order.Status.IN_CART, total_amount=0)
        item = OrderItem.objects.create(
            order=cart,
            product_variant=self.variant,
            quantity=1,
            unit_price=Decimal("9999.00"),
        )

        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/cart/")
        self.assertEqual(res.status_code, 200)

        item.refresh_from_db()
        self.assertEqual(item.unit_price, self.variant.price)

    def test_unauthenticated_returns_401(self):
        res = self.client.get("/api/cart/")
        self.assertEqual(res.status_code, 401)
