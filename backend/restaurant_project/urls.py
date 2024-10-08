from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from restaurant_app.views import (
    CategoryViewSet,
    DishViewSet,
    OrderStatusUpdateViewSet,
    OrderViewSet,
    NotificationViewSet,
    BillViewSet,
    LoginViewSet,
    PasscodeLoginView,
    LogoutView,
    FloorViewSet,
    TableViewSet,
    CouponViewSet,
    MenuViewSet,
    MenuItemViewSet,
    MessViewSet,
    MessTypeViewSet,
    SearchDishesAPIView,
    CreditUserViewSet,
    CreditOrderViewSet,
    TransactionViewSet,

)
from delivery_drivers.views import (
    DeliveryDriverViewSet,
    DeliveryOrderViewSet,
)


router = DefaultRouter()

router.register(r"login", LoginViewSet, basename="login")
router.register(r"dishes", DishViewSet, basename="dishes")
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"orders", OrderViewSet, basename="orders")
router.register(r"bills", BillViewSet, basename="bills")
router.register(r"notifications", NotificationViewSet, basename="notifications")
router.register(r"floors", FloorViewSet, basename="floors")
router.register(r"tables", TableViewSet, basename="tables")
router.register(r"coupons", CouponViewSet, basename="coupons")
router.register(r"mess-types", MessTypeViewSet, basename="mess_types")
router.register(r"menus", MenuViewSet, basename="menus")
router.register(r"menu-items", MenuItemViewSet, basename="menu_items")
router.register(r"messes", MessViewSet, basename="messes")
router.register(r'transactions', TransactionViewSet, basename="transactions")

# Credit User URLs
router.register(r"credit-users", CreditUserViewSet, basename="credit_users")
router.register(r"credit-orders", CreditOrderViewSet, basename="credit_orders")

# Delivery Driver URLs
router.register(r"delivery-drivers", DeliveryDriverViewSet, basename="delivery_drivers")
router.register(r"delivery-orders", DeliveryOrderViewSet, basename="delivery_orders")

# for updating the status of the order
router.register(r'order-status', OrderStatusUpdateViewSet, basename='order-status')


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/login-passcode/", PasscodeLoginView.as_view(), name="login-passcode"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/logout/", LogoutView.as_view({"post": "logout"}), name="logout"),
    path(
        "api/search-dishes/", SearchDishesAPIView.as_view(), name="search_dishes"
    ),  # Include the search API endpoint
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
