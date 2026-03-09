'use client';

import { useState, useMemo, useEffect } from 'react';
import { Product, Metal, Purity } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, LayoutGrid, Rows3, Rows4 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CategoryClientPageProps {
  products: Product[];
  metals: Metal[];
  purities: Purity[];
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export function CategoryClientPage({ products, metals, purities }: CategoryClientPageProps) {
  const [filters, setFilters] = useState({
    price: [0, 5000000],
    metals: [] as string[],
    purities: [] as string[],
  });
  const [sortBy, setSortBy] = useState('newest');
  const [sliderPrice, setSliderPrice] = useState<[number, number]>([0, 5000000]);

  // Debounced price filter - updates 300ms after slider stops moving
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, price: sliderPrice }));
    }, 300);
    return () => clearTimeout(timer);
  }, [sliderPrice]);
  const [columns, setColumns] = useState(2);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const activeMetals = useMemo(() => metals.filter(m => products.some(p => p.metal_id === m.id)), [metals, products]);
  const activePurities = useMemo(() => purities.filter(pu => products.some(p => p.purity_id === pu.id)), [purities, products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const [minPrice, maxPrice] = filters.price;
      const priceMatch = product.display_price >= minPrice && product.display_price <= maxPrice;
      const metalMatch = filters.metals.length === 0 || filters.metals.includes(product.metal_id);
      const purityMatch = filters.purities.length === 0 || filters.purities.includes(product.purity_id);
      return priceMatch && metalMatch && purityMatch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.display_price - b.display_price;
        case 'price-desc': return b.display_price - a.display_price;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'newest':
        default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [products, filters, sortBy]);

  const handleFilterChange = (type: 'metals' | 'purities', value: string) => {
    setFilters(prev => {
      const currentValues = prev[type];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [type]: newValues };
    });
  };

  const handlePriceChange = (value: number[]) => {
    setSliderPrice(value as [number, number]);
  };

  const clearFilters = () => {
    setSliderPrice([0, 5000000]);
    setFilters({ price: [0, 5000000], metals: [], purities: [] });
  };

  const activeFilterCount = filters.metals.length + filters.purities.length + (sliderPrice[0] > 0 || sliderPrice[1] < 5000000 ? 1 : 0);

  const FilterSidebarContent = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            {activeFilterCount > 0 &&
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" /> Clear All
                </Button>
            }
        </div>
      <Accordion type="multiple" defaultValue={['price', 'metals', 'purities']} className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">Price Range</AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <Slider
              min={0}
              max={5000000}
              step={50000}
              value={sliderPrice}
              onValueChange={handlePriceChange}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹{(sliderPrice[0] / 1000).toFixed(0)}K</span>
              <span>₹{(sliderPrice[1] / 1000).toFixed(0)}K</span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="metals">
          <AccordionTrigger className="text-base font-medium">Metal</AccordionTrigger>
          <AccordionContent className="pt-2 space-y-2">
            {activeMetals.map(metal => (
              <div key={metal.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`metal-${metal.id}`}
                  checked={filters.metals.includes(metal.id)}
                  onCheckedChange={() => handleFilterChange('metals', metal.id)}
                />
                <Label htmlFor={`metal-${metal.id}`} className="font-normal cursor-pointer">{metal.name}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="purities">
          <AccordionTrigger className="text-base font-medium">Purity</AccordionTrigger>
          <AccordionContent className="pt-2 space-y-2">
            {activePurities.map(purity => (
              <div key={purity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`purity-${purity.id}`}
                  checked={filters.purities.includes(purity.id)}
                  onCheckedChange={() => handleFilterChange('purities', purity.id)}
                />
                <Label htmlFor={`purity-${purity.id}`} className="font-normal cursor-pointer">{purity.label}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start">
      {/* Filters Sidebar - Desktop */}
      <aside className="hidden lg:block lg:col-span-1 sticky top-28">
        <FilterSidebarContent />
      </aside>

      {/* Main content */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2 md:gap-4">
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex-1">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters {activeFilterCount > 0 && <span className="ml-1 text-xs">({activeFilterCount})</span>}
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] sm:w-[350px] overflow-y-auto">
                      <div className="sticky top-0 bg-background z-10 pb-4 border-b mb-4">
                        <h2 className="text-lg font-semibold">Filters</h2>
                      </div>
                      <FilterSidebarContent />
                  </SheetContent>
              </Sheet>
          </div>
          
          {/* Product Count - Hidden on mobile */}
          <p className="hidden sm:block text-sm text-muted-foreground flex-1">
            {filteredAndSortedProducts.length} products
          </p>
          
          {/* Column Toggle & Sort */}
          <div className="flex items-center gap-1 md:gap-2">
              {/* Column Toggle - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:flex items-center gap-0.5 border rounded-md p-0.5">
                  <Button variant={columns === 2 ? 'secondary': 'ghost'} size="icon" className="h-8 w-8" onClick={() => setColumns(2)}><Rows3 className="h-4 w-4" /></Button>
                  <Button variant={columns === 3 ? 'secondary': 'ghost'} size="icon" className="h-8 w-8" onClick={() => setColumns(3)}><LayoutGrid className="h-4 w-4" /></Button>
                  <Button variant={columns === 4 ? 'secondary': 'ghost'} size="icon" className="h-8 w-8" onClick={() => setColumns(4)}><Rows4 className="h-4 w-4" /></Button>
              </div>
              
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] md:w-[180px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
        </div>

        <Separator className="mb-6 md:mb-8" />

        {/* Mobile: Show active filters count */}
        {activeFilterCount > 0 && (
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </p>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          </div>
        )}

        {filteredAndSortedProducts.length > 0 ? (
          <div
             className="grid gap-4 md:gap-6 transition-all"
             style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16 border rounded-lg max-w-3xl mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-semibold">No Products Found</h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Try adjusting your filters or{' '}
              <Button variant="link" className="p-0 h-auto text-sm md:text-base" onClick={clearFilters}>
                clearing them
              </Button>{' '}
              to see all products.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
