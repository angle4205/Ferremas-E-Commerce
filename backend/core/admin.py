from django.contrib import admin
from django.utils.html import mark_safe

from .models import (
    Producto,
    ImagenProducto,
    UserProfile,
    Address,
    Cart,
    ItemCarrito,
)

# --- Producto ---

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "marca",
        "categoria",
        "nro_referencia",
        "valor",
        "stock",
        "disponible",
    )
    list_filter = ("categoria", "marca", "disponible")
    readonly_fields = ("disponible", "nro_referencia")
    search_fields = ("nombre", "marca", "nro_referencia")

# --- ImagenProducto ---

@admin.register(ImagenProducto)
class ImagenProductoAdmin(admin.ModelAdmin):
    list_display = ("id", "imagen_preview")

    def imagen_preview(self, obj):
        if obj.imagen:
            return mark_safe(f'<img src="{obj.imagen.url}" width="100" />')
        return "-"
    imagen_preview.short_description = "Vista previa"

# --- UserProfile ---

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "profile_picture")

# --- Address ---

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "address", "is_default", "latitude", "longitude")

# --- Cart ---

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "updated_at", "estado", "total")

# --- ItemCarrito ---

@admin.register(ItemCarrito)
class ItemCarritoAdmin(admin.ModelAdmin):
    list_display = ("carrito", "producto", "cantidad", "precio_unitario", "subtotal")

    def subtotal(self, obj):
        return obj.subtotal()
    subtotal.short_description = "Subtotal"