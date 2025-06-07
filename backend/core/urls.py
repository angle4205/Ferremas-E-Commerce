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
)
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

urlpatterns = [
    # Admin y Landing
    path('admin/', admin.site.urls),
    path('', LandingView.as_view(), name='landing'),

    # API Autenticación
    path('api/auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('api/auth/logout/', LogoutAPIView.as_view(), name='api-logout'),
    path('api/auth/register/', RegisterAPIView.as_view(), name='api-register'),
    
    # CSRF Token para peticiones AJAX
    path('api/csrf/', CSRFTokenView.as_view(), name='api-csrf'),
    
    # API Usuario
    path('api/usuario/perfil/', PerfilUsuarioAPIView.as_view(), name='usuario-perfil'),

    # API Productos (visible para clientes y empleados)
    path('api/productos/', ProductoListAPIView.as_view(), name='productos-list'),
    path("api/categorias/", CategoriaListAPIView.as_view()),

    # API Empleados - Turnos y perfil
    path('api/empleados/marcar_entrada/', MarcarEntradaAPIView.as_view(), name='empleado-marcar-entrada'),
    path('api/empleados/marcar_salida/', MarcarSalidaAPIView.as_view(), name='empleado-marcar-salida'),
    path('api/empleados/perfil/', PerfilEmpleadoAPIView.as_view(), name='empleado-perfil'),

    # API Bodeguero - Pedidos asignados
    path('api/bodeguero/ordenes/', BodegueroOrdenesAPIView.as_view(), name='bodeguero-ordenes'),
    path('api/bodeguero/ordenes/<int:pedido_id>/', BodegueroOrdenEstadoAPIView.as_view(), name='bodeguero-orden-estado'),

    # API Contador - Reportes
    path('api/contador/reportes/', ContadorReportesAPIView.as_view(), name='contador-reportes'),

    # API Admin - Gestión de empleados
    path('api/admin/empleados/', AdminEmpleadosListAPIView.as_view(), name='admin-empleados-list'),
    path('api/admin/empleados/<int:empleado_id>/', AdminEmpleadoDetailAPIView.as_view(), name='admin-empleado-detalle'),
]

# Soporte para archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)