import React from "react";
import { Card, CardBody, CardFooter, Button, Chip, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  category: string;
}

interface FilterState {
  category: string;
  priceRange: string;
  sortBy: string;
  searchQuery: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Card className="w-full" isPressable disableRipple>
      <CardBody className="p-0 overflow-hidden">
        <div className="relative">
          {product.isNew && (
            <Chip 
              color="primary" 
              variant="flat" 
              size="sm" 
              className="absolute top-2 left-2 z-10"
            >
              New
            </Chip>
          )}
          {product.isBestSeller && (
            <Chip 
              color="warning" 
              variant="flat" 
              size="sm" 
              className="absolute top-2 left-2 z-10"
            >
              Best Seller
            </Chip>
          )}
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full aspect-square object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-foreground/90 line-clamp-1">{product.name}</h3>
          <div className="flex items-center mt-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Icon 
                key={i} 
                icon={i < product.rating ? "lucide:star" : "lucide:star"} 
                className={i < product.rating ? "text-warning" : "text-default-300"} 
                size={14} 
              />
            ))}
            <span className="text-default-500 text-xs ml-1">({Math.floor(Math.random() * 500) + 10})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-default-500 text-sm line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button 
          fullWidth 
          color="primary" 
          variant="flat"
          startContent={<Icon icon="lucide:shopping-cart" size={18} />}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export const CatalogPage: React.FC = () => {
  const [filters, setFilters] = React.useState<FilterState>({
    category: "all",
    priceRange: "all",
    sortBy: "popular",
    searchQuery: ""
  });
  
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  const allProducts: Product[] = [
    {
      id: 1,
      name: "Professional Cordless Drill Set",
      price: 129.99,
      originalPrice: 159.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=6",
      isBestSeller: true,
      category: "power_tools"
    },
    {
      id: 2,
      name: "Premium Tool Box with Organizer",
      price: 79.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=7",
      category: "hand_tools"
    },
    {
      id: 3,
      name: "Heavy Duty Work Gloves",
      price: 24.99,
      originalPrice: 34.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=8",
      category: "safety"
    },
    {
      id: 4,
      name: "Precision Screwdriver Set",
      price: 49.99,
      rating: 5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=9",
      isNew: true,
      category: "hand_tools"
    },
    {
      id: 5,
      name: "Digital Laser Measuring Tool",
      price: 89.99,
      originalPrice: 109.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=10",
      category: "power_tools"
    },
    {
      id: 6,
      name: "Adjustable Wrench Set",
      price: 39.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=11",
      category: "hand_tools"
    },
    {
      id: 7,
      name: "Smart Home Electrical Kit",
      price: 149.99,
      rating: 5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=12",
      isNew: true,
      category: "electrical"
    },
    {
      id: 8,
      name: "Professional Safety Helmet",
      price: 34.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=13",
      category: "safety"
    },
    {
      id: 9,
      name: "Circular Saw with Laser Guide",
      price: 119.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=14",
      category: "power_tools"
    },
    {
      id: 10,
      name: "Plumbing Pipe Wrench Set",
      price: 45.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=15",
      category: "plumbing"
    },
    {
      id: 11,
      name: "Electric Lawn Mower",
      price: 249.99,
      originalPrice: 299.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/landscape?w=400&h=400&u=2",
      category: "garden"
    },
    {
      id: 12,
      name: "Garden Pruning Shears",
      price: 22.99,
      rating: 4,
      image: "https://img.heroui.chat/image/landscape?w=400&h=400&u=3",
      category: "garden"
    },
    {
      id: 13,
      name: "Electrical Wire Cutter",
      price: 18.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=16",
      category: "electrical"
    },
    {
      id: 14,
      name: "Hammer Drill with Case",
      price: 159.99,
      originalPrice: 189.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=17",
      category: "power_tools"
    },
    {
      id: 15,
      name: "Pipe Fitting Kit",
      price: 29.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=18",
      category: "plumbing"
    },
    {
      id: 16,
      name: "Garden Hose Expandable",
      price: 34.99,
      rating: 4,
      image: "https://img.heroui.chat/image/landscape?w=400&h=400&u=4",
      category: "garden"
    },
    {
      id: 17,
      name: "Safety Goggles Anti-Fog",
      price: 15.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=19",
      category: "safety"
    },
    {
      id: 18,
      name: "Electrical Multimeter",
      price: 49.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=20",
      category: "electrical"
    },
    {
      id: 19,
      name: "Plumbing Snake Drain Auger",
      price: 27.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=21",
      category: "plumbing"
    },
    {
      id: 20,
      name: "Cordless Leaf Blower",
      price: 89.99,
      rating: 4,
      image: "https://img.heroui.chat/image/landscape?w=400&h=400&u=5",
      category: "garden"
    },
    {
      id: 21,
      name: "Precision Level Tool",
      price: 29.99,
      rating: 5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=22",
      category: "hand_tools"
    },
    {
      id: 22,
      name: "Protective Work Boots",
      price: 79.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=23",
      category: "safety"
    },
    {
      id: 23,
      name: "Electrical Junction Box",
      price: 12.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=24",
      category: "electrical"
    },
    {
      id: 24,
      name: "Plumbing Compression Fittings",
      price: 18.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=25",
      category: "plumbing"
    }
  ];

  const categoryOptions = [
    { key: "all", label: "All Categories" },
    { key: "power_tools", label: "Power Tools" },
    { key: "hand_tools", label: "Hand Tools" },
    { key: "electrical", label: "Electrical" },
    { key: "plumbing", label: "Plumbing" },
    { key: "garden", label: "Garden & Outdoor" },
    { key: "safety", label: "Safety Equipment" }
  ];

  const priceRangeOptions = [
    { key: "all", label: "All Prices" },
    { key: "under25", label: "Under $25" },
    { key: "25to50", label: "$ 25 - $ 50" },
    { key: "50to100", label: "$ 50 - $ 100" },
    { key: "over100", label: "Over $100" }
  ];

  const sortOptions = [
    { key: "popular", label: "Most Popular" },
    { key: "newest", label: "Newest" },
    { key: "priceAsc", label: "Price: Low to High" },
    { key: "priceDesc", label: "Price: High to Low" },
    { key: "rating", label: "Highest Rated" }
  ];

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    setCurrentPage(1);
  };

  // Apply filters and sorting
  const filteredProducts = React.useMemo(() => {
    let result = [...allProducts];

    // Filter by category
    if (filters.category !== "all") {
      result = result.filter(product => product.category === filters.category);
    }

    // Filter by price range
    switch (filters.priceRange) {
      case "under25":
        result = result.filter(product => product.price < 25);
        break;
      case "25to50":
        result = result.filter(product => product.price >= 25 && product.price <= 50);
        break;
      case "50to100":
        result = result.filter(product => product.price > 50 && product.price <= 100);
        break;
      case "over100":
        result = result.filter(product => product.price > 100);
        break;
      default:
        break;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "priceAsc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        // For demo purposes, we'll sort by ID (higher ID = newer)
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        // Default popular sorting (using best seller flag and rating)
        result.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return b.rating - a.rating;
        });
    }

    return result;
  }, [filters, allProducts]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get the current category label
  const currentCategoryLabel = categoryOptions.find(cat => cat.key === filters.category)?.label || "All Categories";

  return (
    <div className="mb-16">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem>Catalog</BreadcrumbItem>
        <BreadcrumbItem>{currentCategoryLabel}</BreadcrumbItem>
      </Breadcrumbs>
      
      <h1 className="text-3xl font-bold mb-8">Product Catalog</h1>
      
      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            startContent={<Icon icon="lucide:search" size={18} />}
            clearable
            className="w-full"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                endContent={<Icon icon="lucide:chevron-down" size={16} />}
              >
                {currentCategoryLabel}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Categories"
              selectionMode="single"
              selectedKeys={[filters.category]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0]?.toString() || "all";
                handleFilterChange("category", selected);
              }}
            >
              {categoryOptions.map((category) => (
                <DropdownItem key={category.key}>{category.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                endContent={<Icon icon="lucide:chevron-down" size={16} />}
              >
                {priceRangeOptions.find(p => p.key === filters.priceRange)?.label || "All Prices"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Price Range"
              selectionMode="single"
              selectedKeys={[filters.priceRange]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0]?.toString() || "all";
                handleFilterChange("priceRange", selected);
              }}
            >
              {priceRangeOptions.map((price) => (
                <DropdownItem key={price.key}>{price.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                endContent={<Icon icon="lucide:chevron-down" size={16} />}
              >
                {sortOptions.find(s => s.key === filters.sortBy)?.label || "Sort By"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Sort By"
              selectionMode="single"
              selectedKeys={[filters.sortBy]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0]?.toString() || "popular";
                handleFilterChange("sortBy", selected);
              }}
            >
              {sortOptions.map((sort) => (
                <DropdownItem key={sort.key}>{sort.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      
      {/* Results count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-default-500">
          Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
          {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
        </p>
        
        {filteredProducts.length > itemsPerPage && (
          <div className="hidden md:block">
            <Pagination 
              total={totalPages} 
              page={currentPage} 
              onChange={setCurrentPage}
              showControls
            />
          </div>
        )}
      </div>
      
      {/* Products Grid */}
      {currentProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card className="w-full p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Icon icon="lucide:search-x" size={48} className="text-default-400" />
            <h3 className="text-xl font-semibold">No products found</h3>
            <p className="text-default-500">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              color="primary" 
              variant="flat"
              onClick={() => setFilters({
                category: "all",
                priceRange: "all",
                sortBy: "popular",
                searchQuery: ""
              })}
            >
              Clear All Filters
            </Button>
          </div>
        </Card>
      )}
      
      {/* Bottom Pagination (Mobile & Desktop) */}
      {filteredProducts.length > itemsPerPage && (
        <div className="flex justify-center mt-8">
          <Pagination 
            total={totalPages} 
            page={currentPage} 
            onChange={setCurrentPage}
            showControls
          />
        </div>
      )}
    </div>
  );
};