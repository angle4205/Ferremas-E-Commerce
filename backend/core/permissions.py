from rest_framework.permissions import BasePermission

class IsAdminOrEmpleadoEspecial(BasePermission):
    """
    Permite acceso a superusuarios, staff, empleados con rol ADMINISTRADOR,
    o empleados con subrol CONTADOR o BODEGUERO.
    """
    def has_permission(self, request, view):
        user = request.user
        profile = getattr(user, "profile", None)
        if user.is_superuser or user.is_staff:
            return True
        if profile:
            if getattr(profile.rol, "nombre", None) == "ADMINISTRADOR":
                return True
            if getattr(profile.rol, "nombre", None) == "EMPLEADO" and profile.tipo_empleado in ["CONTADOR", "BODEGUERO"]:
                return True
        return False

class IsSoloAdmin(BasePermission):
    """
    Permite acceso solo a superusuarios, staff o empleados con rol ADMINISTRADOR.
    """
    def has_permission(self, request, view):
        user = request.user
        profile = getattr(user, "profile", None)
        if user.is_superuser or user.is_staff:
            return True
        if profile and getattr(profile.rol, "nombre", None) == "ADMINISTRADOR":
            return True
        return False

class IsEmpleadoSubrol(BasePermission):
    """
    Permite acceso solo a empleados con un subrol específico.
    Úsalo así: permission_classes = [IsEmpleadoSubrol.with_subrol("CONTADOR")]
    """
    subrol = None

    @classmethod
    def with_subrol(cls, subrol):
        class CustomSubrol(cls):
            pass
        CustomSubrol.subrol = subrol
        return CustomSubrol

    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return (
            profile
            and getattr(profile.rol, "nombre", None) == "EMPLEADO"
            and profile.tipo_empleado == self.subrol
        )