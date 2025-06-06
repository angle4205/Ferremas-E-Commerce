import os
import random
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# --------------------------
# ROLES DE USUARIO
# --------------------------

class Rol(models.Model):
    """
    Define los roles del sistema: Cliente, Administrador, Vendedor, Bodeguero, Contador.
    """
    ROL_CHOICES = [
        ("CLIENTE", "Cliente"),
        ("ADMINISTRADOR", "Administrador"),
        ("VENDEDOR", "Vendedor"),
        ("BODEGUERO", "Bodeguero"),
        ("CONTADOR", "Contador"),
    ]
    nombre = models.CharField(max_length=20, choices=ROL_CHOICES, unique=True)

    def __str__(self):
        return self.get_nombre_display()

# --------------------------
# SUCURSAL
# --------------------------

class Sucursal(models.Model):
    """
    Representa una sucursal física de la empresa.
    """
    nombre = models.CharField(max_length=100)
    direccion = models.TextField()
    latitud = models.FloatField(blank=True, null=True)
    longitud = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.nombre

# --------------------------
# MARCA Y CATEGORÍA
# --------------------------

class Marca(models.Model):
    """
    Marca de un producto.
    """
    nombre = models.CharField(max_length=100, unique=True)
    categorias = models.ManyToManyField('Categoria', blank=True, related_name='marcas')

    def __str__(self):
        return self.nombre

class Categoria(models.Model):
    """
    Categoría de un producto.
    """
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

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
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to="profile_pictures/", blank=True, null=True
    )
    # Para clientes: preferencias de notificación
    recibe_ofertas = models.BooleanField(default=True)
    recibe_notificaciones = models.BooleanField(default=True)

    def __str__(self):
        return f"Perfil de {self.user.username} ({self.rol})"

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
    """
    Dirección de usuario (puede ser de envío o facturación).
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    address = models.TextField()
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"Address for {self.user.username}: {self.address}"

# --------------------------
# CLIENTE
# --------------------------

class Cliente(models.Model):
    """
    Modelo específico para clientes, con historial de compras y preferencias.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cliente")
    email = models.EmailField(unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

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

def upload_to(instance, filename):
    return os.path.join("productos", instance.marca.nombre, instance.nombre, filename)

class ImagenProducto(models.Model):
    imagen = models.ImageField(upload_to="productos/secundarias/")

    def __str__(self):
        return f"Imagen ID: {self.id}"

class Producto(models.Model):
    """
    Producto del catálogo, asociado a marca, categoría y sucursal.
    """
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    marca = models.ForeignKey(Marca, on_delete=models.PROTECT, related_name="productos")
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name="productos")
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True, related_name="productos")
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
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

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
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="valoraciones")
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="valoraciones")
    puntaje = models.PositiveSmallIntegerField(default=5)
    comentario = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.producto} - {self.puntaje} estrellas"

# --------------------------
# CARRITO Y ITEMS
# --------------------------

class Cart(models.Model):
    """
    Carrito de compras asociado a un cliente.
    """
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
    """
    Item dentro del carrito de compras.
    """
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

# --------------------------
# PEDIDO Y TRACKING
# --------------------------

class Pedido(models.Model):
    """
    Pedido realizado por un cliente. Incluye tracking de estado y asignación de bodeguero.
    """
    ESTADO_CHOICES = [
        ("SOLICITADO", "Solicitado"),
        ("PREPARACION", "En preparación"),
        ("LISTO_RETIRO", "Listo para retiro"),
        ("ENVIADO", "Enviado"),
        ("ENTREGADO", "Entregado"),
        ("CANCELADO", "Cancelado"),
    ]
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="pedidos")
    carrito = models.OneToOneField(Cart, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="SOLICITADO")
    productos = models.ManyToManyField(Producto, through="ItemPedido")
    metodo_retiro = models.CharField(
        max_length=20,
        choices=[
            ("RETIRO_TIENDA", "Retiro en tienda"),
            ("DESPACHO_DOMICILIO", "Despacho a domicilio"),
        ],
        default="RETIRO_TIENDA",
    )
    direccion_envio = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    bodeguero_asignado = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos_asignados"
    )
    historial_estados = models.JSONField(default=list, blank=True)
    total = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    # Auditoría
    actualizado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos_actualizados")

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
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="items")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def subtotal(self):
        return self.cantidad * self.precio_unitario

