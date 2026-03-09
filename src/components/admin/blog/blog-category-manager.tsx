
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BlogCategory } from "@/lib/types";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCategoryManagerProps {
    allCategories: BlogCategory[];
    selectedCategoryIds: string[];
    onSelectedCategoryIdsChange: (ids: string[]) => void;
}

export function BlogCategoryManager({ 
    allCategories, 
    selectedCategoryIds, 
    onSelectedCategoryIdsChange
}: BlogCategoryManagerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (categoryId: string) => {
        onSelectedCategoryIdsChange(
            selectedCategoryIds.includes(categoryId)
                ? selectedCategoryIds.filter(id => id !== categoryId)
                : [...selectedCategoryIds, categoryId]
        );
        setOpen(false);
    };

    const handleRemove = (categoryId: string) => {
        onSelectedCategoryIdsChange(selectedCategoryIds.filter(id => id !== categoryId));
    };
    
    const selectedCategories = allCategories.filter(c => selectedCategoryIds.includes(c.id));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Assign categories to this post.</CardDescription>
            </CardHeader>
            <CardContent>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between h-auto min-h-10"
                        >
                            <div className="flex gap-1 flex-wrap">
                                {selectedCategories.length > 0 ? (
                                    selectedCategories.map(category => (
                                        <Badge
                                            variant="secondary"
                                            key={category.id}
                                            className="mr-1"
                                            onClick={(e) => { e.stopPropagation(); handleRemove(category.id); }}
                                        >
                                            {category.name}
                                            <X className="ml-1 h-3 w-3" />
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">Select categories...</span>
                                )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search categories..." />
                            <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                {allCategories.map(category => (
                                    <CommandItem
                                        key={category.id}
                                        value={category.name}
                                        onSelect={() => handleSelect(category.id)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCategoryIds.includes(category.id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {category.name}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </CardContent>
        </Card>
    );
}

