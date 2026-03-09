
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { Product, Category, ShopPageContent, Metal, Purity } from '@/lib/types';
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
import { Filter, X, Rows3, LayoutGrid, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: string; className: string }) => {
  if (!name || typeof name !== 'string') return null;
  const LucideIcon = LucideIcons[name as IconName];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} />;
};

interface ShopPageClientProps {
    content: ShopPageContent;
    categories: Category[];
    allCategories: Category[];
    products: Product[];
    metals: Metal[];
    purities: Purity[];
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];


export function ShopPageClient({ content, categories, allCategories, products, metals, purities }: ShopPageClientProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        price: [0, 5000000],
        metals: [] as string[],
        purities: [] as string[],
    });
    const [sliderPrice, setSliderPrice] = useState<[number, number]>([0, 5000000]);
    const [sortBy, setSortBy] = useState('newest');
    const [columns, setColumns] = useState(4);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Debounced price filter - updates 300ms after slider stops moving
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, price: sliderPrice }));
        }, 300);
        return () => clearTimeout(timer);
    }, [sliderPrice]);

    const getSubCategoryIds = useMemo(() => {
        const memoizedGetSubCategoryIds = (parentId: string): string[] => {
            const directChildren = allCategories.filter(c => c.parent_id === parentId).map(c => c.id);
            const nestedChildren = directChildren.flatMap(id => memoizedGetSubCategoryIds(id));
            return [parentId, ...directChildren, ...nestedChildren];
        };
        return memoizedGetSubCategoryIds;
    }, [allCategories]);

    const activeMetals = useMemo(() => metals.filter(m => products.some(p => p.metal_id === m.id)), [metals, products]);
    const activePurities = useMemo(() => purities.filter(pu => products.some(p => p.purity_id === pu.id)), [purities, products]);
    
    const { displayedProducts, totalProductsAfterFilter } = useMemo(() => {
        const categoryIdsToFilter = selectedCategoryId ? getSubCategoryIds(selectedCategoryId) : null;
        
        let filtered = products.filter(product => {
            const categoryMatch = !categoryIdsToFilter || product.category_ids.some(catId => categoryIdsToFilter.includes(catId));
            const [minPrice, maxPrice] = filters.price;
            const priceMatch = product.display_price >= minPrice && product.display_price <= maxPrice;
            const metalMatch = filters.metals.length === 0 || filters.metals.includes(product.metal_id);
            const purityMatch = filters.purities.length === 0 || filters.purities.includes(product.purity_id);
            return categoryMatch && priceMatch && metalMatch && purityMatch;
        });

        const sorted = filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.display_price - b.display_price;
                case 'price-desc': return b.display_price - a.display_price;
                case 'newest': default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        const total = sorted.length;
        
        // If a category is selected, only show 10 products on this page
        if (selectedCategoryId) {
            return { displayedProducts: sorted.slice(0, 10), totalProductsAfterFilter: total };
        }

        return { displayedProducts: sorted, totalProductsAfterFilter: total };
    }, [products, filters, sortBy, selectedCategoryId, getSubCategoryIds]);

    const handleFilterChange = (type: 'metals' | 'purities', value: string) => {
        setFilters(prev => ({
            ...prev,
            [type]: prev[type].includes(value)
                ? prev[type].filter(v => v !== value)
                : [...prev[type], value],
        }));
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
                <span>₹{sliderPrice[0].toLocaleString('en-IN')}</span>
                <span>₹{sliderPrice[1].toLocaleString('en-IN')}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="metals">
            <AccordionTrigger className="text-base font-medium">Metal</AccordionTrigger>
            <AccordionContent className="pt-2 space-y-2">
              {activeMetals.map(metal => (
                <div key={metal.id} className="flex items-center space-x-2">
                  <Checkbox id={`metal-${metal.id}`} checked={filters.metals.includes(metal.id)} onCheckedChange={() => handleFilterChange('metals', metal.id)} />
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
                  <Checkbox id={`purity-${purity.id}`} checked={filters.purities.includes(purity.id)} onCheckedChange={() => handleFilterChange('purities', purity.id)} />
                  <Label htmlFor={`purity-${purity.id}`} className="font-normal cursor-pointer">{purity.label}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
    
    return (
        <div className="container mx-auto py-12 md:py-16">
            {/* Category selection */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h2 className="text-3xl font-headline font-bold">{content.main.title}</h2>
                <div className="flex items-center gap-2 mt-4 md:mt-0 overflow-x-auto pb-2">
                    <Button variant={selectedCategoryId === null ? 'default' : 'outline'} onClick={() => setSelectedCategoryId(null)}>
                        {content.main.allProductsLinkText}
                    </Button>
                    {categories.map(category => (
                        <Button key={category.id} variant={selectedCategoryId === category.id ? 'default' : 'outline'} onClick={() => setSelectedCategoryId(category.id)}>
                           {category.icon && <Icon name={category.icon} className="mr-2 h-4 w-4" />}
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            <Separator className="mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Filters Sidebar - Desktop */}
                <aside className="hidden lg:block lg:col-span-1 sticky top-28">
                    <FilterSidebarContent />
                </aside>

                {/* Main content */}
                <main className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <div className="lg:hidden">
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px]">
                                    <FilterSidebarContent />
                                </SheetContent>
                            </Sheet>
                        </div>
                        <p className="text-sm text-muted-foreground hidden sm:block">
                            Showing {displayedProducts.length} of {totalProductsAfterFilter} products
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-1 border rounded-md p-0.5">
                                <Button variant={columns === 3 ? 'secondary': 'ghost'} size="icon" className="h-8 w-8" onClick={() => setColumns(3)}><Rows3 /></Button>
                                <Button variant={columns === 4 ? 'secondary': 'ghost'} size="icon" className="h-8 w-8" onClick={() => setColumns(4)}><LayoutGrid /></Button>
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {displayedProducts.length > 0 ? (
                        <div className="grid gap-6 transition-all" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                            {displayedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border rounded-lg max-w-3xl mx-auto">
                            <h2 className="text-2xl font-semibold">No Products Found</h2>
                            <p className="mt-2 text-muted-foreground">
                            Try adjusting your filters or <Button variant="link" className="p-0 h-auto" onClick={clearFilters}>clearing them</Button>.
                            </p>
                        </div>
                    )}
                    
                    {selectedCategoryId && totalProductsAfterFilter > 10 && (
                        <div className="text-center mt-12">
                            <Button asChild size="lg">
                                <Link href={`/category/${selectedCategoryId}`}>
                                    View All {totalProductsAfterFilter} Products
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
