import os
import shutil
import re

"""
Script para refactorizar la estructura de componentes y páginas en un proyecto React.
- Renombra y mueve componentes a PascalCase en 'components/' y 'components/admin/'.
- Mueve archivos de páginas a 'pages/' y 'pages/admin/' con nombres en PascalCase y terminados en Page.tsx.
- Actualiza los imports en todos los archivos .tsx y .ts.
"""

SRC_DIR = os.path.dirname(os.path.abspath(__file__))
COMPONENTS_DIR = os.path.join(SRC_DIR, "components")
ADMIN_COMPONENTS_DIR = os.path.join(COMPONENTS_DIR, "admin-components")
NEW_ADMIN_COMPONENTS_DIR = os.path.join(COMPONENTS_DIR, "admin")
PAGES_DIR = os.path.join(SRC_DIR, "pages")
ADMIN_PAGES_DIR = os.path.join(PAGES_DIR, "admin")

# --- Configuración de renombrado ---

# Componentes generales
COMPONENTS_RENAME = {
    "cart-modal.tsx": "CartModal.tsx",
    "featured-categories.tsx": "FeaturedCategories.tsx",
    "footer.tsx": "Footer.tsx",
    "hero-section.tsx": "HeroSection.tsx",
    "popular-products.tsx": "PopularProducts.tsx",
    "promo-banner.tsx": "PromoBanner.tsx",
    "service-features.tsx": "ServiceFeatures.tsx",
}

# Componentes admin
ADMIN_COMPONENTS_RENAME = {
    "dashboard-header.tsx": "DashboardHeader.tsx",
    "dashboard-overview.tsx": "DashboardOverview.tsx",
    "inventory-status.tsx": "InventoryStatus.tsx",
    "orders.tsx": "OrdersTable.tsx",
    "recent-orders.tsx": "RecentOrders.tsx",
    "sales-chart.tsx": "SalesChart.tsx",
    "sidebar.tsx": "Sidebar.tsx",
}

# Páginas generales
PAGES_RENAME = {
    "catalog-page.tsx": "CatalogPage.tsx",
    "login-form.tsx": "LoginPage.tsx",
    "register-form.tsx": "RegisterPage.tsx",
    "user-profile.tsx": "ProfilePage.tsx",
    "error-404.tsx": "ErrorPage.tsx",
}

# Página admin principal
ADMIN_PAGES_RENAME = {
    "admin-dashboard.tsx": "AdminDashboardPage.tsx",
}

def ensure_dirs():
    os.makedirs(PAGES_DIR, exist_ok=True)
    os.makedirs(ADMIN_PAGES_DIR, exist_ok=True)
    os.makedirs(NEW_ADMIN_COMPONENTS_DIR, exist_ok=True)

def move_and_rename(src_dir, dst_dir, rename_map, prefix=""):
    moved = []
    for old, new in rename_map.items():
        src = os.path.join(src_dir, old)
        dst = os.path.join(dst_dir, new)
        if os.path.exists(src):
            shutil.move(src, dst)
            moved.append((f"{prefix}{old}", f"{os.path.relpath(dst, SRC_DIR)}"))
    return moved

def update_imports(rename_maps):
    # Unifica todos los renombrados en un solo diccionario para reemplazo
    all_renames = {}
    # components/
    for old, new in COMPONENTS_RENAME.items():
        all_renames[f"./components/{os.path.splitext(old)[0]}"] = f"./components/{os.path.splitext(new)[0]}"
    # components/admin/
    for old, new in ADMIN_COMPONENTS_RENAME.items():
        all_renames[f"./components/admin-components/{os.path.splitext(old)[0]}"] = f"./components/admin/{os.path.splitext(new)[0]}"
    # pages/
    for old, new in PAGES_RENAME.items():
        all_renames[f"./components/{os.path.splitext(old)[0]}"] = f"./pages/{os.path.splitext(new)[0]}"
    # pages/admin/
    for old, new in ADMIN_PAGES_RENAME.items():
        all_renames[f"./components/{os.path.splitext(old)[0]}"] = f"./pages/admin/{os.path.splitext(new)[0]}"

    # Actualiza imports en todos los .tsx y .ts
    for root, _, files in os.walk(SRC_DIR):
        for fname in files:
            if fname.endswith(".tsx") or fname.endswith(".ts"):
                fpath = os.path.join(root, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                new_content = content
                for old_path, new_path in all_renames.items():
                    # from './components/old' o from "./components/old"
                    new_content = re.sub(
                        rf'from\s+["\']{re.escape(old_path)}["\']',
                        f'from "{new_path}"',
                        new_content
                    )
                    # from './components/old.tsx'
                    new_content = re.sub(
                        rf'from\s+["\']{re.escape(old_path)}\.tsx["\']',
                        f'from "{new_path}"',
                        new_content
                    )
                if new_content != content:
                    with open(fpath, "w", encoding="utf-8") as f:
                        f.write(new_content)

def main():
    print("Reestructurando y renombrando componentes y páginas...")
    ensure_dirs()
    moved = []
    moved += move_and_rename(COMPONENTS_DIR, COMPONENTS_DIR, COMPONENTS_RENAME)
    moved += move_and_rename(ADMIN_COMPONENTS_DIR, NEW_ADMIN_COMPONENTS_DIR, ADMIN_COMPONENTS_RENAME, prefix="admin-components/")
    moved += move_and_rename(COMPONENTS_DIR, PAGES_DIR, PAGES_RENAME)
    moved += move_and_rename(COMPONENTS_DIR, ADMIN_PAGES_DIR, ADMIN_PAGES_RENAME)
    print("Archivos movidos y renombrados:")
    for old, new in moved:
        print(f"  {old} -> {new}")
    update_imports([COMPONENTS_RENAME, ADMIN_COMPONENTS_RENAME, PAGES_RENAME, ADMIN_PAGES_RENAME])
    print("Imports actualizados en todos los archivos .tsx y .ts.")
    print("¡Refactorización completada!")

if __name__ == "__main__":
    main()