# core/views.py
from django.views.generic import View
from django.http import FileResponse, Http404
import os
from django.conf import settings

class LandingView(View):
    def get(self, request, *args, **kwargs):
        index_path = os.path.join(settings.BASE_DIR, "core", "static", "landing", "index.html")
        try:
            return FileResponse(open(index_path, 'rb'), content_type='text/html')
        except FileNotFoundError:
            raise Http404("No se encontró index.html, ¿ejecutaste 'npm run build'?")