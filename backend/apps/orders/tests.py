from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from apps.orders.models import Order, OrderItem
from apps.products.models import Product, ProductVariant
from apps.users.models import UserAuth


