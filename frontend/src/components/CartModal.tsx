import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { getCookie } from "../utils/cookies";
import { loadStripe } from "@stripe/stripe-js";

declare global {
  interface ImportMeta {
    env: {
      VITE_STRIPE_PUBLIC_KEY?: string;
      [key: string]: any;
    };
  }
}

interface CartItem {
  id: number;
  producto?: {
    id: number;
    nombre: string;
    valor: number;
    imagen_principal: string;
    marca?: string;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onPaymentSuccess?: () => void; // <-- Añade esta prop para abrir ConfirmacionModal
}

const API_BASE_URL = "http://localhost:8000/api";
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_xxx"; // Usa tu clave pública

const formatoCLP = (valor: number) =>
  valor.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });

async function getCart(): Promise<{ items: CartItem[]; total: number }> {
  const response = await fetch(`${API_BASE_URL}/cart/`, { credentials: "include" });
  if (!response.ok) throw new Error("Error al obtener el carrito");
  return response.json();
}

async function updateCartItem(itemId: number, cantidad: number): Promise<CartItem> {
  const csrftoken = getCookie("csrftoken");
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken || "",
    },
    credentials: "include",
    body: JSON.stringify({ cantidad }),
  });
  if (!response.ok) throw new Error("Error al actualizar el producto");
  return response.json();
}

async function removeCartItem(itemId: number): Promise<void> {
  const csrftoken = getCookie("csrftoken");
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}/delete/`, {
    method: "DELETE",
    headers: { "X-CSRFToken": csrftoken || "" },
    credentials: "include",
  });
  if (!response.ok) throw new Error("Error al eliminar el producto");
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onCheckout,
  onPaymentSuccess,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false); // Estado para animación de pago
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) fetchCart();
    // eslint-disable-next-line
  }, [isOpen]);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const { items, total } = await getCart();
      setCartItems(items);
      setTotal(total);
      const values: Record<number, string> = {};
      items.forEach((item) => {
        values[item.id] = item.cantidad.toString();
      });
      setInputValues(values);
    } catch {
      setError("Error al cargar el carrito. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (itemId: number, value: string) => {
    if (/^\d*$/.test(value)) {
      setInputValues((prev) => ({ ...prev, [itemId]: value }));
    }
  };

  const handleInputBlur = async (itemId: number) => {
    const value = inputValues[itemId];
    const cantidad = parseInt(value, 10);
    if (!value || isNaN(cantidad) || cantidad < 1) {
      const original = cartItems.find((i) => i.id === itemId)?.cantidad ?? 1;
      setInputValues((prev) => ({ ...prev, [itemId]: original.toString() }));
      return;
    }
    try {
      await updateCartItem(itemId, cantidad);
      fetchCart();
    } catch {
      setError("Error al actualizar la cantidad.");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: number) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeCartItem(itemId);
      fetchCart();
    } catch {
      setError("Error al eliminar el producto.");
    }
  };

  // --- Stripe Checkout ---
  const handleStripeCheckout = async () => {
    setPaying(true);
    setError(null);
    try {
      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`${API_BASE_URL}/pago/stripe/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken || "",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al iniciar el pago.");
        setPaying(false);
        return;
      }
      const data = await response.json();
      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
      if (!stripe) {
        setError("No se pudo cargar Stripe.");
        setPaying(false);
        return;
      }
      // Redirige al portal de pago de Stripe
      const { sessionId } = data;
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) {
        setError(stripeError.message || "Error al redirigir a Stripe.");
        setPaying(false);
      }
      // El usuario será redirigido, así que no necesitas cerrar el modal aquí.
    } catch (e) {
      setError("Error al conectar con Stripe.");
      setPaying(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center justify-between"
                >
                  <span>Carrito de Compras</span>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={onClose}
                  >
                    <Icon icon="lucide:x" width={20} />
                  </button>
                </Dialog.Title>
                <div className="mt-4">
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <span>Cargando...</span>
                    </div>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : cartItems.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">Tu carrito está vacío.</p>
                  ) : (
                    <div>
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between mb-4 border-b pb-4 border-gray-200 dark:border-gray-700"
                        >
                          {item.producto ? (
                            <>
                              <img
                                src={
                                  item.producto.imagen_principal
                                    ? item.producto.imagen_principal.startsWith("http")
                                      ? item.producto.imagen_principal
                                      : `http://localhost:8000${item.producto.imagen_principal}`
                                    : "https://via.placeholder.com/64"
                                }
                                alt={item.producto.nombre}
                                className="w-16 h-16 object-cover rounded bg-white"
                              />
                              <div className="flex-1 ml-4">
                                <h4 className="text-sm font-medium dark:text-gray-100">
                                  {item.producto.nombre}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatoCLP(item.precio_unitario)} x {item.cantidad}
                                </p>
                                <p className="text-sm font-bold dark:text-gray-200">
                                  Subtotal: {formatoCLP(item.subtotal)}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  min="1"
                                  value={inputValues[item.id] ?? item.cantidad.toString()}
                                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                                  onBlur={() => handleInputBlur(item.id)}
                                  onKeyDown={(e) => handleInputKeyDown(e, item.id)}
                                  className="w-12 border rounded text-center dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                                />
                                <button
                                  type="button"
                                  className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Icon icon="lucide:trash" width={20} height={20} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 ml-4 text-red-500">
                              Producto no disponible
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="mt-4">
                        <h4 className="text-lg font-bold dark:text-gray-100">
                          Total: {formatoCLP(total)}
                        </h4>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                    onClick={onClose}
                    disabled={paying}
                  >
                    Seguir comprando
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center"
                    onClick={handleStripeCheckout}
                    disabled={paying || cartItems.length === 0}
                  >
                    {paying ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      "Ir a pagar"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CartModal;