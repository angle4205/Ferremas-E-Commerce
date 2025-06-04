import React from "react";
import { Card, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export const PromoBanner: React.FC = () => {
  return (
    <Card className="w-full mb-16 bg-gradient-to-r from-warning-500 to-warning-600 border-none">
      <div className="flex flex-col md:flex-row items-center p-6 md:p-8">
        <div className="md:w-2/3 mb-6 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Summer Sale - Up to 40% Off!
          </h2>
          <p className="text-white/80 mb-4 max-w-lg">
            Take advantage of our biggest sale of the season. Upgrade your toolkit with premium quality products at unbeatable prices.
          </p>
          <div className="flex gap-3">
            <Button 
              color="default" 
              variant="solid"
              endContent={<Icon icon="lucide:arrow-right" />}
            >
              Shop the Sale
            </Button>
            <Button 
              color="default" 
              variant="bordered"
              className="bg-transparent border-white text-white"
            >
              Learn More
            </Button>
          </div>
        </div>
        <div className="md:w-1/3 flex justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 w-32 h-32 flex items-center justify-center">
            <div className="text-center">
              <span className="block text-4xl font-bold text-white">40%</span>
              <span className="text-white/90 font-medium">OFF</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};