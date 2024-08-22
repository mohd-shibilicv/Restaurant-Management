from rest_framework import serializers
from django.contrib.auth import get_user_model
from restaurant_app.models import *


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'mobile_number', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class DishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dish
        fields = ['id', 'name', 'description', 'price', 'image', 'category',]


class OrderItemSerializer(serializers.ModelSerializer):
    dish = serializers.PrimaryKeyRelatedField(queryset=Dish.objects.all())

    class Meta:
        model = OrderItem
        fields = ['dish', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'created_at', 'total_amount', 'status', 'bill_generated', 'bank_amount','cash_amount','invoice_number','items','order_type','payment_method']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = self.context['request'].user
        order = Order.objects.create(customer=customer, **validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order


class BillSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)

    class Meta:
        model = Bill
        fields = ['id', 'order', 'customer', 'total_amount', 'paid', 'billed_at']


class NotificationSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'customer', 'message', 'created_at', 'is_read']


class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = ['name']

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'discount_amount',
            'discount_percentage',
            'start_date',
            'end_date',
            'is_active',
            'usage_limit',
            'usage_count',
            'min_purchase_amount',
            'description'
        ]
        read_only_fields = ['usage_count'] 


class MessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessType
        fields = ['id', 'name']

class MenuItemSerializer(serializers.ModelSerializer):
    dish = DishSerializer(read_only=True)
    dish_id = serializers.PrimaryKeyRelatedField(
        queryset=Dish.objects.all(), write_only=True, source='dish'
    )

    class Meta:
        model = MenuItem
        fields = ['id', 'menu', 'dish', 'dish_id', 'meal_type']

class MenuSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Menu
        fields = ['id', 'name', 'day_of_week','sub_total', 'is_custom', 'mess_type', 'created_by', 'menu_items']

class MessSerializer(serializers.ModelSerializer):
    mess_type = MessTypeSerializer(read_only=True) 
    mess_type_id = serializers.PrimaryKeyRelatedField(
        queryset=MessType.objects.all(), write_only=True, source='mess_type'
    ) 
    class Meta:
        model = Mess
        fields = ['id', 'customer_name', 'mobile_number', 'start_date', 'end_date', 'mess_type','mess_type_id', 'payment_method','bank_amount','cash_amount','total_amount', 'paid_amount', 'pending_amount', 'menus']
