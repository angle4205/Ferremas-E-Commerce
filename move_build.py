import os
import shutil

# Rutas
DIST_DIR = os.path.join("frontend", "dist")
DJANGO_STATIC_LANDING = os.path.join("backend", "core", "static", "landing")

def clean_and_copy(src, dst):
    # Borra la carpeta destino si existe
    if os.path.exists(dst):
        print(f"Borrando contenido anterior en: {dst}")
        shutil.rmtree(dst)
    # Copia la build nueva
    print(f"Copiando build de {src} a {dst}")
    shutil.copytree(src, dst)

if __name__ == "__main__":
    if not os.path.exists(DIST_DIR):
        print(f"La carpeta {DIST_DIR} no existe. Ejecuta primero 'npm run build'.")
    else:
        clean_and_copy(DIST_DIR, DJANGO_STATIC_LANDING)
        print("Build copiada exitosamente desde el frontend al backend.")