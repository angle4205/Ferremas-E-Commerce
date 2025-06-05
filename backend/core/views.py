# core/views.py
from django.views.generic import View
from django.http import FileResponse, Http404
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Producto
from .serializers import ProductoSerializer

class LandingView(View):
    def get(self, request, *args, **kwargs):
        index_path = os.path.join(settings.BASE_DIR, "core", "static", "landing", "index.html")
        try:
            return FileResponse(open(index_path, 'rb'), content_type='text/html')
        except FileNotFoundError:
            raise Http404("No se encontró index.html, ¿ejecutaste 'npm run build'?")
        
class ProductoListAPIView(APIView):
    def get(self, request):
        productos = Producto.objects.filter(disponible=True)
        serializer = ProductoSerializer(productos, many=True, context={"request": request})
        return Response(serializer.data)