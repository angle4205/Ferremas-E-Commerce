from rest_framework import serializers
from .models import (
    Producto,
    UserProfile,
    Pedido,
    ItemPedido,
    Categoria,
)
from django.contrib.auth.models import User

# --- ProductoSerializer (para listado de productos) ---

class ProductoSerializer(serializers.ModelSerializer):
    imagen_principal = serializers.ImageField(use_url=True)
    marca = serializers.StringRelatedField()
    categoria = serializers.StringRelatedField()

    class Meta:
        model = Producto
        fields = [
            "id", "nombre", "marca", "valor", "imagen_principal", "categoria", "disponible", "stock"
        ]

# --- ProductoEnItemPedidoSerializer (producto embebido en item de pedido) ---

class ProductoEnItemPedidoSerializer(serializers.ModelSerializer):
    marca = serializers.StringRelatedField()
    categoria = serializers.StringRelatedField()

    class Meta:
        model = Producto
        fields = ["id", "nombre", "marca", "categoria", "valor"]

# --- ItemPedidoSerializer (item de pedido, incluye producto embebido) ---

class ItemPedidoSerializer(serializers.ModelSerializer):
    producto = ProductoEnItemPedidoSerializer()

    class Meta:
        model = ItemPedido
        fields = ["id", "producto", "cantidad", "precio_unitario"]

# --- PedidoSimpleSerializer (pedido con items y cliente simplificado) ---

class PedidoSimpleSerializer(serializers.ModelSerializer):
    items = ItemPedidoSerializer(many=True, read_only=True)
    cliente = serializers.SerializerMethodField()
    direccion_envio = serializers.StringRelatedField()
    bodeguero_asignado = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            "id", "estado", "fecha_creacion", "fecha_actualizacion", "total",
            "cliente", "items", "metodo_retiro", "direccion_envio", "bodeguero_asignado"
        ]

    def get_cliente(self, obj):
        return obj.cliente.user.username if obj.cliente and obj.cliente.user else None

    def get_bodeguero_asignado(self, obj):
        if obj.bodeguero_asignado and hasattr(obj.bodeguero_asignado, "user"):
            return obj.bodeguero_asignado.user.username
        return None

# --- PedidoDetailSerializer (detalle completo de pedido) ---

class PedidoDetailSerializer(serializers.ModelSerializer):
    items = ItemPedidoSerializer(many=True, read_only=True)
    cliente = serializers.SerializerMethodField()
    direccion_envio = serializers.StringRelatedField()
    bodeguero_asignado = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            "id", "estado", "fecha_creacion", "fecha_actualizacion", "total",
            "cliente", "items", "metodo_retiro", "direccion_envio", "bodeguero_asignado"
        ]

    def get_cliente(self, obj):
        return obj.cliente.user.username if obj.cliente and obj.cliente.user else None

    def get_bodeguero_asignado(self, obj):
        if obj.bodeguero_asignado and hasattr(obj.bodeguero_asignado, "user"):
            return obj.bodeguero_asignado.user.username
        return None

# --- UserProfileSerializer (perfil de usuario extendido) ---

class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    rol = serializers.StringRelatedField()
    sucursal = serializers.StringRelatedField()

    class Meta:
        model = UserProfile
        fields = [
            "id", "user", "rol", "tipo_empleado", "en_turno", "hora_entrada",
            "hora_salida", "sucursal", "profile_picture"
        ]

# --- CategoriaSerializer (para listado de categorías) ---

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nombre", "descripcion"]