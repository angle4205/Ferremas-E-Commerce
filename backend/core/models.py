import os
import random
from decimal import Decimal

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# --------------------------
# USER, PROFILE, ADDRESS
# --------------------------

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(
        upload_to="profile_pictures/", blank=True, null=True
    )

    def __str__(self):
        return f"Perfil de {self.user.username}"

    def get_default_address(self):
        default_address = self.user.addresses.filter(is_default=True).first()
        if default_address:
            return f"{default_address.address}"
        return "Sin dirección predeterminada"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Crea un UserProfile automáticamente cuando se crea un User."""
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Guarda el UserProfile automáticamente cuando se guarda un User."""
    instance.profile.save()

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    address = models.TextField()
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"Address for {self.user.username}: {self.address}"

# --------------------------
# PRODUCTOS Y IMÁGENES
# --------------------------

def generar_nro_referencia_unico():
    while True:
        nro_referencia = str(random.randint(100000, 999999))
        if not Producto.objects.filter(nro_referencia=nro_referencia).exists():
            return nro_referencia

def upload_to(instance, filename):
    return os.path.join("productos", instance.marca, instance.nombre, filename)

class ImagenProducto(models.Model):
    imagen = models.ImageField(upload_to="productos/secundarias/")

    def __str__(self):
        return f"Imagen ID: {self.id}"

class Producto(models.Model):
    CATEGORIAS_CHOICES = [
        ("HERRAMIENTAS_MANUALES", "Herramientas Manuales"),
        ("HERRAMIENTAS_ELECTRICAS", "Herramientas Eléctricas"),
        ("PINTURAS", "Pinturas"),
        ("MATERIALES_ELECTRICOS", "Materiales Eléctricos"),
        ("SEGURIDAD", "Artículos de Seguridad"),
        ("FIJACION", "Artículos de Fijación"),
        ("FERRETERIA", "Ferretería General"),
        ("JARDIN", "Jardín y Exteriores"),
    ]

    marca = models.CharField(max_length=100)
    nombre = models.CharField(max_length=200)

    categoria = models.CharField(
        max_length=50,
        choices=CATEGORIAS_CHOICES,
        default="FERRETERIA",
        verbose_name="Categoría del producto",
    )

    nro_referencia = models.CharField(
        max_length=6, unique=True, default=generar_nro_referencia_unico, editable=False
    )

    valor = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)]
    )
    stock = models.PositiveIntegerField(default=0)
    disponible = models.BooleanField(default=True, editable=False)

    imagen_principal = models.ImageField(
        upload_to=upload_to, blank=True, null=True, verbose_name="Imagen principal"
    )
    imagenes_secundarias = models.ManyToManyField(
        ImagenProducto, blank=True, related_name="productos"
    )

    descripcion = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.disponible = self.stock > 0
        if not self.nro_referencia:
            self.nro_referencia = generar_nro_referencia_unico()
        super().save(*args, **kwargs)

    def reducir_stock(self, cantidad):
        if cantidad <= self.stock:
            self.stock -= cantidad
            self.save()
            return True
        return False

    def __str__(self):
        return f"{self.nombre} - {self.marca} (Ref: {self.nro_referencia})"

# --------------------------
# CARRITO Y ITEMS
# --------------------------

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="carts")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    estado = models.CharField(
        max_length=20,
        choices=[
            ("ACTIVO", "Activo"),
            ("PAGADO", "Pagado"),
            ("EN_PROCESO", "En proceso"),
            ("ENVIADO", "Enviado"),
            ("ENTREGADO", "Entregado"),
            ("CANCELADO", "Cancelado"),
        ],
        default="ACTIVO",
    )
    subtotal = models.DecimalField(
        max_digits=12, decimal_places=0, default=0, validators=[MinValueValidator(0)]
    )
    iva = models.DecimalField(
        max_digits=12, decimal_places=0, default=0, validators=[MinValueValidator(0)]
    )
    total = models.DecimalField(
        max_digits=12, decimal_places=0, default=0, validators=[MinValueValidator(0)]
    )
    metodo_despacho = models.CharField(
        max_length=20,
        choices=[
            ("RETIRO_TIENDA", "Retiro en tienda"),
            ("DESPACHO_DOMICILIO", "Despacho a domicilio"),
        ],
        null=True,
        blank=True,
    )
    direccion_envio = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, blank=True
    )
    costo_despacho = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
    )

    def __str__(self):
        return f"Cart #{self.id} - {self.user.username} ({self.estado})"

    def calcular_totales(self):
        items = self.items.all()
        self.subtotal = sum(item.subtotal() for item in items)
        self.iva = int(round(self.subtotal * 0.19))
        if self.metodo_despacho == "DESPACHO_DOMICILIO":
            self.costo_despacho = int(self.costo_despacho or 0)
            self.total = self.subtotal + self.iva + self.costo_despacho
        else:
            self.costo_despacho = 0
            self.total = self.subtotal + self.iva
        self.save()

    def total_para_stripe(self):
        """Devuelve el total ajustado al múltiplo de 50 más cercano (requerido por Stripe CLP)"""
        return int(round(self.total / 50.0) * 50)

    def ajuste_stripe(self):
        """Devuelve el ajuste aplicado para Stripe (puede ser 0, + o -)"""
        return self.total_para_stripe() - int(self.total)

class ItemCarrito(models.Model):
    carrito = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE, related_name="items_carrito"
    )
    cantidad = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    precio_unitario = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )

    def subtotal(self):
        return int(round(self.cantidad * float(self.precio_unitario)))