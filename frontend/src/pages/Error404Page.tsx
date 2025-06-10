import React from "react";
import { Card, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

const Error404Page: React.FC<{ onGoHome?: () => void }> = ({ onGoHome }) => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <Card className="w-full max-w-md p-8 flex flex-col items-center shadow-lg">
      <Icon icon="lucide:alert-triangle" className="text-danger-500" width={48} height={48} />
      <h1 className="text-3xl font-bold mt-4 mb-2 text-center">404</h1>
      <p className="text-lg text-default-600 mb-6 text-center">
        Esta página o funcionalidad aún no está disponible.
      </p>
      <Button
        color="primary"
        startContent={<Icon icon="lucide:arrow-left" />}
        onClick={onGoHome}
      >
        Volver al inicio
      </Button>
    </Card>
  </div>
);

export default Error404Page;