import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";

const API_BASE_URL = "http://localhost:8000/api";

const PagoExitoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setSuccess(false);
      return;
    }
    // Llama a tu backend para verificar el estado del pago
    fetch(`${API_BASE_URL}/pago/stripe/confirm/?session_id=${sessionId}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setSuccess(data.success === true))
      .catch(() => setSuccess(false));
  }, [searchParams]);

  if (success === null) return null; // o un spinner

  return (
    <ConfirmationModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      success={success}
    />
  );
};

export default PagoExitoPage;