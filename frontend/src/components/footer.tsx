import React from "react";
import { Link, Divider, Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-content2 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Icon icon="lucide:hammer" className="text-primary text-2xl" />
              <span className="font-bold text-xl ml-2">ToolMaster</span>
            </div>
            <p className="text-default-600 mb-4">
              Your one-stop shop for quality tools and hardware for professionals and DIY enthusiasts.
            </p>
            <div className="flex gap-4">
              <Button isIconOnly variant="flat" size="sm" radius="full">
                <Icon icon="logos:facebook" size={20} />
              </Button>
              <Button isIconOnly variant="flat" size="sm" radius="full">
                <Icon icon="logos:instagram-icon" size={20} />
              </Button>
              <Button isIconOnly variant="flat" size="sm" radius="full">
                <Icon icon="logos:twitter" size={20} />
              </Button>
              <Button isIconOnly variant="flat" size="sm" radius="full">
                <Icon icon="logos:youtube-icon" size={20} />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link color="foreground" href="#">Power Tools</Link></li>
              <li><Link color="foreground" href="#">Hand Tools</Link></li>
              <li><Link color="foreground" href="#">Electrical</Link></li>
              <li><Link color="foreground" href="#">Plumbing</Link></li>
              <li><Link color="foreground" href="#">Garden & Outdoor</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link color="foreground" href="#">Contact Us</Link></li>
              <li><Link color="foreground" href="#">FAQs</Link></li>
              <li><Link color="foreground" href="#">Shipping & Returns</Link></li>
              <li><Link color="foreground" href="#">Warranty Information</Link></li>
              <li><Link color="foreground" href="#">Store Locator</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-default-600 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter your email" 
                type="email"
                className="max-w-[220px]"
              />
              <Button color="primary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <Divider className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-default-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ToolMaster. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link color="foreground" href="#" size="sm">Privacy Policy</Link>
            <Link color="foreground" href="#" size="sm">Terms of Service</Link>
            <Link color="foreground" href="#" size="sm">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};