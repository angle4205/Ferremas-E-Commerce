import os
import random
from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# --------------------------
# ROLES DE USUARIO
# --------------------------

class Rol(models.Model):
    """
    Define los roles del sistema: Cliente, Administrador, Vendedor, Bodeguero, Contador.
    """
    ROL_CHOICES = [
        ("CLIENTE", _("Cliente")),
        ("ADMINISTRADOR", _("Administrador")),
        ("VENDEDOR", _("Vendedor")),
        ("BODEGUERO", _("Bodeguero")),
        ("CONTADOR", _("Contador")),
    ]
    nombre = models.CharField(
        max_length=20, choices=ROL_CHOICES, unique=True,
        verbose_name=_("Rol"), help_text=_("Rol del usuario en el sistema")
    )

    class Meta:
        verbose_name = _("Rol")
        verbose_name_plural = _("Roles")

    def __str__(self):
        return self.get_nombre_display()

# --------------------------
# SUCURSAL
# --------------------------

class Sucursal(models.Model):
    """
    Representa una sucursal física de la empresa.
    """
    nombre = models.CharField(max_length=100, verbose_name=_("Nombre"))
    direccion = models.TextField(verbose_name=_("Dirección"))
    latitud = models.FloatField(blank=True, null=True, verbose_name=_("Latitud"))
    longitud = models.FloatField(blank=True, null=True, verbose_name=_("Longitud"))

    class Meta:
        verbose_name = _("Sucursal")
        verbose_name_plural = _("Sucursales")

    def __str__(self):
        return self.nombre

# --------------------------
# MARCA Y CATEGORÍA
# --------------------------

class Categoria(models.Model):
    """
    Categoría de un producto.
    """
    nombre = models.CharField(max_length=100, unique=True, verbose_name=_("Nombre"))
    descripcion = models.TextField(blank=True, null=True, verbose_name=_("Descripción"))

    class Meta:
        verbose_name = _("Categoría")
        verbose_name_plural = _("Categorías")

    def __str__(self):
        return self.nombre

class Marca(models.Model):
    """
    Marca de un producto. Puede estar asociada a varias categorías.
    """
    nombre = models.CharField(max_length=100, unique=True, verbose_name=_("Nombre"))
    categorias = models.ManyToManyField(
        Categoria, blank=True, related_name='marcas',
        verbose_name=_("Categorías"), help_text=_("Categorías asociadas a la marca")
    )

    class Meta:
        verbose_name = _("Marca")
        verbose_name_plural = _("Marcas")

    def __str__(self):
        return self.nombre

# --------------------------
# USER, PROFILE, ADDRESS
# --------------------------

class UserProfile(models.Model):
    """
    Perfil extendido de usuario, con rol y sucursal (si aplica).
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, verbose_name=_("Rol"))
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Sucursal"))
    profile_picture = models.ImageField(
        upload_to="profile_pictures/", blank=True, null=True, verbose_name=_("Foto de perfil")
    )
    recibe_ofertas = models.BooleanField(default=True, verbose_name=_("Recibe ofertas"))
    recibe_notificaciones = models.BooleanField(default=True, verbose_name=_("Recibe notificaciones"))

    class Meta:
        verbose_name = _("Perfil de usuario")
        verbose_name_plural = _("Perfiles de usuario")

    def __str__(self):
        return f"Perfil de {self.user.username} ({self.rol})"

    def get_default_address(self):
        default_address = self.user.addresses.filter(is_default=True).first()
        if default_address:
            return f"{default_address.address}"
        return _("Sin dirección predeterminada")

# Señal robusta para crear/guardar UserProfile automáticamente
@receiver(post_save, sender=User)
def user_profile_post_save(sender, instance, created, **kwargs):
    """
    Crea o guarda el UserProfile automáticamente cuando se crea o guarda un User.
    """
    if created:
        UserProfile.objects.create(user=instance)
    else:
        if hasattr(instance, "profile"):
            instance.profile.save()

class Address(models.Model):
    """
    Dirección de usuario (puede ser de envío o facturación).
    Solo una dirección por usuario puede tener is_default=True.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses", verbose_name=_("Usuario"))
    address = models.TextField(verbose_name=_("Dirección"))
    latitude = models.FloatField(blank=True, null=True, verbose_name=_("Latitud"))
    longitude = models.FloatField(blank=True, null=True, verbose_name=_("Longitud"))
    is_default = models.BooleanField(default=False, verbose_name=_("¿Es predeterminada?"))

    class Meta:
        verbose_name = _("Dirección")
        verbose_name_plural = _("Direcciones")

    def clean(self):
        # Garantiza que solo una dirección por usuario sea default
        if self.is_default:
            qs = Address.objects.filter(user=self.user, is_default=True)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            if qs.exists():
                raise ValidationError(_("Solo puede haber una dirección predeterminada por usuario."))

    def save(self, *args, **kwargs):
        # Si esta dirección es default, desmarca las demás
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Address for {self.user.username}: {self.address}"

