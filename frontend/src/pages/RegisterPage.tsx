import React, { useState } from "react";
import { Input, Button, Card } from "@heroui/react";
import { getCookie } from "../utils/cookies";

const RegisterPage: React.FC<{
  onRegisterSuccess?: () => void;
  onShowLogin?: () => void;
}> = ({ onRegisterSuccess, onShowLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password1 !== password2) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ username, email, password: password1 }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.mensaje || data.detail || "Error al registrar");
      } else {
        setError(null);
        if (onRegisterSuccess) onRegisterSuccess();
      }
    } catch {
      setError("Error de red");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-4">Crear cuenta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password1}
            onChange={e => setPassword1(e.target.value)}
            required
          />
          <Input
            label="Repetir contraseña"
            type="password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
          />
          {error && <div className="text-danger-500 text-sm">{error}</div>}
          <Button color="primary" type="submit" fullWidth isLoading={loading}>
            Registrarse
          </Button>
          <Button
            variant="light"
            type="button"
            fullWidth
            onClick={onShowLogin}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;