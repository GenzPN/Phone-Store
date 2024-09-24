from django.urls import path, include

urlpatterns = [
    path('auth/', include('api.routes.auth')),
    path('products/', include('api.routes.products')),
    path('users/', include('api.routes.users')),
    path('orders/', include('api.routes.orders')),
    path('cart/', include('api.routes.cart')),
    path('cookie/', include('api.routes.cookie')),
    path('settings/', include('api.routes.settings')),
]
