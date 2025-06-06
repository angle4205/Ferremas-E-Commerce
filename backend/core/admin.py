from django.contrib import admin
from django.utils.html import mark_safe

from .models import (
    Producto,
    ImagenProducto,
    UserProfile,
    Address,
    Cart,
    ItemCarrito,
    Rol,
    Sucursal,
    Marca,
    Categoria,
    Cliente,
    Pedido,
    ItemPedido,
    Pago,
    AuditoriaCambio,
    ValoracionProducto,
)

# --- Rol ---
@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre")
    search_fields = ("nombre",)

# --- Sucursal ---
@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "direccion", "latitud", "longitud")
    search_fields = ("nombre", "direccion")

# --- Marca ---
@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre")
    search_fields = ("nombre",)
    filter_horizontal = ["categorias"]

# --- Categoria ---
@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "descripcion")
    search_fields = ("nombre",)

# --- Cliente ---
@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "email", "fecha_registro")
    search_fields = ("user__username", "email")

# --- UserProfile ---
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "rol", "tipo_empleado", "sucursal", "en_turno", "profile_pic_preview")
    list_filter = ("rol", "tipo_empleado", "sucursal", "en_turno")
    search_fields = ("user__username",)
    readonly_fields = ("profile_pic_preview",)

    def profile_pic_preview(self, obj):
        if obj.profile_picture:
            return mark_safe(f'<img src="{obj.profile_picture.url}" width="60" />')
        return "-"
    profile_pic_preview.short_description = "Foto de perfil"

# --- Address ---
@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "address", "is_default", "latitude", "longitude")
    list_filter = ("is_default",)

# --- Producto ---
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "marca",
        "categoria",
        "sucursal",
        "nro_referencia",
        "valor",
        "stock",
        "disponible",
        "imagen_principal_preview",
    )
    list_filter = ("categoria", "marca", "sucursal", "disponible")
    readonly_fields = ("disponible", "nro_referencia", "imagen_principal_preview")
    search_fields = ("nombre", "marca__nombre", "nro_referencia")

    def imagen_principal_preview(self, obj):
        if obj.imagen_principal:
            return mark_safe(f'<img src="{obj.imagen_principal.url}" width="60" />')
        return "-"
    imagen_principal_preview.short_description = "Imagen principal"

# --- ImagenProducto ---
@admin.register(ImagenProducto)
class ImagenProductoAdmin(admin.ModelAdmin):
    list_display = ("id", "imagen_preview")
    readonly_fields = ("imagen_preview",)

    def imagen_preview(self, obj):
        if obj.imagen:
            return mark_safe(f'<img src="{obj.imagen.url}" width="60" />')
        return "-"
    imagen_preview.short_description = "Vista previa"

# --- ValoracionProducto ---
@admin.register(ValoracionProducto)
class ValoracionProductoAdmin(admin.ModelAdmin):
    list_display = ("id", "producto", "cliente", "puntaje", "comentario", "fecha")
    list_filter = ("puntaje", "fecha")
    search_fields = ("producto__nombre", "cliente__user__username")

# --- Cart ---
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "updated_at", "estado", "total", "subtotal", "iva", "metodo_despacho")
    list_filter = ("estado", "metodo_despacho")
    search_fields = ("user__username",)

# --- ItemCarrito ---
@admin.register(ItemCarrito)
class ItemCarritoAdmin(admin.ModelAdmin):
    list_display = ("carrito", "producto", "cantidad", "precio_unitario", "subtotal_display")

    def subtotal_display(self, obj):
        return obj.subtotal()
    subtotal_display.short_description = "Subtotal"

# --- Pedido ---
class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "cliente",
        "estado",
        "total",
        "fecha_creacion",
        "fecha_actualizacion",
        "bodeguero_asignado",
        "metodo_retiro",
        "direccion_envio",
    )
    list_filter = ("estado", "metodo_retiro", "fecha_creacion")
    search_fields = ("cliente__user__username", "bodeguero_asignado__username")
    inlines = [ItemPedidoInline]

# --- ItemPedido ---
@admin.register(ItemPedido)
class ItemPedidoAdmin(admin.ModelAdmin):
    list_display = ("pedido", "producto", "cantidad", "precio_unitario", "subtotal_display")

    def subtotal_display(self, obj):
        return obj.subtotal()
    subtotal_display.short_description = "Subtotal"

# --- Pago ---
@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ("id", "pedido", "stripe_id", "estado", "metodo", "fecha_pago", "monto")
    list_filter = ("estado", "metodo", "fecha_pago")
    search_fields = ("stripe_id", "pedido__id")

# --- AuditoriaCambio ---
@admin.register(AuditoriaCambio)
class AuditoriaCambioAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "content_type", "objeto_id", "campo", "valor_anterior", "valor_nuevo", "fecha")
    list_filter = ("content_type", "campo", "fecha")
    search_fields = ("usuario__username", "campo", "valor_anterior", "valor_nuevo")