# --------------------------
# CLIENTE
# --------------------------

class Cliente(models.Model):
    """
    Modelo específico para clientes, con historial de compras y preferencias.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cliente", verbose_name=_("Usuario"))
    email = models.EmailField(unique=True, verbose_name=_("Correo electrónico"))
    fecha_registro = models.DateTimeField(auto_now_add=True, verbose_name=_("Fecha de registro"))

    class Meta:
        verbose_name = _("Cliente")
        verbose_name_plural = _("Clientes")

    def historial_compras(self):
        return Pedido.objects.filter(cliente=self)

    def __str__(self):
        return f"Cliente: {self.user.username}"

# --------------------------
# PRODUCTOS Y VALORACIONES
# --------------------------

def generar_nro_referencia_unico():
    while True:
        nro_referencia = str(random.randint(100000, 999999))
        if not Producto.objects.filter(nro_referencia=nro_referencia).exists():
            return nro_referencia

def upload_to_producto(instance, filename):
    # Unifica la lógica de rutas para imágenes de productos
    return os.path.join("productos", instance.marca.nombre, instance.nombre, filename)

class ImagenProducto(models.Model):
    imagen = models.ImageField(upload_to="productos/secundarias/", verbose_name=_("Imagen secundaria"))

    class Meta:
        verbose_name = _("Imagen de producto")
        verbose_name_plural = _("Imágenes de producto")

    def __str__(self):
        return f"Imagen ID: {self.id}"

class Producto(models.Model):
    """
    Producto del catálogo, asociado a marca, categoría y sucursal.
    El precio 'valor' es el valor final en CLP (IVA incluido).
    """
    nombre = models.CharField(max_length=200, verbose_name=_("Nombre"))
    descripcion = models.TextField(blank=True, null=True, verbose_name=_("Descripción"))
    marca = models.ForeignKey(Marca, on_delete=models.PROTECT, related_name="productos", verbose_name=_("Marca"))
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name="productos", verbose_name=_("Categoría"))
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True, related_name="productos", verbose_name=_("Sucursal"))
    nro_referencia = models.CharField(
        max_length=6, unique=True, default=generar_nro_referencia_unico, editable=False, verbose_name=_("N° Referencia")
    )
    valor = models.DecimalField(
        max_digits=10, decimal_places=0, validators=[MinValueValidator(1)],
        verbose_name=_("Precio (CLP, IVA incluido)"),
        help_text=_("Precio final en CLP, con IVA incluido")
    )
    stock = models.PositiveIntegerField(default=0, verbose_name=_("Stock"))
    disponible = models.BooleanField(default=True, editable=False, verbose_name=_("¿Disponible?"))
    imagen_principal = models.ImageField(
        upload_to=upload_to_producto, blank=True, null=True, verbose_name=_("Imagen principal")
    )
    imagenes_secundarias = models.ManyToManyField(
        ImagenProducto, blank=True, related_name="productos", verbose_name=_("Imágenes secundarias")
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name=_("Fecha de creación"))
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name=_("Fecha de actualización"))

    class Meta:
        verbose_name = _("Producto")
        verbose_name_plural = _("Productos")

    def save(self, *args, **kwargs):
        self.disponible = self.stock > 0
        if not self.nro_referencia:
            self.nro_referencia = generar_nro_referencia_unico()
        super().save(*args, **kwargs)
        # Asociar la categoría del producto a la marca si no está ya asociada
        if self.categoria not in self.marca.categorias.all():
            self.marca.categorias.add(self.categoria)

    def reducir_stock(self, cantidad):
        if cantidad <= self.stock:
            self.stock -= cantidad
            self.save()
            return True
        return False

    def promedio_valoracion(self):
        valoraciones = self.valoraciones.all()
        if valoraciones.exists():
            return round(sum([v.puntaje for v in valoraciones]) / valoraciones.count(), 2)
        return None

    def __str__(self):
        return f"{self.nombre} - {self.marca} (Ref: {self.nro_referencia})"

class ValoracionProducto(models.Model):
    """
    Valoración y comentario de un producto por parte de un cliente.
    """
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="valoraciones", verbose_name=_("Producto"))
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="valoraciones", verbose_name=_("Cliente"))
    puntaje = models.PositiveSmallIntegerField(default=5, verbose_name=_("Puntaje"))
    comentario = models.TextField(blank=True, null=True, verbose_name=_("Comentario"))
    fecha = models.DateTimeField(auto_now_add=True, verbose_name=_("Fecha"))

    class Meta:
        verbose_name = _("Valoración de producto")
        verbose_name_plural = _("Valoraciones de producto")

    def __str__(self):
        return f"{self.producto} - {self.puntaje} estrellas"

# --------------------------
# CARRITO Y ITEMS
# --------------------------

class Cart(models.Model):
    """
    Carrito de compras asociado a un cliente.
    Todos los montos son en CLP (sin decimales). El precio de cada producto ya incluye IVA.
    El desglose para boleta se calcula como:
      - total = suma de valores de productos (con IVA)
      - iva = round(total * 19 / 119)
      - subtotal = total - iva
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="carts", verbose_name=_("Usuario"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Creado el"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Actualizado el"))
    estado = models.CharField(
        max_length=20,
        choices=[
            ("ACTIVO", _("Activo")),
            ("PAGADO", _("Pagado")),
            ("EN_PROCESO", _("En proceso")),
            ("ENVIADO", _("Enviado")),
            ("ENTREGADO", _("Entregado")),
            ("CANCELADO", _("Cancelado")),
        ],
        default="ACTIVO",
        verbose_name=_("Estado")
    )
    metodo_despacho = models.CharField(
        max_length=20,
        choices=[
            ("RETIRO_TIENDA", _("Retiro en tienda")),
            ("DESPACHO_DOMICILIO", _("Despacho a domicilio")),
        ],
        null=True,
        blank=True,
        verbose_name=_("Método de despacho")
    )
    direccion_envio = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Dirección de envío")
    )
    costo_despacho = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Costo de despacho (CLP)")
    )
    subtotal = models.DecimalField(
        max_digits=12, decimal_places=0, default=0, validators=[MinValueValidator(0)],
        verbose_name=_("Subtotal (CLP, sin IVA)")
    )
    iva = models.DecimalField(
        max_digits=12, decimal_places=0, default=0, validators=[MinValueValidator(0)],
        verbose_name=_("IVA (CLP)")
    )
    total = models.DecimalField(
        max_digits=12, decimal_places=0, default=0, validators=[MinValueValidator(0)],
        verbose_name=_("Total (CLP, con IVA)")
    )

    class Meta:
        verbose_name = _("Carrito")
        verbose_name_plural = _("Carritos")

    def clean(self):
        """
        Valida la coherencia de los montos del carrito.
        Permite una diferencia máxima absoluta de 1 CLP entre subtotal + iva y total,
        para cubrir casos de redondeo inevitables por normativa chilena y uso de enteros en CLP.
        No permite inconsistencias reales (diferencias mayores).
        """
        if self.total < 0 or self.subtotal < 0 or self.iva < 0:
            raise ValidationError(_("Los montos no pueden ser negativos."))
        # Permitimos una diferencia de hasta 1 CLP por truncamiento
        if abs((self.subtotal + self.iva) - self.total) > 1:
            raise ValidationError(
                _("El subtotal más el IVA debe ser igual al total.")
            )
    
    def calcular_totales(self):
        """
        Calcula subtotal, IVA y total del carrito según normativa chilena.
        Todos los valores son en CLP (sin decimales).
        El precio de cada producto ya incluye IVA.
        Debes llamar a save() luego de este método para guardar los cambios.
        """
        items = self.items.all()
        total = sum(item.subtotal() for item in items)
        iva = Decimal(total * 19 / 119).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        subtotal = total - iva
        if self.metodo_despacho == "DESPACHO_DOMICILIO":
            costo_despacho = Decimal(self.costo_despacho or 0)
            total_final = total + costo_despacho
        else:
            costo_despacho = Decimal(0)
            total_final = total
        self.subtotal = subtotal
        self.iva = iva
        self.total = total_final
        # No llamar a self.save() aquí para evitar recursión accidental

    def total_para_stripe(self):
        """
        Devuelve el total truncado al múltiplo de 50 inferior más cercano (requerido por Stripe CLP).
        Así nunca se cobra de más al cliente.
        """
        return int(self.total // 50) * 50

    def ajuste_stripe(self):
        """
        Devuelve el ajuste aplicado para Stripe (puede ser 0 o negativo).
        """
        return self.total_para_stripe() - int(self.total)

    def __str__(self):
        return f"Cart #{self.id} - {self.user.username} ({self.estado})"

class ItemCarrito(models.Model):
    """
    Item dentro del carrito de compras.
    El precio unitario es el valor final del producto (con IVA, en CLP).
    """
    carrito = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items", verbose_name=_("Carrito"))
    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE, related_name="items_carrito", verbose_name=_("Producto")
    )
    cantidad = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)], verbose_name=_("Cantidad"))
    precio_unitario = models.DecimalField(
        max_digits=10, decimal_places=0, validators=[MinValueValidator(1)],
        verbose_name=_("Precio unitario (CLP, con IVA)")
    )

    class Meta:
        verbose_name = _("Item de carrito")
        verbose_name_plural = _("Items de carrito")

    def subtotal(self):
        """
        Devuelve el subtotal del item (precio unitario * cantidad), en CLP como Decimal.
        """
        return Decimal(self.cantidad) * Decimal(self.precio_unitario)

