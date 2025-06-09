from django.views.generic import View
from django.http import FileResponse, Http404
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from .models import Producto, UserProfile, Pedido, ItemPedido, Categoria
from .serializers import (
    ProductoSerializer,
    ProductoEnItemPedidoSerializer,
    ItemPedidoSerializer,
    PedidoSimpleSerializer,
    UserProfileSerializer,
)
from django.utils import timezone
from django.db import models
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.http import JsonResponse

# --- Vistas de navegación ---

class LandingView(View):
    """Renderiza la landing page estática del proyecto."""

    def get(self, request, *args, **kwargs):
        index_path = os.path.join(
            settings.BASE_DIR, "core", "static", "landing", "index.html"
        )
        try:
            return FileResponse(open(index_path, "rb"), content_type="text/html")
        except FileNotFoundError:
            raise Http404("No se encontró index.html, ¿ejecutaste 'npm run build'?")

# --- Permisos personalizados ---


class IsEmpleado(permissions.BasePermission):
    """Permite acceso solo a empleados autenticados."""

    def has_permission(self, request, view):
        return (
            hasattr(request.user, "profile")
            and getattr(request.user.profile.rol, "nombre", None) == "EMPLEADO"
        )


class IsBodeguero(permissions.BasePermission):
    """Permite acceso solo a empleados con subrol BODEGUERO."""

    def has_permission(self, request, view):
        return (
            hasattr(request.user, "profile")
            and request.user.profile.tipo_empleado == "BODEGUERO"
        )


class IsContador(permissions.BasePermission):
    """Permite acceso solo a empleados con subrol CONTADOR."""

    def has_permission(self, request, view):
        return (
            hasattr(request.user, "profile")
            and request.user.profile.tipo_empleado == "CONTADOR"
        )


class IsAdminEmpleado(permissions.BasePermission):
    """Permite acceso solo a empleados con rol ADMINISTRADOR."""

    def has_permission(self, request, view):
        return (
            hasattr(request.user, "profile")
            and getattr(request.user.profile.rol, "nombre", None) == "ADMINISTRADOR"
        )


# --- Helpers privados y mixins ---


def _respuesta_ok(data=None, mensaje="", status_code=status.HTTP_200_OK):
    resp = {"success": True, "mensaje": mensaje}
    if data is not None:
        resp.update(data)
    return Response(resp, status=status_code)


def _respuesta_error(mensaje, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"success": False, "mensaje": mensaje}, status=status_code)


def _user_equiv(user1, user2):
    """
    Compara robustamente si dos usuarios son equivalentes, considerando User y UserProfile.
    """
    if user1 is None or user2 is None:
        return False
    # Si ambos son UserProfile
    if isinstance(user1, UserProfile) and isinstance(user2, UserProfile):
        return user1.pk == user2.pk
    # Si ambos son User
    if (
        hasattr(user1, "pk")
        and hasattr(user2, "pk")
        and user1.__class__.__name__ == "User"
        and user2.__class__.__name__ == "User"
    ):
        return user1.pk == user2.pk
    # Si uno es User y otro UserProfile
    if isinstance(user1, UserProfile) and hasattr(user2, "pk"):
        return user1.user_id == user2.pk
    if isinstance(user2, UserProfile) and hasattr(user1, "pk"):
        return user2.user_id == user1.pk
    return False


def _bodeguero_asignado_equals_user(asignado, user):
    """
    Compara robustamente si el usuario autenticado es el bodeguero asignado al pedido.
    Soporta asignado como User o UserProfile.
    """
    return _user_equiv(asignado, user) or _user_equiv(
        asignado, getattr(user, "profile", None)
    )


def _get_pedido_bodeguero(pedido_id, user):
    pedido = get_object_or_404(
        Pedido.objects.select_related(
            "bodeguero_asignado", "cliente", "direccion_envio"
        ).prefetch_related("items__producto"),
        id=pedido_id,
    )
    if not _bodeguero_asignado_equals_user(pedido.bodeguero_asignado, user):
        return None
    return pedido


def _validar_transicion_estado_pedido(estado_actual, nuevo_estado):
    """
    Valida reglas de negocio para transición de estados de pedido.
    No permite saltos no permitidos ni estados administrativos.
    """
    flujo = {
        "SOLICITADO": ["PREPARACION"],
        "PREPARACION": ["ENVIADO", "LISTO_RETIRO"],
        "ENVIADO": ["ENTREGADO"],
        "LISTO_RETIRO": ["ENTREGADO"],
        "ENTREGADO": [],
    }
    if nuevo_estado == "CANCELADO":
        return False
    return nuevo_estado in flujo.get(estado_actual, [])


