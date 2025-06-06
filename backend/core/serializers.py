from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    imagen_principal = serializers.ImageField(use_url=True)
    class Meta:
        model = Producto
        fields = [
            "id", "nombre", "marca", "valor", "imagen_principal", "categoria", "disponible"
        ]


# Hay que pasar los serializers de views aca y acomodar views importando este archivo