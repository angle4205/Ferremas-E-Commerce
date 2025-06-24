"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import (
    LandingView,
    ProductoListAPIView,
    MarcarEntradaAPIView,
    MarcarSalidaAPIView,
    PerfilEmpleadoAPIView,
    BodegueroOrdenesAPIView,
    BodegueroOrdenEstadoAPIView,
    ContadorReportesAPIView,
    AdminEmpleadosListAPIView,
    AdminEmpleadoDetailAPIView,
    CategoriaListAPIView,
    LoginAPIView, 
    LogoutAPIView, 
    RegisterAPIView,
    PerfilUsuarioAPIView,
    CSRFTokenView,
    AdminOverviewAPIView,
    AdminOrderListAPIView,
    AdminOrderAssignAPIView,
    AdminOrderUpdateAPIView,
    AdminFinancialReportAPIView,
    TurnoHistorialAPIView,
    CartAPIView, 
    CartItemUpdateAPIView, 
    CartItemDeleteAPIView,
    CartItemCreateAPIView,
    StripePaymentAPIView,
)
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse

urlpatterns = [
    # Admin y Landing
    path('admin/', admin.site.urls),
    path('', LandingView.as_view(), name='landing'),

    # CSRF Token para peticiones AJAX
    path('api/csrf/', CSRFTokenView.as_view(), name='api-csrf'),

    # API Autenticación
    path('api/auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/auth/logout/', LogoutAPIView.as_view(), name='api-logout'),
    path('api/auth/register/', RegisterAPIView.as_view(), name='api-register'),
    
    # API Usuario
    path('api/usuario/perfil/', PerfilUsuarioAPIView.as_view(), name='usuario-perfil'),

    # API Productos y Categorías
    path('api/productos/', ProductoListAPIView.as_view(), name='productos-list'),
    path("api/categorias/", CategoriaListAPIView.as_view()),

    # API Carrito
    path("api/cart/", CartAPIView.as_view(), name="cart"),
    path("api/cart/items/<int:item_id>/", CartItemUpdateAPIView.as_view(), name="cart-item-update"),
    path("api/cart/items/<int:item_id>/delete/", CartItemDeleteAPIView.as_view(), name="cart-item-delete"),
    path("api/cart/items/", CartItemCreateAPIView.as_view(), name="cart-item-create"),

    # API Stripe
    path('api/pago/stripe/', StripePaymentAPIView.as_view(), name='stripe-payment'),

    # API Empleados
    path('api/empleados/marcar_entrada/', MarcarEntradaAPIView.as_view(), name='empleado-marcar-entrada'),
    path('api/empleados/marcar_salida/', MarcarSalidaAPIView.as_view(), name='empleado-marcar-salida'),
    path('api/empleados/perfil/', PerfilEmpleadoAPIView.as_view(), name='empleado-perfil'),
    path('api/empleados/historial_turnos/', TurnoHistorialAPIView.as_view(), name='empleado-historial-turnos'),

    # API Bodeguero 
    path('api/bodeguero/ordenes/', BodegueroOrdenesAPIView.as_view(), name='bodeguero-ordenes'),
    path('api/bodeguero/ordenes/<int:pedido_id>/', BodegueroOrdenEstadoAPIView.as_view(), name='bodeguero-orden-estado'),

    # API Contador 
    path('api/contador/reportes/', ContadorReportesAPIView.as_view(), name='contador-reportes'),

    # API Admin
    path('api/admin/orders/', AdminOrderListAPIView.as_view(), name='admin-orders-list'),
    path('api/admin/orders/<int:pedido_id>/assign/', AdminOrderAssignAPIView.as_view(), name='admin-order-assign'),
    path('api/admin/orders/<int:pedido_id>/', AdminOrderUpdateAPIView.as_view(), name='admin-order-update'),
    path('api/admin/reportes/financieros/', AdminFinancialReportAPIView.as_view(), name='admin-financial-report'),
    path('api/admin/reportes/financieros_xlsx/', AdminFinancialReportAPIView.as_view(), name='admin-financial-report-xlsx'),
    path('api/admin/overview/', AdminOverviewAPIView.as_view(), name='admin-overview'),
    path('api/admin/empleados/', AdminEmpleadosListAPIView.as_view(), name='admin-empleados-list'),
    path('api/admin/empleados/<int:empleado_id>/', AdminEmpleadoDetailAPIView.as_view(), name='admin-empleado-detalle'),
]

# Soporte para archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)