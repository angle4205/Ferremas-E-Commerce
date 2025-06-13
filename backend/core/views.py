from django.views.generic import View
from django.http import FileResponse, Http404
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from .models import Producto, UserProfile, Pedido, ItemPedido, Categoria, Cliente, TurnoEmpleado
from django.utils import timezone
from django.db import models
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.db.models import Sum, Count
from .models import Cart, ItemCarrito
import stripe
from .serializers import (
    ProductoSerializer,
    ProductoEnItemPedidoSerializer,
    ItemPedidoSerializer,
    PedidoSimpleSerializer,
    PedidoDetailSerializer,
    UserProfileSerializer,
    ItemCarritoSerializer,
)


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

class CartAPIView(APIView):
    """
    Devuelve los items del carrito y el total.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtener el carrito del usuario autenticado
        cart, _ = Cart.objects.get_or_create(user=request.user, estado="ACTIVO")
        # Filtrar solo items cuyo producto existe y está disponible
        items = ItemCarrito.objects.filter(carrito=cart, producto__isnull=False, producto__disponible=True)
        total = sum(item.subtotal() for item in items)
        return Response({
            "items": ItemCarritoSerializer(items, many=True).data,
            "total": total
        })

class CartItemCreateAPIView(APIView):
    """
    Agrega un producto al carrito del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        producto_id = request.data.get("producto_id")
        cantidad = request.data.get("cantidad", 1)
        if not producto_id:
            return Response({"error": "Falta el producto_id."}, status=400)
        try:
            producto = Producto.objects.get(id=producto_id, disponible=True)
        except Producto.DoesNotExist:
            return Response({"error": "Producto no encontrado o no disponible."}, status=404)
        cart, _ = Cart.objects.get_or_create(user=request.user, estado="ACTIVO")
        item, created = ItemCarrito.objects.get_or_create(
            carrito=cart,
            producto=producto,
            defaults={"precio_unitario": producto.valor}
        )
        if not created:
            item.cantidad += int(cantidad)
        else:
            item.cantidad = int(cantidad)
            item.precio_unitario = producto.valor  # Asegura que siempre tenga precio
        item.save()
        return Response(ItemCarritoSerializer(item).data, status=201)

class CartItemUpdateAPIView(APIView):
    """
    Actualiza la cantidad de un producto en el carrito.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        try:
            item = ItemCarrito.objects.get(id=item_id, carrito__user=request.user, carrito__estado="ACTIVO")
            cantidad = request.data.get("cantidad") or request.data.get("quantity")
            if not cantidad or int(cantidad) < 1:
                return Response({"error": "La cantidad debe ser mayor a 0."}, status=status.HTTP_400_BAD_REQUEST)
            item.cantidad = int(cantidad)
            item.save()
            return Response(ItemCarritoSerializer(item).data)
        except ItemCarrito.DoesNotExist:
            return Response({"error": "El item no existe o no pertenece al carrito activo."}, status=status.HTTP_404_NOT_FOUND)

class CartItemDeleteAPIView(APIView):
    """
    Elimina un producto del carrito.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        try:
            item = ItemCarrito.objects.get(id=item_id, carrito__user=request.user, carrito__estado="ACTIVO")
            item.delete()
            return Response({"success": "El item fue eliminado del carrito."}, status=status.HTTP_204_NO_CONTENT)
        except ItemCarrito.DoesNotExist:
            return Response({"error": "El item no existe o no pertenece al carrito activo."}, status=status.HTTP_404_NOT_FOUND)

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

class TurnoHistorialAPIView(APIView):
    """
    Devuelve el historial de turnos del empleado autenticado.
    """

    permission_classes = [permissions.IsAuthenticated, IsEmpleado]

    def get(self, request):
        empleado = getattr(request.user, "profile", None)
        if not empleado:
            return _respuesta_error(
                "No se encontró el perfil de empleado.", status.HTTP_403_FORBIDDEN
            )
        turnos = TurnoEmpleado.objects.filter(empleado=empleado).order_by('-entrada')
        data = [
            {
                "id": turno.id,
                "entrada": turno.entrada,
                "salida": turno.salida,
                "comprobante_entrada": turno.comprobante_entrada.url if turno.comprobante_entrada else None,
                "duracion_horas": turno.duracion_horas(),
            }
            for turno in turnos
        ]
        return _respuesta_ok({"historial_turnos": data})

class BodegueroOrdenesAPIView(APIView):
    """
    Permite al bodeguero ver sus pedidos asignados, paginados.
    """

    permission_classes = [permissions.IsAuthenticated, IsBodeguero]

    def get(self, request):
        bodeguero = request.user
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

