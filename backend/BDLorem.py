import os
import django
import random
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta, datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth.models import User
from core.models import (
    Categoria,
    Marca,
    Sucursal,
    Producto,
    Cliente,
    UserProfile,
    Pedido,
    ItemPedido,
    Pago,
    Rol,
)

# Este script está diseñado para ejecutarse de forma independiente y poblar la base de datos con datos de demostración.
# No debe ser importado como un módulo en otras partes de la aplicación.

def clear_all():
    # Borra en orden seguro (hijos primero)
    Pago.objects.all().delete()
    ItemPedido.objects.all().delete()
    Pedido.objects.all().delete()
    Producto.objects.all().delete()
    Cliente.objects.all().delete()
    UserProfile.objects.all().delete()
    # Borra todos los usuarios excepto superuser y admin demo
    User.objects.exclude(username__in=["admin"]).delete()
    Marca.objects.all().delete()
    Categoria.objects.all().delete()
    Sucursal.objects.all().delete()
    Rol.objects.all().delete()

def get_or_create_user(username, email, password, is_staff=False, is_superuser=False):
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "is_staff": is_staff,
            "is_superuser": is_superuser,
        },
    )
    if created:
        user.set_password(password)
        user.save()
    return user

def random_past_datetime(start_date, end_date):
    """Devuelve un datetime aleatorio entre start_date y end_date (ambos datetime, aware)"""
    delta = end_date - start_date
    int_delta = int(delta.total_seconds())
    random_second = random.randint(0, int_delta)
    return start_date + timedelta(seconds=random_second)

def run():
    clear_all()
    # --- Roles ---
    rol_admin, _ = Rol.objects.get_or_create(nombre="ADMINISTRADOR")
    rol_empleado, _ = Rol.objects.get_or_create(nombre="EMPLEADO")

    # --- Categorías ---
    categorias = [
        Categoria.objects.create(nombre="Herramientas", descripcion="Herramientas manuales y eléctricas"),
        Categoria.objects.create(nombre="Construcción", descripcion="Materiales de construcción"),
        Categoria.objects.create(nombre="Electricidad", descripcion="Materiales eléctricos"),
        Categoria.objects.create(nombre="Pinturas", descripcion="Pinturas y accesorios"),
    ]

    # --- Sucursales ---
    sucursal = Sucursal.objects.create(
        nombre="Sucursal Central",
        direccion="Av. Principal 123, Santiago",
        latitud=-33.45,
        longitud=-70.66
    )

    # --- Marcas ---
    marcas = [
        Marca.objects.create(nombre="Truper"),
        Marca.objects.create(nombre="Bosch"),
        Marca.objects.create(nombre="3M"),
        Marca.objects.create(nombre="Stanley"),
        Marca.objects.create(nombre="Makita"),
    ]
    for marca in marcas:
        for cat in categorias:
            marca.categorias.add(cat)

    # --- Productos ---
    productos = []
    for i in range(30):
        categoria = random.choice(categorias)
        marca = random.choice(marcas)
        producto = Producto.objects.create(
            nombre=f"Producto Demo {i+1}",
            marca=marca,
            categoria=categoria,
            descripcion=f"Descripción del producto demo {i+1}",
            valor=random.randint(3000, 120000),
            stock=random.randint(5, 100),
            sucursal=sucursal,
            disponible=True,
        )
        productos.append(producto)

    # --- Usuarios y Perfiles ---
    # Admin
    admin_user = get_or_create_user(
        "admin", "admin@demo.cl", "admin123", is_staff=True, is_superuser=True
    )
    admin_profile, _ = UserProfile.objects.get_or_create(user=admin_user)
    admin_profile.rol = rol_admin
    admin_profile.save()

    # Empleados
    empleados = []
    for i, subrol in enumerate(["BODEGUERO", "CONTADOR", "EMPLEADO"]):
        username = f"empleado{i+1}"
        email = f"empleado{i+1}@demo.cl"
        user = get_or_create_user(username, email, "empleado123")
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.rol = rol_empleado
        profile.tipo_empleado = subrol
        profile.sucursal = sucursal
        profile.save()
        empleados.append(profile)

    # --- Clientes ---
    clientes = []
    for i in range(15):
        username = f"cliente{i+1}"
        email = f"cliente{i+1}@demo.cl"
        user = get_or_create_user(username, email, "cliente123")
        cliente, _ = Cliente.objects.get_or_create(
            user=user, defaults={"email": user.email}
        )
        clientes.append(cliente)

    # --- Pedidos, Items y Pagos con fechas variadas ---
    estados = [
        "SOLICITADO",
        "PREPARACION",
        "ENVIADO",
        "ENTREGADO",
        "CANCELADO",
        "LISTO_RETIRO",
    ]
    metodos = ["RETIRO_TIENDA", "DESPACHO_DOMICILIO"]

    hoy = timezone.now().date()
    hace_60_dias = hoy - timedelta(days=60)

    # Genera fechas distribuidas: al menos 2 pedidos por día en los últimos 21 días
    fechas_pedidos = []
    for dias_atras in range(21):
        fecha = hoy - timedelta(days=dias_atras)
        for _ in range(random.randint(2, 4)):
            fechas_pedidos.append(
                timezone.make_aware(datetime.combine(fecha, datetime.min.time()) + timedelta(hours=random.randint(8, 20)))
            )
    # Agrega fechas más antiguas para variedad
    for _ in range(30):
        fechas_pedidos.append(random_past_datetime(
            timezone.make_aware(datetime.combine(hace_60_dias, datetime.min.time())),
            timezone.make_aware(datetime.combine(hoy - timedelta(days=22), datetime.min.time()))
        ))

    random.shuffle(fechas_pedidos)

    for i, fecha_creacion in enumerate(fechas_pedidos):
        cliente = random.choice(clientes)
        # Distribuye estados para asegurar variedad
        if i % 10 == 0:
            estado = "CANCELADO"
        elif i % 7 == 0:
            estado = "ENTREGADO"
        elif i % 5 == 0:
            estado = "ENVIADO"
        elif i % 3 == 0:
            estado = "PREPARACION"
        elif i % 2 == 0:
            estado = "LISTO_RETIRO"
        else:
            estado = "SOLICITADO"
        metodo = random.choice(metodos)
        pedido = Pedido.objects.create(
            cliente=cliente,
            estado=estado,
            metodo_retiro=metodo,
            total=0,  # Se recalcula abajo
            fecha_creacion=fecha_creacion,
        )
        # Agregar items
        total = 0
        for _ in range(random.randint(1, 6)):
            producto = random.choice(productos)
            cantidad = random.randint(1, 5)
            item = ItemPedido.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=producto.valor,
            )
            total += int(producto.valor) * cantidad
        pedido.total = total
        pedido.save()
        # Asignar bodeguero aleatorio si corresponde
        if random.choice([True, False]):
            bodeguero = next(
                (e for e in empleados if e.tipo_empleado == "BODEGUERO"), None
            )
            if bodeguero:
                pedido.bodeguero_asignado = bodeguero.user
                pedido.save()
        # Crear pago si corresponde
        if pedido.estado in ["ENTREGADO", "ENVIADO", "PREPARACION", "LISTO_RETIRO"]:
            Pago.objects.create(
                pedido=pedido,
                stripe_id=f"stripe_{pedido.id}",
                estado="COMPLETADO",
                metodo="Stripe",
                monto=pedido.total,
            )

    print("¡Datos de prueba variados generados exitosamente!")

if __name__ == "__main__":
    run()