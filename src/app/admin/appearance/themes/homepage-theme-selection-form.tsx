
"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveHomepageThemeSelection } from "../actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast.tsx";
import { cn } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Active Theme"}</Button>;
}

interface HomepageThemeSelectionFormProps {
  currentTheme: string;
}

export function HomepageThemeSelectionForm({ currentTheme }: HomepageThemeSelectionFormProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'default');
  const { toast } = useToast();
  const [state, formAction] = useFormState(saveHomepageThemeSelection, { message: "" });
  
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
          <CardTitle>Homepage Themes</CardTitle>
          <CardDescription>
            Select a theme to apply it to your main homepage.
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
                 <span className="font-semibold text-lg">Default Theme</span>
              </div>
               <p className="text-sm text-muted-foreground mt-2 pl-8">The standard, feature-rich homepage layout with all content sections.</p>
            </Label>
             <Label
              htmlFor="theme-minimalist"
              className={cn(
                "block rounded-lg border-2 p-4 cursor-pointer",
                selectedTheme === 'minimalist' ? "border-primary" : "border-border"
              )}
            >
               <div className="flex items-center gap-4">
                 <RadioGroupItem value="minimalist" id="theme-minimalist" />
                 <span className="font-semibold text-lg">Minimalist Theme</span>
              </div>
                <p className="text-sm text-muted-foreground mt-2 pl-8">A clean and simple layout focusing on carousels and essential product displays.</p>
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