class PaginacionFerremas(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


# --- API Views ---

class ProductoListAPIView(APIView):
    """
    Lista todos los productos disponibles para el frontend.
    """

    def get(self, request):
        productos = Producto.objects.filter(disponible=True)
        serializer = ProductoSerializer(
            productos, many=True, context={"request": request}
        )
        return Response(serializer.data)

class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"success": True, "mensaje": "Login exitoso"})
        return Response(
            {"success": False, "mensaje": "Credenciales incorrectas"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class LogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"success": True, "mensaje": "Logout exitoso"})


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth.models import User

        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        if not username or not password or not email:
            return Response(
                {"success": False, "mensaje": "Faltan campos obligatorios"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(username=username).exists():
            return Response(
                {"success": False, "mensaje": "El usuario ya existe"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.create_user(
            username=username, email=email, password=password
        )
        return Response(
            {"success": True, "mensaje": "Usuario registrado correctamente"}
        )


class PerfilUsuarioAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "profile", None)
        cliente = getattr(user, "cliente", None)
        direcciones = [
            {
                "id": addr.id,
                "address": addr.address,
                "is_default": addr.is_default,
                "latitude": addr.latitude,
                "longitude": addr.longitude,
            }
            for addr in getattr(user, "addresses", []).all()
        ]
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "rol": getattr(profile.rol, "nombre", None) if profile else None,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "cliente": {
                "email": cliente.email,
                "fecha_registro": cliente.fecha_registro,
            } if cliente else None,
            "direcciones": direcciones,
        }
        return Response(data)


class MarcarEntradaAPIView(APIView):
    """
    Permite a cualquier empleado marcar su entrada a turno.
    """

    permission_classes = [permissions.IsAuthenticated, IsEmpleado]

    def post(self, request):
        empleado = getattr(request.user, "profile", None)
        if not empleado:
            return _respuesta_error(
                "No se encontró el perfil de empleado.", status.HTTP_403_FORBIDDEN
            )
        if empleado.en_turno:
            return _respuesta_error("Ya estás en turno.", status.HTTP_400_BAD_REQUEST)
        empleado.marcar_entrada()
        serializer = UserProfileSerializer(empleado)
        return _respuesta_ok(
            {"empleado": serializer.data}, "Entrada a turno registrada correctamente."
        )


class MarcarSalidaAPIView(APIView):
    """
    Permite a cualquier empleado marcar su salida de turno.
    """

    permission_classes = [permissions.IsAuthenticated, IsEmpleado]

    def post(self, request):
        empleado = getattr(request.user, "profile", None)
        if not empleado:
            return _respuesta_error(
                "No se encontró el perfil de empleado.", status.HTTP_403_FORBIDDEN
            )
        if not empleado.en_turno:
            return _respuesta_error("No estás en turno.", status.HTTP_400_BAD_REQUEST)
        empleado.marcar_salida()
        serializer = UserProfileSerializer(empleado)
        return _respuesta_ok(
            {"empleado": serializer.data}, "Salida de turno registrada correctamente."
        )


class PerfilEmpleadoAPIView(APIView):
    """
    Devuelve el perfil y subrol del usuario autenticado.
    """

    permission_classes = [permissions.IsAuthenticated, IsEmpleado]

    def get(self, request):
        empleado = getattr(request.user, "profile", None)
        if not empleado:
            return _respuesta_error(
                "No se encontró el perfil de empleado.", status.HTTP_403_FORBIDDEN
            )
        serializer = UserProfileSerializer(empleado)
        return _respuesta_ok({"empleado": serializer.data})


class BodegueroOrdenesAPIView(APIView):
    """
    Permite al bodeguero ver sus pedidos asignados, paginados.
    """

    permission_classes = [permissions.IsAuthenticated, IsBodeguero]

    def get(self, request):
        bodeguero = request.user
        # Incluye ambos tipos de asignación (User o UserProfile)
        pedidos = (
            Pedido.objects.filter(
                models.Q(bodeguero_asignado=bodeguero)
                | models.Q(bodeguero_asignado=getattr(bodeguero, "profile", None))
            )
            .select_related("cliente", "direccion_envio")
            .prefetch_related("items__producto")
            .order_by("-fecha_creacion")
        )
        paginator = PaginacionFerremas()
        page = paginator.paginate_queryset(pedidos, request)
        serializer = PedidoSimpleSerializer(page, many=True)
        return paginator.get_paginated_response(
            {
                "success": True,
                "pedidos": serializer.data,
                "mensaje": "Pedidos asignados listados correctamente.",
            }
        )


class BodegueroOrdenEstadoAPIView(APIView):
    """
    Permite al bodeguero cambiar el estado de un pedido asignado, validando el nuevo estado y la transición.
    """

    permission_classes = [permissions.IsAuthenticated, IsBodeguero]
    ESTADOS_PERMITIDOS = ["PREPARACION", "ENVIADO", "ENTREGADO", "LISTO_RETIRO"]

    def patch(self, request, pedido_id):
        bodeguero = request.user
        pedido = _get_pedido_bodeguero(pedido_id, bodeguero)
        if not pedido:
            return _respuesta_error(
                "No tienes permiso para modificar este pedido.",
                status.HTTP_403_FORBIDDEN,
            )
        nuevo_estado = request.data.get("estado")
        if not nuevo_estado:
            return _respuesta_error(
                "Debes indicar el nuevo estado.", status.HTTP_400_BAD_REQUEST
            )
        if nuevo_estado not in self.ESTADOS_PERMITIDOS:
            return _respuesta_error(
                "Estado no permitido para el bodeguero.", status.HTTP_400_BAD_REQUEST
            )
        if pedido.estado == nuevo_estado:
            return _respuesta_error(
                "El pedido ya está en ese estado.", status.HTTP_400_BAD_REQUEST
            )
        if not _validar_transicion_estado_pedido(pedido.estado, nuevo_estado):
            return _respuesta_error(
                "Transición de estado no permitida según el flujo de trabajo.",
                status.HTTP_400_BAD_REQUEST,
            )
        pedido.actualizar_estado(nuevo_estado, bodeguero)
        serializer = PedidoSimpleSerializer(pedido)
        return _respuesta_ok(
            {"pedido": serializer.data}, "Estado del pedido actualizado."
        )


class ContadorReportesAPIView(APIView):
    """
    Permite al contador ver reportes financieros básicos.
    """

    permission_classes = [permissions.IsAuthenticated, IsContador]

    def get(self, request):
        total_ventas = (
            Pedido.objects.filter(estado="ENTREGADO").aggregate(
                total=models.Sum("total")
            )["total"]
            or 0
        )
        pedidos_entregados = Pedido.objects.filter(estado="ENTREGADO").count()
        pedidos_cancelados = Pedido.objects.filter(estado="CANCELADO").count()
        return _respuesta_ok(
            {
                "total_ventas": total_ventas,
                "pedidos_entregados": pedidos_entregados,
                "pedidos_cancelados": pedidos_cancelados,
            },
            "Reporte financiero generado correctamente.",
        )


class AdminEmpleadosListAPIView(APIView):
    """
    Permite al administrador listar todos los empleados, paginados.
    """

    permission_classes = [permissions.IsAuthenticated, IsAdminEmpleado]

    def get(self, request):
        empleados = (
            UserProfile.objects.select_related("user", "rol", "sucursal")
            .all()
            .order_by("user__username")
        )
        paginator = PaginacionFerremas()
        page = paginator.paginate_queryset(empleados, request)
        serializer = UserProfileSerializer(page, many=True)
        return paginator.get_paginated_response(
            {
                "success": True,
                "empleados": serializer.data,
                "mensaje": "Empleados listados correctamente.",
            }
        )


class AdminEmpleadoDetailAPIView(APIView):
    """
    Permite al administrador ver el detalle de un empleado.
    """

    permission_classes = [permissions.IsAuthenticated, IsAdminEmpleado]

    def get(self, request, empleado_id):
        empleado = get_object_or_404(
            UserProfile.objects.select_related("user", "rol", "sucursal"),
            id=empleado_id,
        )
        serializer = UserProfileSerializer(empleado)
        return _respuesta_ok({"empleado": serializer.data})


class CategoriaListAPIView(APIView):
    def get(self, request):
        categorias = Categoria.objects.all()
        data = [
            {"id": cat.id, "nombre": cat.nombre, "descripcion": cat.descripcion}
            for cat in categorias
        ]
        return Response(data)
    
@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFTokenView(APIView):
    """
    Devuelve un set-cookie con el token CSRF para el frontend.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # El decorador ya se encarga de setear la cookie
        return JsonResponse({"success": True, "mensaje": "CSRF cookie set"})