# --------------------------
# PEDIDO Y TRACKING
# --------------------------

class Pedido(models.Model):
    """
    Pedido realizado por un cliente. Incluye tracking de estado y asignación de bodeguero.
    """
    ESTADO_CHOICES = [
        ("SOLICITADO", _("Solicitado")),
        ("PREPARACION", _("En preparación")),
        ("LISTO_RETIRO", _("Listo para retiro")),
        ("ENVIADO", _("Enviado")),
        ("ENTREGADO", _("Entregado")),
        ("CANCELADO", _("Cancelado")),
    ]
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="pedidos", verbose_name=_("Cliente"))
    carrito = models.OneToOneField(Cart, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Carrito"))
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name=_("Fecha de creación"))
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name=_("Fecha de actualización"))
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="SOLICITADO", verbose_name=_("Estado"))
    productos = models.ManyToManyField(Producto, through="ItemPedido", verbose_name=_("Productos"))
    metodo_retiro = models.CharField(
        max_length=20,
        choices=[
            ("RETIRO_TIENDA", _("Retiro en tienda")),
            ("DESPACHO_DOMICILIO", _("Despacho a domicilio")),
        ],
        default="RETIRO_TIENDA",
        verbose_name=_("Método de retiro")
    )
    direccion_envio = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Dirección de envío"))
    bodeguero_asignado = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos_asignados", verbose_name=_("Bodeguero asignado")
    )
    historial_estados = models.JSONField(default=list, blank=True, verbose_name=_("Historial de estados"))
    total = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name=_("Total (CLP, con IVA)"))
    actualizado_por = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos_actualizados", verbose_name=_("Actualizado por")
    )

    class Meta:
        verbose_name = _("Pedido")
        verbose_name_plural = _("Pedidos")

    def actualizar_estado(self, nuevo_estado, usuario):
        """
        Actualiza el estado del pedido y guarda el historial.
        """
        self.estado = nuevo_estado
        self.fecha_actualizacion = models.DateTimeField(auto_now=True)
        self.historial_estados.append({
            "estado": nuevo_estado,
            "fecha": str(self.fecha_actualizacion),
            "usuario": usuario.username if usuario else None
        })
        self.actualizado_por = usuario
        self.save()

    def asignar_bodeguero(self):
        """
        Lógica para asignar automáticamente un bodeguero disponible.
        """
        bodegueros = UserProfile.objects.filter(rol__nombre="BODEGUERO", bodeguero__en_turno=True)
        bodeguero_menos_carga = None
        min_pedidos = None
        for b in bodegueros:
            pedidos = Pedido.objects.filter(bodeguero_asignado=b.user, estado__in=["PREPARACION", "SOLICITADO"]).count()
            if min_pedidos is None or pedidos < min_pedidos:
                min_pedidos = pedidos
                bodeguero_menos_carga = b.user
        if bodeguero_menos_carga:
            self.bodeguero_asignado = bodeguero_menos_carga
            self.save()
        return self.bodeguero_asignado

    def tracking_cliente(self):
        """
        Devuelve el historial de estados para mostrar al cliente.
        """
        return self.historial_estados

    def __str__(self):
        return f"Pedido #{self.id} - {self.cliente.user.username} ({self.estado})"

