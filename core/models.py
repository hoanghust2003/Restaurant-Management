from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('chef', 'Chef'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

class Table(models.Model):
    table_number = models.IntegerField(unique=True)
    status = models.CharField(max_length=20)

class MenuItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField()
    description = models.TextField(null=True, blank=True)

class Ingredient(models.Model):
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=50)
    threshold = models.FloatField(default=0)

class Inventory(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField()
    expiry_date = models.DateField()
    storage_location = models.CharField(max_length=100)

class Order(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    order_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField()

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    reservation_time = models.DateTimeField()
    status = models.CharField(max_length=50)

class UsageLog(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    used_quantity = models.FloatField()
    used_date = models.DateTimeField(auto_now_add=True)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