# --------------------------
# PAGO
# --------------------------

class Pago(models.Model):
    """
    Registro de pagos procesados (Stripe).
    """
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE, related_name="pago")
    stripe_id = models.CharField(max_length=100, unique=True)
    estado = models.CharField(
        max_length=20,
        choices=[
            ("PENDIENTE", "Pendiente"),
            ("COMPLETADO", "Completado"),
            ("FALLIDO", "Fallido"),
        ],
        default="PENDIENTE",
    )
    metodo = models.CharField(max_length=50, default="Stripe")
    fecha_pago = models.DateTimeField(auto_now_add=True)
    monto = models.DecimalField(max_digits=12, decimal_places=0)

    def __str__(self):
        return f"Pago {self.stripe_id} - {self.estado}"

# --------------------------
# EMPLEADOS Y TURNOS
# --------------------------

class Bodeguero(models.Model):
    """
    Perfil extendido para bodeguero, con tracking de turnos.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="bodeguero")
    en_turno = models.BooleanField(default=False)
    hora_entrada = models.DateTimeField(null=True, blank=True)
    hora_salida = models.DateTimeField(null=True, blank=True)
    comprobante_entrada = models.FileField(upload_to="comprobantes_bodeguero/", blank=True, null=True)

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

# Vendedor y Contador pueden tener modelos similares si se requiere lógica adicional

class Vendedor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="vendedor")
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True)
    # Agregar campos adicionales según necesidades

    def __str__(self):
        return f"Vendedor: {self.user.username}"

class Contador(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="contador")
    # Agregar campos adicionales según necesidades

    def __str__(self):
        return f"Contador: {self.user.username}"

# --------------------------
# AUDITORÍA DE CAMBIOS EN MODELOS
# --------------------------

class AuditoriaCambio(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    objeto_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'objeto_id')
    campo = models.CharField(max_length=100)
    valor_anterior = models.TextField(blank=True, null=True)
    valor_nuevo = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

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
# SIGNAL 1: Auditoría de cambios de estado en Pedido
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
            modelo="Pedido",
            objeto_id=instance.pk,
            campo="estado",
            valor_anterior=pedido_anterior.estado,
            valor_nuevo=instance.estado,
        )

# --------------------------
# SIGNAL 2: Email de bienvenida al crear Cliente
# --------------------------

@receiver(post_save, sender=Cliente)
def enviar_bienvenida_cliente(sender, instance, created, **kwargs):
    """
    Envía email de bienvenida cuando se crea un Cliente.
    """
    if created:
        enviar_email_bienvenida(instance)

# --------------------------
# SIGNAL 3: Email de confirmación cuando Bodeguero marca entrada a turno
# --------------------------

@receiver(post_save, sender=Bodeguero)
def email_confirmacion_entrada_turno(sender, instance, **kwargs):
    """
    Envía email de confirmación cuando un Bodeguero marca entrada a turno.
    """
    if instance.en_turno and instance.hora_entrada and instance.comprobante_entrada:
        # Solo si está en turno y tiene comprobante
        enviar_email_confirmacion_turno(instance)

# --------------------------
# SIGNAL 4: Recalcular promedio de valoraciones al agregar una nueva
# --------------------------

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
            # Si quieres guardar el promedio en el modelo Producto, agrega un campo y actualízalo aquí.
            # producto.promedio_valoracion = promedio
            # producto.save()
            print(f"[INFO] Promedio de valoraciones actualizado para {producto}: {promedio}")

# --------------------------
# SIGNAL 5: Cuando un Pago es confirmado, actualizar Pedido y notificar Cliente
# --------------------------

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

# --------------------------
# SIGNAL 6 (Opcional): Oferta especial por compra de más de 4 productos
# --------------------------

@receiver(post_save, sender=Pedido)
def oferta_especial_por_compra(sender, instance, created, **kwargs):
    """
    Si un pedido tiene más de 4 productos distintos, enviar oferta especial.
    """
    if created:
        total_productos = sum([item.cantidad for item in instance.items.all()])
        if total_productos > 4:
            enviar_oferta_especial(instance.cliente, instance)

# NOTA: Para integración con DRF, todos los modelos están preparados para ser serializados fácilmente.
# Se recomienda crear signals para auditoría y lógica de negocio adicional según necesidades.