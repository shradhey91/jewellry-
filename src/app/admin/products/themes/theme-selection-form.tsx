"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveThemeSelection } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Active Theme"}</Button>;
}

interface ThemeSelectionFormProps {
  currentTheme: string;
}

export function ThemeSelectionForm({ currentTheme }: ThemeSelectionFormProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const { toast } = useToast();
  const [state, formAction] = useFormState(saveThemeSelection, { message: "" });
  
  useEffect(() => {
    if (state.message) {
        toast({
            title: "Success",
            description: state.message,
        });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Available Themes</CardTitle>
          <CardDescription>
            Select a theme to apply it to all product pages across your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            name="theme"
            value={selectedTheme}
            onValueChange={setSelectedTheme}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Label
              htmlFor="theme-default"
              className={cn(
                "block rounded-lg border-2 p-4 cursor-pointer",
                selectedTheme === 'default' ? "border-primary" : "border-border"
              )}
            >
              <div className="flex items-center gap-4">
                 <RadioGroupItem value="default" id="theme-default" />
                 <span className="font-semibold text-lg">Theme 1 (Default)</span>
              </div>
               <p className="text-sm text-muted-foreground mt-2 pl-8">The standard product page layout with a two-column design.</p>
            </Label>
             <Label
              htmlFor="theme-2"
              className={cn(
                "block rounded-lg border-2 p-4 cursor-pointer",
                selectedTheme === 'theme_2' ? "border-primary" : "border-border"
              )}
            >
               <div className="flex items-center gap-4">
                 <RadioGroupItem value="theme_2" id="theme-2" />
                 <span className="font-semibold text-lg">Theme 2 (CaratLane-inspired)</span>
              </div>
                <p className="text-sm text-muted-foreground mt-2 pl-8">A modern, two-column layout inspired by CaratLane for a clean user experience.</p>
            </Label>
             <Label
              htmlFor="theme-3"
              className={cn(
                "block rounded-lg border-2 p-4 cursor-pointer",
                selectedTheme === 'theme_3' ? "border-primary" : "border-border"
              )}
            >
               <div className="flex items-center gap-4">
                 <RadioGroupItem value="theme_3" id="theme-3" />
                 <span className="font-semibold text-lg">Theme 3 (Luxury Beige)</span>
              </div>
                <p className="text-sm text-muted-foreground mt-2 pl-8">An elegant, single-column design with a luxurious beige palette and serif typography.</p>
            </Label>
            <Label
              htmlFor="theme-4"
              className={cn(
                "block rounded-lg border-2 p-4 cursor-pointer",
                selectedTheme === 'theme_4' ? "border-primary" : "border-border"
              )}
            >
               <div className="flex items-center gap-4">
                 <RadioGroupItem value="theme_4" id="theme-4" />
                 <span className="font-semibold text-lg">Theme 4 (Blank)</span>
              </div>
                <p className="text-sm text-muted-foreground mt-2 pl-8">A blank canvas for creating a completely new and custom theme.</p>
            </Label>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