class AdminOverviewAPIView(APIView):
    """
    Devuelve el resumen general para el dashboard de administrador.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ingresos totales (solo pedidos entregados)
        total_revenue = Pedido.objects.filter(estado="ENTREGADO").aggregate(
            total=Sum("total")
        )["total"] or 0

        # Ingresos del mes anterior
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        last_month = now - timedelta(days=30)
        revenue_last_month = Pedido.objects.filter(
            estado="ENTREGADO", fecha_creacion__gte=last_month
        ).aggregate(total=Sum("total"))["total"] or 0

        # Órdenes totales y cambio
        orders = Pedido.objects.filter(estado="ENTREGADO").count()
        orders_last_month = Pedido.objects.filter(
            estado="ENTREGADO", fecha_creacion__gte=last_month
        ).count()

        # Clientes totales y cambio
        customers = Cliente.objects.count()
        customers_last_month = Cliente.objects.filter(
            fecha_registro__gte=last_month
        ).count()

        # Valor inventario (suma de stock * valor de cada producto)
        from .models import Producto
        inventory_value = sum([
            int(p.stock) * int(p.valor)
            for p in Producto.objects.all()
        ])

        # Cambios porcentuales (evita división por cero)
        def percent_change(current, previous):
            if previous == 0:
                return 0.0
            return ((current - previous) / previous) * 100

        data = {
            "total_revenue": total_revenue,
            "revenue_change": percent_change(revenue_last_month, total_revenue),
            "orders": orders,
            "orders_change": percent_change(orders_last_month, orders),
            "customers": customers,
            "customers_change": percent_change(customers_last_month, customers),
            "inventory_value": inventory_value,
            "inventory_change": 0.0,  # Puedes calcularlo si tienes histórico
        }
        return Response(data)

# --- Órdenes para dashboard admin: listar, asignar, modificar ---

class AdminOrderListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminEmpleado]

    def get(self, request):
        pedidos = Pedido.objects.select_related("cliente", "bodeguero_asignado").order_by("-fecha_creacion")
        serializer = PedidoSimpleSerializer(pedidos, many=True)
        return Response(serializer.data)

class AdminOrderAssignAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminEmpleado]

    def post(self, request, pedido_id):
        pedido = get_object_or_404(Pedido, id=pedido_id)
        bodeguero_id = request.data.get("bodeguero_id")
        if bodeguero_id:
            bodeguero = get_object_or_404(UserProfile, id=bodeguero_id)
            pedido.bodeguero_asignado = bodeguero
            pedido.save()
            return Response({"success": True, "mensaje": "Bodeguero asignado manualmente."})
        # Asignación automática (ejemplo simple: primer bodeguero disponible)
        bodegueros = UserProfile.objects.filter(tipo_empleado="BODEGUERO", en_turno=True)
        if bodegueros.exists():
            pedido.bodeguero_asignado = bodegueros.first()
            pedido.save()
            return Response({"success": True, "mensaje": "Bodeguero asignado automáticamente."})
        return Response({"success": False, "mensaje": "No hay bodegueros disponibles."}, status=400)

class AdminOrderUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminEmpleado]

    def patch(self, request, pedido_id):
        pedido = get_object_or_404(Pedido, id=pedido_id)
        estado = request.data.get("estado")
        if estado:
            pedido.actualizar_estado(estado, request.user)
        # Otros campos editables...
        serializer = PedidoDetailSerializer(pedido)
        return Response(serializer.data)

# --- Reportes financieros para admin ---

class AdminFinancialReportAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminEmpleado]

    def get(self, request):
        total_ventas = Pedido.objects.filter(estado="ENTREGADO").aggregate(total=Sum("total"))["total"] or 0
        pedidos_entregados = Pedido.objects.filter(estado="ENTREGADO").count()
        pedidos_cancelados = Pedido.objects.filter(estado="CANCELADO").count()
        return Response({
            "total_ventas": total_ventas,
            "pedidos_entregados": pedidos_entregados,
            "pedidos_cancelados": pedidos_cancelados,
        })

@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFTokenView(APIView):
    """
    Devuelve un set-cookie con el token CSRF para el frontend.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # El decorador ya se encarga de setear la cookie
        return JsonResponse({"success": True, "mensaje": "CSRF cookie set"})

class StripePaymentAPIView(APIView):
    """
    Inicia el pago con Stripe Checkout Session para el carrito activo del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        # Obtén el carrito activo del usuario
        try:
            cart = Cart.objects.get(user=request.user, estado="ACTIVO")
        except Cart.DoesNotExist:
            return Response({"error": "No hay carrito activo."}, status=400)

        cart.calcular_totales()
        total_stripe = cart.total_para_stripe()
        if total_stripe < 50:
            return Response({"error": "El monto mínimo para pagar es $50 CLP."}, status=400)

        # Construye los items para Stripe Checkout
        line_items = []
        for item in cart.items.all():
            line_items.append({
                "price_data": {
                    "currency": "clp",
                    "product_data": {
                        "name": item.producto.nombre,
                    },
                    "unit_amount": int(item.precio_unitario),  # en CLP
                },
                "quantity": item.cantidad,
            })

        # URL de éxito y cancelación (ajusta según tu frontend)
        success_url = settings.FRONTEND_URL + "/pago/exito"
        cancel_url = settings.FRONTEND_URL + "/carrito"

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=cancel_url,
                metadata={"user_id": request.user.id, "cart_id": cart.id},
                customer_email=request.user.email,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        # Aquí puedes crear el Pedido y Pago como antes si lo necesitas

        return Response({"sessionId": session.id})