class ItemPedido(models.Model):
    """
    Relación producto-cantidad dentro de un pedido.
    """
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="items", verbose_name=_("Pedido"))
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, verbose_name=_("Producto"))
    cantidad = models.PositiveIntegerField(default=1, verbose_name=_("Cantidad"))
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=0, verbose_name=_("Precio unitario (CLP, con IVA)"))

    class Meta:
        verbose_name = _("Item de pedido")
        verbose_name_plural = _("Items de pedido")

    def subtotal(self):
        """
        Devuelve el subtotal del item (precio unitario * cantidad), en CLP como Decimal.
        """
        return Decimal(self.cantidad) * Decimal(self.precio_unitario)

# --------------------------
# PAGO
# --------------------------

class Pago(models.Model):
    """
    Registro de pagos procesados (Stripe).
    """
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE, related_name="pago", verbose_name=_("Pedido"))
    stripe_id = models.CharField(max_length=100, unique=True, verbose_name=_("ID de Stripe"))
    estado = models.CharField(
        max_length=20,
        choices=[
            ("PENDIENTE", _("Pendiente")),
            ("COMPLETADO", _("Completado")),
            ("FALLIDO", _("Fallido")),
        ],
        default="PENDIENTE",
        verbose_name=_("Estado")
    )
    metodo = models.CharField(max_length=50, default="Stripe", verbose_name=_("Método de pago"))
    fecha_pago = models.DateTimeField(auto_now_add=True, verbose_name=_("Fecha de pago"))
    monto = models.DecimalField(max_digits=12, decimal_places=0, verbose_name=_("Monto (CLP)"))

    class Meta:
        verbose_name = _("Pago")
        verbose_name_plural = _("Pagos")

    def clean(self):
        """
        Valida que el monto del pago coincida con el total del pedido (o el total ajustado para Stripe).
        """
        if self.pedido and self.monto > 0:
            total_pedido = int(self.pedido.total)
            total_stripe = int(self.pedido.total // 50) * 50
            if int(self.monto) not in [total_pedido, total_stripe]:
                raise ValidationError(
                    _("El monto del pago debe coincidir con el total del pedido o el total ajustado para Stripe.")
                )

    def __str__(self):
        return f"Pago {self.stripe_id} - {self.estado}"

# --------------------------
# EMPLEADOS Y TURNOS
# --------------------------

class Bodeguero(models.Model):
    """
    Perfil extendido para bodeguero, con tracking de turnos.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="bodeguero", verbose_name=_("Usuario"))
    en_turno = models.BooleanField(default=False, verbose_name=_("¿En turno?"))
    hora_entrada = models.DateTimeField(null=True, blank=True, verbose_name=_("Hora de entrada"))
    hora_salida = models.DateTimeField(null=True, blank=True, verbose_name=_("Hora de salida"))
    comprobante_entrada = models.FileField(upload_to="comprobantes_bodeguero/", blank=True, null=True, verbose_name=_("Comprobante de entrada"))

    class Meta:
        verbose_name = _("Bodeguero")
        verbose_name_plural = _("Bodegueros")

    def marcar_entrada(self, comprobante=None):
        from django.utils import timezone
        self.en_turno = True
        self.hora_entrada = timezone.now()
        if comprobante:
            self.comprobante_entrada = comprobante
        self.save()
        # Aquí se podría enviar email de confirmación

    def marcar_salida(self):
        from django.utils import timezone
        self.en_turno = False
        self.hora_salida = timezone.now()
        self.save()

    def pedidos_en_proceso(self):
        return Pedido.objects.filter(bodeguero_asignado=self.user, estado__in=["PREPARACION", "SOLICITADO"])

    def __str__(self):
        return f"Bodeguero: {self.user.username} ({'En turno' if self.en_turno else 'Fuera de turno'})"

class Vendedor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="vendedor", verbose_name=_("Usuario"))
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Sucursal"))

    class Meta:
        verbose_name = _("Vendedor")
        verbose_name_plural = _("Vendedores")

    def __str__(self):
        return f"Vendedor: {self.user.username}"

class Contador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="contador", verbose_name=_("Usuario"))

    class Meta:
        verbose_name = _("Contador")
        verbose_name_plural = _("Contadores")

    def __str__(self):
        return f"Contador: {self.user.username}"

# --------------------------
# AUDITORÍA DE CAMBIOS EN MODELOS
# --------------------------

class AuditoriaCambio(models.Model):
    """
    Registro de cambios relevantes en modelos críticos.
    """
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name=_("Usuario"))
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name=_("Tipo de contenido"))
    objeto_id = models.PositiveIntegerField(verbose_name=_("ID del objeto"))
    content_object = GenericForeignKey('content_type', 'objeto_id')
    campo = models.CharField(max_length=100, verbose_name=_("Campo"))
    valor_anterior = models.TextField(blank=True, null=True, verbose_name=_("Valor anterior"))
    valor_nuevo = models.TextField(blank=True, null=True, verbose_name=_("Valor nuevo"))
    fecha = models.DateTimeField(auto_now_add=True, verbose_name=_("Fecha"))

    class Meta:
        verbose_name = _("Auditoría de cambio")
        verbose_name_plural = _("Auditorías de cambio")

    def __str__(self):
        return f"Auditoría: {self.content_type} ({self.campo}) por {self.usuario}"

# --------------------------
# FUNCIONES AUXILIARES DUMMY PARA EMAILS
# --------------------------

def enviar_email_bienvenida(cliente):
    print(f"[EMAIL] Bienvenida enviada a {cliente.email}")

def enviar_email_confirmacion_turno(bodeguero):
    print(f"[EMAIL] Confirmación de entrada a turno enviada a {bodeguero.user.email} (comprobante: {bodeguero.comprobante_entrada})")

def enviar_email_pago_confirmado(cliente, pedido):
    print(f"[EMAIL] Pago confirmado para {cliente.email} - Pedido #{pedido.id}")

def enviar_oferta_especial(cliente, pedido):
    print(f"[EMAIL] Oferta especial enviada a {cliente.email} por compra de más de 4 productos en Pedido #{pedido.id}")

# --------------------------
# SIGNALS
# --------------------------

@receiver(pre_save, sender=Pedido)
def auditar_cambio_estado_pedido(sender, instance, **kwargs):
    """
    Registra en AuditoriaCambio cuando un Pedido cambia de estado.
    """
    if not instance.pk:
        return  # Es un pedido nuevo, no hay cambio de estado
    try:
        pedido_anterior = Pedido.objects.get(pk=instance.pk)
    except Pedido.DoesNotExist:
        return
    if pedido_anterior.estado != instance.estado:
        AuditoriaCambio.objects.create(
            usuario=instance.actualizado_por,
            content_type=ContentType.objects.get_for_model(Pedido),
            objeto_id=instance.pk,
            campo="estado",
            valor_anterior=pedido_anterior.estado,
            valor_nuevo=instance.estado,
        )

@receiver(post_save, sender=Cliente)
def enviar_bienvenida_cliente(sender, instance, created, **kwargs):
    """
    Envía email de bienvenida cuando se crea un Cliente.
    """
    if created:
        enviar_email_bienvenida(instance)

@receiver(post_save, sender=Bodeguero)
def email_confirmacion_entrada_turno(sender, instance, **kwargs):
    """
    Envía email de confirmación cuando un Bodeguero marca entrada a turno.
    """
    if instance.en_turno and instance.hora_entrada and instance.comprobante_entrada:
        enviar_email_confirmacion_turno(instance)

@receiver(post_save, sender=ValoracionProducto)
def recalcular_promedio_valoracion(sender, instance, created, **kwargs):
    """
    Recalcula el promedio de valoraciones del producto cuando se añade una nueva valoración.
    """
    if created:
        producto = instance.producto
        valoraciones = producto.valoraciones.all()
        if valoraciones.exists():
            promedio = round(sum([v.puntaje for v in valoraciones]) / valoraciones.count(), 2)
            print(f"[INFO] Promedio de valoraciones actualizado para {producto}: {promedio}")

@receiver(post_save, sender=Pago)
def pago_confirmado_actualiza_pedido(sender, instance, **kwargs):
    """
    Cuando un Pago es completado, actualiza el estado del Pedido y notifica al Cliente.
    """
    if instance.estado == "COMPLETADO":
        pedido = instance.pedido
        if pedido.estado != "SOLICITADO":
            return  # Ya procesado
        pedido.actualizar_estado("PREPARACION", pedido.cliente.user)
        enviar_email_pago_confirmado(pedido.cliente, pedido)

@receiver(post_save, sender=Pedido)
def oferta_especial_por_compra(sender, instance, created, **kwargs):
    """
    Si un pedido tiene más de 4 productos distintos, enviar oferta especial.
    """
    if created:
        total_productos = sum([item.cantidad for item in instance.items.all()])
        if total_productos > 4:
            enviar_oferta_especial(instance.cliente, instance)