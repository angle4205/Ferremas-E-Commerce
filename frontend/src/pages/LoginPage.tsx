import React, { useState } from "react";
import { Input, Button, Card } from "@heroui/react";
import { getCookie } from "../utils/cookies";

const LoginPage: React.FC<{
  onLoginSuccess?: () => void;
  onShowRegister?: () => void;
}> = ({ onLoginSuccess, onShowRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.mensaje || data.detail || "Credenciales incorrectas");
      } else {
        setError(null);
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch {
      setError("Error de red");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-danger-500 text-sm">{error}</div>}
          <Button color="primary" type="submit" fullWidth isLoading={loading}>
            Entrar
          </Button>
          <Button
            variant="light"
            type="button"
            fullWidth
            onClick={onShowRegister}
          >
            ¿No tienes cuenta? Regístrate
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;