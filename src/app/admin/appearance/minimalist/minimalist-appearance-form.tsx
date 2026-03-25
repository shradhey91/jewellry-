"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type {
  MinimalistHomepageContent,
  MinimalistHeroSlide,
  TextHighlightItem,
  SplitBannerItem,
  ImageGridSection,
  TestimonialItem,
  JournalEntry,
  ImageSliderItem,
  Cta,
  Category,
} from "@/lib/types";
import { saveMinimalistHomepageAction, MinimalistFormState } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoSelectorDialog } from "@/components/admin/media/video-selector-dialog";
import { uploadFileAction } from "@/lib/server/actions/media";

interface MinimalistAppearanceFormProps {
  content: MinimalistHomepageContent;
  categories: Category[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

const useArrayState = <T extends { id: string }>(
  initialValue: T[] | undefined,
) => {
  const [items, setItems] = useState(initialValue || []);

  const updateItem = useCallback((id: string, field: keyof T, value: any) => {
    setItems((current) =>
      current.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );
  }, []);

  const updateNestedItem = useCallback(
    <K extends keyof T>(
      id: string,
      parentField: K,
      nestedField: keyof T[K],
      value: any,
    ) => {
      setItems((current) =>
        current.map((i) =>
          i.id === id
            ? {
                ...i,
                [parentField]: { ...i[parentField], [nestedField]: value },
              }
            : i,
        ),
      );
    },
    [],
  );

  const addItem = useCallback((newItem: T) => {
    setItems((current) => [...current, newItem]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  return { items, setItems, updateItem, addItem, removeItem, updateNestedItem };
};

export function MinimalistAppearanceForm({
  content,
  categories,
}: MinimalistAppearanceFormProps) {
  const initialState: MinimalistFormState = { message: "", errors: {} };
  const [state, formAction] = useFormState(
    saveMinimalistHomepageAction,
    initialState,
  );
  const { toast } = useToast();

  const {
    items: heroSlides,
    setItems: setHeroSlides,
    updateItem: updateHeroSlide,
    updateNestedItem: updateHeroSlideCta,
    addItem: addHeroSlide,
    removeItem: removeHeroSlide,
  } = useArrayState(content.hero.slides);
  const {
    items: heroCards,
    setItems: setHeroCards,
    updateItem: updateHeroCard,
    addItem: addHeroCard,
    removeItem: removeHeroCard,
  } = useArrayState(content.diamond_interpretations.cards);
  const {
    items: secondaryCollections,
    setItems: setSecondaryCollections,
    updateItem: updateSecondaryCollection,
    addItem: addSecondaryCollection,
    removeItem: removeSecondaryCollection,
  } = useArrayState(content.signature_collections.collections.secondary);
  const {
    items: catGridItems,
    setItems: setCatGridItems,
    updateItem: updateCatGridItem,
    addItem: addCatGridItem,
    removeItem: removeCatGridItem,
  } = useArrayState(content.category_grid_with_trending.categories.items);
  const {
    items: catTrendingItems,
    setItems: setCatTrendingItems,
    updateItem: updateCatTrendingItem,
    addItem: addCatTrendingItem,
    removeItem: removeCatTrendingItem,
  } = useArrayState(content.category_grid_with_trending.trending.items);
  const {
    items: worldItems,
    setItems: setWorldItems,
    updateItem: updateWorldItem,
    addItem: addWorldItem,
    removeItem: removeWorldItem,
  } = useArrayState(content.world_of_brand.items);
  const {
    items: imageSliderItems,
    setItems: setImageSliderItems,
    updateItem: updateImageSliderItem,
    addItem: addImageSliderItem,
    removeItem: removeImageSliderItem,
  } = useArrayState(content.imageSlider.items);
  const {
    items: splitBannerBanners,
    setItems: setSplitBannerBanners,
    updateItem: updateSplitBannerItem,
  } = useArrayState(content.splitBanner.banners);
  const {
    items: textHighlightsItems,
    setItems: setTextHighlightsItems,
    updateItem: updateTextHighlightItem,
    addItem: addTextHighlightItem,
    removeItem: removeTextHighlightItem,
  } = useArrayState(content.textHighlights.items);
  const {
    items: imageGridItems,
    setItems: setImageGridItems,
    updateItem: updateImageGridItem,
  } = useArrayState(content.imageGrid.items as any[]);
  const {
    items: testimonialsItems,
    setItems: setTestimonialsItems,
    updateItem: updateTestimonialItem,
    addItem: addTestimonialItem,
    removeItem: removeTestimonialItem,
  } = useArrayState(content.testimonials.items);
  const {
    items: assuranceItems,
    setItems: setAssuranceItems,
    updateItem: updateAssuranceItem,
  } = useArrayState(content.assurance_and_exchange.assurance.items);
  const {
    items: experiencesItems,
    setItems: setExperiencesItems,
    updateItem: updateExperienceItem,
    addItem: addExperienceItem,
    removeItem: removeExperienceItem,
  } = useArrayState(content.gifts_and_experiences.experiences.items);

  const [instagramUrls, setInstagramUrls] = useState(
    (content.instagram.postImageUrls || []).join("\n"),
  );

  const [exchangeImage, setExchangeImage] = useState(
    content.assurance_and_exchange.exchange.image,
  );
  const [giftImage, setGiftImage] = useState(
    content.gifts_and_experiences.gift.image,
  );

  const [primaryCollection, setPrimaryCollection] = useState(
    content.signature_collections.collections.primary,
  );

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <input
        type="hidden"
        name="hero-slides"
        value={JSON.stringify(heroSlides)}
      />
      <input
        type="hidden"
        name="diamond_interpretations-cards"
        value={JSON.stringify(heroCards)}
      />
      <input
        type="hidden"
        name="collections-primary"
        value={JSON.stringify([primaryCollection])}
      />
      <input
        type="hidden"
        name="collections-secondary"
        value={JSON.stringify(secondaryCollections)}
      />
      <input
        type="hidden"
        name="cat-grid-items"
        value={JSON.stringify(catGridItems)}
      />
      <input
        type="hidden"
        name="cat-trending-items"
        value={JSON.stringify(catTrendingItems)}
      />
      <input
        type="hidden"
        name="world-items"
        value={JSON.stringify(worldItems)}
      />
      <input
        type="hidden"
        name="imageSlider-items"
        value={JSON.stringify(imageSliderItems)}
      />
      <input
        type="hidden"
        name="splitBanner-banners"
        value={JSON.stringify(splitBannerBanners)}
      />
      <input
        type="hidden"
        name="textHighlights-items"
        value={JSON.stringify(textHighlightsItems)}
      />
      <input
        type="hidden"
        name="imageGrid-items"
        value={JSON.stringify(imageGridItems)}
      />
      <input
        type="hidden"
        name="instagram-postImageUrls"
        value={instagramUrls}
      />
      <input
        type="hidden"
        name="testimonials-items"
        value={JSON.stringify(testimonialsItems)}
      />
      <input
        type="hidden"
        name="assurance-items"
        value={JSON.stringify(assuranceItems)}
      />
      <input
        type="hidden"
        name="experiences-items"
        value={JSON.stringify(experiencesItems)}
      />

      <input type="hidden" name="exchange-image" value={exchangeImage} />
      <input type="hidden" name="gift-image" value={giftImage} />

      <div className="space-y-6">
        <Accordion
          type="multiple"
          defaultValue={["hero"]}
          className="w-full space-y-4"
        >
          <AccordionItem value="hero">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Hero Section</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="hero-enabled"
                  label="Enable Hero Section"
                  defaultChecked={content.hero.enabled}
                />
                <Label>Hero Slides</Label>
                {heroSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="p-4 border rounded space-y-4 relative"
                  >
                    <ItemRemoveButton
                      onClick={() => removeHeroSlide(slide.id)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Title"
                        value={slide.title}
                        onChange={(e) =>
                          updateHeroSlide(slide.id, "title", e.target.value)
                        }
                      />
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={slide.type}
                          onValueChange={(value) =>
                            updateHeroSlide(slide.id, "type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Textarea
                        value={slide.subtitle}
                        onChange={(e) =>
                          updateHeroSlide(slide.id, "subtitle", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="CTA Label"
                        value={slide.cta.label}
                        onChange={(e) =>
                          updateHeroSlideCta(
                            slide.id,
                            "cta",
                            "label",
                            e.target.value,
                          )
                        }
                      />
                      <InputField
                        label="CTA Link"
                        value={slide.cta.href}
                        onChange={(e) =>
                          updateHeroSlideCta(
                            slide.id,
                            "cta",
                            "href",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <ImageUpload
                      label="Image URL (fallback for video)"
                      value={slide.imageUrl}
                      onChange={(url) =>
                        updateHeroSlide(slide.id, "imageUrl", url)
                      }
                    />
                    <VideoSelector
                      label="Video URL (optional)"
                      value={slide.videoUrl || ""}
                      onChange={(url) =>
                        updateHeroSlide(slide.id, "videoUrl", url)
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addHeroSlide({
                      id: `new-${Date.now()}`,
                      type: "image",
                      title: "New Slide",
                      subtitle: "",
                      cta: { label: "Shop Now", href: "/" },
                      imageUrl: "",
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Slide
                </Button>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="diamond_interpretations">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Diamond Interpretations</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="diamond_interpretations-enabled"
                  label="Enable Section"
                  defaultChecked={content.diamond_interpretations.enabled}
                />
                <InputField
                  name="diamond_interpretations-title"
                  label="Section Title"
                  defaultValue={content.diamond_interpretations.title}
                />
                <Label>Interpretation Cards</Label>
                {heroCards.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded space-y-2 relative"
                  >
                    <ItemRemoveButton onClick={() => removeHeroCard(item.id)} />
                    <InputField
                      label="Title"
                      value={item.title}
                      onChange={(e) =>
                        updateHeroCard(item.id, "title", e.target.value)
                      }
                    />
                    <ImageUpload
                      label="Image URL"
                      value={item.image}
                      onChange={(url) => updateHeroCard(item.id, "image", url)}
                    />
                    <InputField
                      label="Link URL"
                      value={item.href}
                      onChange={(e) =>
                        updateHeroCard(item.id, "href", e.target.value)
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addHeroCard({
                      id: `new-${Date.now()}`,
                      title: "New Card",
                      image: "",
                      href: "",
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Card
                </Button>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="collections">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Signature Collections</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="signature_collections-enabled"
                  label="Enable Section"
                  defaultChecked={content.signature_collections.enabled}
                />
                <InputField
                  name="collections-title"
                  label="Section Title"
                  defaultValue={content.signature_collections.title}
                />
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label className="font-semibold">Primary Collection</Label>
                  <InputField
                    label="Title"
                    value={primaryCollection.title}
                    onChange={(e) =>
                      setPrimaryCollection((c) => ({
                        ...c,
                        title: e.target.value,
                      }))
                    }
                  />
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={primaryCollection.type || "image"}
                      onValueChange={(value) =>
                        setPrimaryCollection((c) => ({
                          ...c,
                          type: value as "image" | "video",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ImageUpload
                    label="Image URL (or video fallback)"
                    value={primaryCollection.image}
                    onChange={(url) =>
                      setPrimaryCollection((c) => ({ ...c, image: url }))
                    }
                  />
                  {primaryCollection.type === "video" && (
                    <VideoSelector
                      label="Video URL"
                      value={primaryCollection.videoUrl || ""}
                      onChange={(url) =>
                        setPrimaryCollection((c) => ({ ...c, videoUrl: url }))
                      }
                    />
                  )}
                  <InputField
                    label="Link URL"
                    value={primaryCollection.href}
                    onChange={(e) =>
                      setPrimaryCollection((c) => ({
                        ...c,
                        href: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                  <Label className="font-semibold">Secondary Collections</Label>
                  {secondaryCollections.map((item) => (
                    <div
                      key={item.id}
                      className="space-y-2 p-2 border rounded relative"
                    >
                      <ItemRemoveButton
                        onClick={() => removeSecondaryCollection(item.id)}
                      />
                      <InputField
                        label="Title"
                        value={item.title}
                        onChange={(e) =>
                          updateSecondaryCollection(
                            item.id,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                      <ImageUpload
                        label="Image URL"
                        value={item.image}
                        onChange={(url) =>
                          updateSecondaryCollection(item.id, "image", url)
                        }
                      />
                      <InputField
                        label="Link URL"
                        value={item.href}
                        onChange={(e) =>
                          updateSecondaryCollection(
                            item.id,
                            "href",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addSecondaryCollection({
                        id: `new-${Date.now()}`,
                        title: "New Collection",
                        image: "",
                        href: "",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Secondary
                    Collection
                  </Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="category_grid_with_trending">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Category Grid & Trending</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="category_grid_with_trending-enabled"
                  label="Enable Section"
                  defaultChecked={content.category_grid_with_trending.enabled}
                />
                <InputField
                  name="cat-grid-title"
                  label="Category Grid Title"
                  defaultValue={
                    content.category_grid_with_trending.categories.title
                  }
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Category Items</Label>
                  {catGridItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded space-y-2 relative"
                    >
                      <ItemRemoveButton
                        onClick={() => removeCatGridItem(item.id)}
                      />
                      <InputField
                        label="Title"
                        value={item.title}
                        onChange={(e) =>
                          updateCatGridItem(item.id, "title", e.target.value)
                        }
                      />
                      <ImageUpload
                        label="Image URL"
                        value={item.image}
                        onChange={(url) =>
                          updateCatGridItem(item.id, "image", url)
                        }
                      />
                      <InputField
                        label="Link URL"
                        value={item.href}
                        onChange={(e) =>
                          updateCatGridItem(item.id, "href", e.target.value)
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addCatGridItem({
                        id: `new-${Date.now()}`,
                        title: "New Category",
                        image: "",
                        href: "",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                  </Button>
                </div>
                <InputField
                  name="cat-trending-title"
                  label="Trending Section Title"
                  defaultValue={
                    content.category_grid_with_trending.trending.title
                  }
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Trending Items</Label>
                  {catTrendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded space-y-2 relative"
                    >
                      <ItemRemoveButton
                        onClick={() => removeCatTrendingItem(item.id)}
                      />
                      <InputField
                        label="Title"
                        value={item.title}
                        onChange={(e) =>
                          updateCatTrendingItem(
                            item.id,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                      <ImageUpload
                        label="Image URL"
                        value={item.image}
                        onChange={(url) =>
                          updateCatTrendingItem(item.id, "image", url)
                        }
                      />
                      <InputField
                        label="Link URL"
                        value={item.href}
                        onChange={(e) =>
                          updateCatTrendingItem(item.id, "href", e.target.value)
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addCatTrendingItem({
                        id: `new-${Date.now()}`,
                        title: "New Trending Item",
                        image: "",
                        href: "",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Trending Item
                  </Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="world_of_brand">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>World of Brand</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="world_of_brand-enabled"
                  label="Enable Section"
                  defaultChecked={content.world_of_brand.enabled}
                />
                <InputField
                  name="world-title"
                  label="Section Title"
                  defaultValue={content.world_of_brand.title}
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Brand Items</Label>
                  {worldItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded space-y-2 relative"
                    >
                      <ItemRemoveButton
                        onClick={() => removeWorldItem(item.id)}
                      />
                      <InputField
                        label="Title"
                        value={item.title}
                        onChange={(e) =>
                          updateWorldItem(item.id, "title", e.target.value)
                        }
                      />
                      <ImageUpload
                        label="Image URL"
                        value={item.image}
                        onChange={(url) =>
                          updateWorldItem(item.id, "image", url)
                        }
                      />
                      <InputField
                        label="Link URL"
                        value={item.href}
                        onChange={(e) =>
                          updateWorldItem(item.id, "href", e.target.value)
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addWorldItem({
                        id: `new-${Date.now()}`,
                        title: "New Item",
                        image: "",
                        href: "",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="newestProducts">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Newest Products Carousel</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="newestProducts-enabled"
                  label="Enable Section"
                  defaultChecked={content.newestProducts.enabled}
                />
                <InputField
                  name="newestProducts-title"
                  label="Section Title"
                  defaultValue={content.newestProducts.title}
                />
                <CategorySelector
                  name="newestProducts-categoryId"
                  label="Category (Optional)"
                  categories={categories}
                  defaultValue={content.newestProducts.categoryId}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="bestSellers">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Best Sellers Carousel</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="bestSellers-enabled"
                  label="Enable Section"
                  defaultChecked={content.bestSellers.enabled}
                />
                <InputField
                  name="bestSellers-title"
                  label="Section Title"
                  defaultValue={content.bestSellers.title}
                />
                <CategorySelector
                  name="bestSellers-categoryId"
                  label="Category (Optional)"
                  categories={categories}
                  defaultValue={content.bestSellers.categoryId}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="imageSlider">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Image Slider</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="imageSlider-enabled"
                  label="Enable Section"
                  defaultChecked={content.imageSlider.enabled}
                />
                <InputField
                  name="imageSlider-eyebrow"
                  label="Eyebrow"
                  defaultValue={content.imageSlider.eyebrow}
                />
                <InputField
                  name="imageSlider-title"
                  label="Title"
                  defaultValue={content.imageSlider.title}
                />
                <InputField
                  name="imageSlider-ctaText"
                  label="CTA Text"
                  defaultValue={content.imageSlider.ctaText}
                />
                <InputField
                  name="imageSlider-ctaLink"
                  label="CTA Link"
                  defaultValue={content.imageSlider.ctaLink}
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Slider Images</Label>
                  {imageSliderItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded space-y-2 relative"
                    >
                      <ItemRemoveButton
                        onClick={() => removeImageSliderItem(item.id)}
                      />
                      <ImageUpload
                        label="Image URL"
                        value={item.imageUrl}
                        onChange={(url) =>
                          updateImageSliderItem(item.id, "imageUrl", url)
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addImageSliderItem({
                        id: `new-${Date.now()}`,
                        imageUrl: "",
                        imageHint: "",
                        link: "#",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Image
                  </Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="splitBanner">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Split Banner</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="splitBanner-enabled"
                  label="Enable Section"
                  defaultChecked={content.splitBanner.enabled}
                />
                {splitBannerBanners.map((banner, index) => (
                  <div key={banner.id} className="p-4 border rounded space-y-2">
                    <InputField
                      label={`Banner ${index + 1} Title`}
                      value={banner.title}
                      onChange={(e) =>
                        updateSplitBannerItem(
                          banner.id,
                          "title",
                          e.target.value,
                        )
                      }
                    />
                    <InputField
                      label={`Banner ${index + 1} Description`}
                      value={banner.description}
                      onChange={(e) =>
                        updateSplitBannerItem(
                          banner.id,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                    <InputField
                      label={`Banner ${index + 1} Button Label`}
                      value={banner.buttonLabel}
                      onChange={(e) =>
                        updateSplitBannerItem(
                          banner.id,
                          "buttonLabel",
                          e.target.value,
                        )
                      }
                    />
                    <InputField
                      label={`Banner ${index + 1} Button Link`}
                      value={banner.buttonLink}
                      onChange={(e) =>
                        updateSplitBannerItem(
                          banner.id,
                          "buttonLink",
                          e.target.value,
                        )
                      }
                    />
                    <ImageUpload
                      label={`Banner ${index + 1} Image URL`}
                      value={banner.imageUrl}
                      onChange={(url) =>
                        updateSplitBannerItem(banner.id, "imageUrl", url)
                      }
                    />
                  </div>
                ))}
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="textHighlights">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Text Highlights</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="textHighlights-enabled"
                  label="Enable Section"
                  defaultChecked={content.textHighlights.enabled}
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Highlight Items</Label>
                  {textHighlightsItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded space-y-2 relative"
                    >
                      <ItemRemoveButton
                        onClick={() => removeTextHighlightItem(item.id)}
                      />
                      <InputField
                        label="Title"
                        value={item.title}
                        onChange={(e) =>
                          updateTextHighlightItem(
                            item.id,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                      <InputField
                        label="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateTextHighlightItem(
                            item.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addTextHighlightItem({
                        id: `new-${Date.now()}`,
                        title: "New Highlight",
                        description: "Description",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Highlight
                  </Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="imageGrid">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Image Grid</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="imageGrid-enabled"
                  label="Enable Section"
                  defaultChecked={content.imageGrid.enabled}
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Grid Items</Label>
                  {imageGridItems.map((item) => (
                    <div key={item.id} className="p-2 border rounded space-y-2">
                      {item.type === "image" ? (
                        <>
                          <Label>Image Item</Label>
                          <ImageUpload
                            label="Image URL"
                            value={item.imageUrl}
                            onChange={(url) =>
                              updateImageGridItem(item.id, "imageUrl", url)
                            }
                          />
                        </>
                      ) : (
                        <>
                          <Label>Text Item</Label>
                          <InputField
                            label="Title"
                            value={item.title}
                            onChange={(e) =>
                              updateImageGridItem(
                                item.id,
                                "title",
                                e.target.value,
                              )
                            }
                          />
                          <InputField
                            label="Content"
                            value={item.content}
                            onChange={(e) =>
                              updateImageGridItem(
                                item.id,
                                "content",
                                e.target.value,
                              )
                            }
                          />
                          <InputField
                            label="Button Label"
                            value={item.buttonLabel}
                            onChange={(e) =>
                              updateImageGridItem(
                                item.id,
                                "buttonLabel",
                                e.target.value,
                              )
                            }
                          />
                          <InputField
                            label="Button Link"
                            value={item.buttonLink}
                            onChange={(e) =>
                              updateImageGridItem(
                                item.id,
                                "buttonLink",
                                e.target.value,
                              )
                            }
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="instagram">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Instagram Feed</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="instagram-enabled"
                  label="Enable Section"
                  defaultChecked={content.instagram.enabled}
                />
                <InputField
                  name="instagram-handle"
                  label="Instagram Handle"
                  defaultValue={content.instagram.handle}
                />
                <div className="space-y-2">
                  <Label>Post Image URLs (one per line)</Label>
                  <Textarea
                    name="instagram-postImageUrls"
                    value={instagramUrls}
                    onChange={(e) => setInstagramUrls(e.target.value)}
                    rows={5}
                  />
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="testimonials">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Testimonials</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="testimonials-enabled"
                  label="Enable Section"
                  defaultChecked={content.testimonials.enabled}
                />
                <InputField
                  name="testimonials-title"
                  label="Section Title"
                  defaultValue={content.testimonials.title}
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Testimonials</Label>
                  {testimonialsItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded space-y-2 relative"
                    >
                      <ItemRemoveButton
                        onClick={() => removeTestimonialItem(item.id)}
                      />
                      <InputField
                        label="Name"
                        value={item.name}
                        onChange={(e) =>
                          updateTestimonialItem(item.id, "name", e.target.value)
                        }
                      />
                      <InputField
                        label="Location"
                        value={item.location}
                        onChange={(e) =>
                          updateTestimonialItem(
                            item.id,
                            "location",
                            e.target.value,
                          )
                        }
                      />
                      <Textarea
                        value={item.text}
                        onChange={(e) =>
                          updateTestimonialItem(item.id, "text", e.target.value)
                        }
                        placeholder="Review text"
                      />
                      <InputField
                        label="Rating"
                        type="number"
                        value={String(item.rating)}
                        onChange={(e) =>
                          updateTestimonialItem(
                            item.id,
                            "rating",
                            Number(e.target.value),
                          )
                        }
                      />
                      <ImageUpload
                        label="Image URL"
                        value={item.imageUrl}
                        onChange={(url) =>
                          updateTestimonialItem(item.id, "imageUrl", url)
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addTestimonialItem({
                        id: `new-${Date.now()}`,
                        name: "New Person",
                        location: "City",
                        text: "",
                        rating: 5,
                        imageUrl: "",
                        imageHint: "",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Testimonial
                  </Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="assurance_and_exchange">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Assurance & Exchange</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="assurance_and_exchange-enabled"
                  label="Enable Section"
                  defaultChecked={content.assurance_and_exchange.enabled}
                />
                <InputField
                  name="assurance-title"
                  label="Assurance Section Title"
                  defaultValue={content.assurance_and_exchange.assurance.title}
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Assurance Items</Label>
                  {assuranceItems.map((item) => (
                    <div key={item.id} className="p-2 border rounded space-y-2">
                      <InputField
                        label="Title"
                        value={item.title}
                        onChange={(e) =>
                          updateAssuranceItem(item.id, "title", e.target.value)
                        }
                      />
                      <InputField
                        label="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateAssuranceItem(
                            item.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
                <InputField
                  name="exchange-title"
                  label="Exchange Section Title"
                  defaultValue={content.assurance_and_exchange.exchange.title}
                />
                <InputField
                  name="exchange-subtitle"
                  label="Exchange Subtitle"
                  defaultValue={
                    content.assurance_and_exchange.exchange.subtitle
                  }
                />
                <ImageUpload
                  label="Exchange Image URL"
                  value={exchangeImage}
                  onChange={setExchangeImage}
                />
                <InputField
                  name="exchange-cta-label"
                  label="Exchange CTA Label"
                  defaultValue={
                    content.assurance_and_exchange.exchange.cta.label
                  }
                />
                <InputField
                  name="exchange-cta-href"
                  label="Exchange CTA Link"
                  defaultValue={
                    content.assurance_and_exchange.exchange.cta.href
                  }
                />
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="journal">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Journal Section</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="journal-enabled"
                  label="Enable Section"
                  defaultChecked={content.journal.enabled}
                />
                <InputField
                  name="journal-title"
                  label="Section Title"
                  defaultValue={content.journal.title}
                />
                <CategorySelector
                  name="journal-categoryId"
                  label="Blog Category (Optional)"
                  categories={categories}
                  defaultValue={content.journal.categoryId}
                />
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="gifts_and_experiences">
            <Card>
              <AccordionTrigger className="p-6 w-full">
                <CardHeader className="p-0 text-left">
                  <CardTitle>Gifts & Experiences</CardTitle>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-4">
                <SwitchField
                  name="gifts_and_experiences-enabled"
                  label="Enable Section"
                  defaultChecked={content.gifts_and_experiences.enabled}
                />
                <InputField
                  name="gift-title"
                  label="Gift Section Title"
                  defaultValue={content.gifts_and_experiences.gift.title}
                />
                <InputField
                  name="gift-subtitle"
                  label="Gift Subtitle"
                  defaultValue={content.gifts_and_experiences.gift.subtitle}
                />
                <ImageUpload
                  label="Gift Image URL"
                  value={giftImage}
                  onChange={setGiftImage}
                />
                <InputField
                  name="gift-cta-label"
                  label="Gift CTA Label"
                  defaultValue={content.gifts_and_experiences.gift.cta.label}
                />
                <InputField
                  name="gift-cta-href"
                  label="Gift CTA Link"
                  defaultValue={content.gifts_and_experiences.gift.cta.href}
                />
                <InputField
                  name="experiences-title"
                  label="Experiences Title"
                  defaultValue={content.gifts_and_experiences.experiences.title}
                />
                <div className="space-y-2 p-2 border rounded-md">
                  <Label>Experience Items</Label>
                  {experiencesItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border rounded space-y-2 relative"
                    >
                      <ItemRemoveButton
                        onClick={() => removeExperienceItem(item.id)}
                      />
                      <InputField
                        label="Title"
                        value={item.title}
                        onChange={(e) =>
                          updateExperienceItem(item.id, "title", e.target.value)
                        }
                      />
                      <InputField
                        label="Subtitle"
                        value={item.subtitle}
                        onChange={(e) =>
                          updateExperienceItem(
                            item.id,
                            "subtitle",
                            e.target.value,
                          )
                        }
                      />
                      <ImageUpload
                        label="Image URL"
                        value={item.image}
                        onChange={(url) =>
                          updateExperienceItem(item.id, "image", url)
                        }
                      />
                      <InputField
                        label="Link URL"
                        value={item.href}
                        onChange={(e) =>
                          updateExperienceItem(item.id, "href", e.target.value)
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addExperienceItem({
                        id: `new-${Date.now()}`,
                        title: "New Experience",
                        subtitle: "",
                        image: "",
                        href: "",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                  </Button>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
        <Card>
          <CardFooter className="p-6">
            <SubmitButton />
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}

// Helper components
const SwitchField = ({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label?: string;
  defaultChecked: boolean;
}) => (
  <div className="flex items-center justify-between rounded-lg border p-3">
    <Label htmlFor={name} className="text-sm font-medium">
      {label || "Enable Section"}
    </Label>
    <Switch id={name} name={name} defaultChecked={defaultChecked} />
  </div>
);

const InputField = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  defaultValue,
}: {
  name?: string;
  label: string;
  type?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  defaultValue?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      defaultValue={defaultValue}
    />
  </div>
);

const ItemRemoveButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="absolute top-1 right-1 h-6 w-6"
    onClick={onClick}
  >
    <Trash2 className="h-4 w-4 text-destructive" />
  </Button>
);

const CategorySelector = ({
  name,
  label,
  categories,
  defaultValue,
}: {
  name: string;
  label: string;
  categories: Category[];
  defaultValue: string | null | undefined;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Select name={name} defaultValue={defaultValue || "null"}>
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="null">All Posts</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ImageUpload = ({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", "themes/minimalist");

      const result = await uploadFileAction(formData);

      if (result.success && result.url) {
        onChange(result.url);
        toast({
          title: "Upload successful",
          description: "Image has been uploaded.",
        });
      } else {
        toast({
          title: "Upload failed",
          description: result.message,
          variant: "destructive",
        });
      }
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {value && (
          <Image
            src={value}
            alt="preview"
            width={64}
            height={64}
            className="rounded-md border object-cover h-16 w-16"
          />
        )}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload"
        />
        <Button
          asChild
          variant="outline"
          className="relative"
          disabled={isUploading}
        >
          <div>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </div>
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};

const VideoSelector = ({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or choose from library"
        />
        <VideoSelectorDialog onSelect={onChange} />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};
