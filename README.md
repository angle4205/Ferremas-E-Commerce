# FERREMAS+ E-Commerce

Proyecto web para la ferretería FERREMAS, desarrollado con un stack moderno de backend y frontend para la gestión y visualización de productos, integración de catálogo, sistema de categorías, autenticación y funcionalidades avanzadas para una experiencia de usuario y administración completa.

---

## Tecnologías utilizadas

- **Backend**: [Django](https://www.djangoproject.com/) (Python)
- **API REST**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Frontend**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [HeroUI React](https://heroui.chat/)
- **Routing**: [react-router-dom](https://reactrouter.com/)
- **Base de datos**: SQLite (desarrollo)/ MySQL (Pendiente de Migración)
- **Herramientas Adicionales**: Vite (build frontend), Iconify (iconos), TailwindCSS (estilos utilitarios)

---

## Estructura del repositorio

```
Ferremas-E-Commerce/
├── backend/                 # Proyecto Django (api, modelos, admin, autenticación)
├── frontend/                # Aplicación React (Vite, TypeScript, HeroUI, vistas, componentes)
├── manage.py
├── README.md
└── ...
```

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/angle4205/Ferremas-E-Commerce.git
cd Ferremas-E-Commerce
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

- El backend correrá en `http://localhost:8000/` (puede variar según configuración)

### 3. Frontend

```bash
cd frontend
npm install
npm run build
npm run dev
```

- El dev frontend correrá en `http://localhost:5173/` (puede variar según configuración)

---

## Integrantes del equipo

- Angel Gómez (Frontend Development, Backend Development)
- Benjamín Ibaceta (Bussines Analyst, Quality Assurance)
- Benjamín Ojeda (Software Architect, Backend Development)
- Moisés Roa (Software Architect, Quality Assurance)
- Ricardo Tapia (Software Architect, Quality Assurance)

### Docente

- David O. Larrondo N.

### Universidad

- DUOC UC - Sede Viña del Mar
- Integración de Plataformas sección 001D

---

## Licencia

Uso académico - DUOC UC, 2025.
