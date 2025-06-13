import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Icon } from "@iconify/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  success,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col items-center">
                  {success ? (
                    <>
                      <Icon icon="mdi:check-circle" width={64} className="text-green-500 mb-4" />
                      <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        ¡Pago confirmado!
                      </h3>
                      <p className="text-gray-700 dark:text-gray-200 mb-4 text-center">
                        Tu pago fue procesado exitosamente. Pronto recibirás la confirmación de tu pedido.
                      </p>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:close-circle" width={64} className="text-red-500 mb-4" />
                      <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                        Pago rechazado
                      </h3>
                      <p className="text-gray-700 dark:text-gray-200 mb-4 text-center">
                        Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o usa otro método.
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600"
                    onClick={onClose}
                  >
                    {success ? "Aceptar" : "Volver al carrito"}
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

export default ConfirmationModal;