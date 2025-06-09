import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Icon } from "@iconify/react";

// Tipos necesarios
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

// Servicios API
const API_BASE_URL = "http://localhost:8000/api";

const getCart = async (): Promise<{ items: CartItem[]; total: number }> => {
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error al obtener el carrito");
  }
  return response.json();
};

const updateCartItem = async (
  itemId: number,
  quantity: number
): Promise<CartItem> => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    throw new Error("Error al actualizar el producto");
  }
  return response.json();
};

const removeCartItem = async (itemId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}/`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Error al eliminar el producto");
  }
};

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const { items, total } = await getCart();
      setCartItems(items);
      setTotal(total);
    } catch (err) {
      setError("Error al cargar el carrito. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    try {
      const updatedItem = await updateCartItem(itemId, quantity);
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item))
      );
      fetchCart(); // Refresh total
    } catch {
      setError("Error al actualizar la cantidad.");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeCartItem(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      fetchCart(); // Refresh total
    } catch {
      setError("Error al eliminar el producto.");
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold text-gray-900 flex items-center justify-between"
                >
                  <span>Carrito de Compras</span>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                  >
                    <Icon icon="lucide:x" size={20} />
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
                    <p className="text-center text-gray-500">Tu carrito está vacío.</p>
                  ) : (
                    <div>
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between mb-4 border-b pb-4"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 ml-4">
                            <h4 className="text-sm font-medium">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              ${item.product.price} x {item.quantity}
                            </p>
                            <p className="text-sm font-bold">
                              Subtotal: ${item.subtotal}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value, 10)
                                )
                              }
                              className="w-12 border rounded text-center"
                            />
                            <button
                              className="ml-2 text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Icon icon="lucide:trash" size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4">
                        <h4 className="text-lg font-bold">
                          Total: ${total.toFixed(2)}
                        </h4>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={onClose}
                  >
                    Seguir comprando
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={onCheckout}
                  >
                    Ir a pagar
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