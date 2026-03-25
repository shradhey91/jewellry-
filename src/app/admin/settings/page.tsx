
"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { saveSettingsAction, SettingsFormState } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useFavicon } from "@/hooks/use-favicon";
import { Separator } from "@/components/ui/separator";
import { useSiteLogo } from "@/hooks/use-site-logo";

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save All Settings"}</Button>;
}

export default function SettingsPage() {
  const { siteLogoUrl, setSiteLogoUrl } = useSiteLogo();
  const [permalinkStructure, setPermalinkStructure] = useState("post_name");
  const [customPermalink, setCustomPermalink] = useState("");
  const { toast } = useToast();
  const { currentFaviconUrl, setFaviconUrl } = useFavicon();

  const initialState: SettingsFormState = { message: "", errors: {} };
  const [state, setState] = useState<SettingsFormState>(initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
    }
  }, [state, toast]);

  const formAction = async (formData: FormData) => {
    const result = await saveSettingsAction(initialState, formData);
    setState(result);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, type: 'Logo' | 'Favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: `Please select an image smaller than 2MB.`, variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setter(result);
        toast({ title: `${type} Updated`, description: `Your ${type.toLowerCase()} has been updated. Don't forget to click "Save All Settings" to persist the changes!` });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };
  
  const permalinkOptions = [
      { value: 'plain', label: 'Plain', example: '/?p=123' },
      { value: 'day_and_name', label: 'Day and name', example: `/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}/sample-post/` },
      { value: 'month_and_name', label: 'Month and name', example: `/${new Date().getFullYear()}/${new Date().getMonth() + 1}/sample-post/` },
      { value: 'numeric', label: 'Numeric', example: '/archives/123' },
      { value: 'post_name', label: 'Post name', example: '/sample-post/' },
      { value: 'custom', label: 'Custom Structure' },
  ]

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="General Settings"
        description="Manage your site's appearance and configuration."
      />
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="site_logo_url" value={siteLogoUrl || ""} />

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize your site's logo and favicon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Site Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-muted">
                  {siteLogoUrl ? (
                    <Image src={siteLogoUrl} alt="Logo preview" width={80} height={80} className="object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Preview</span>
                  )}
                </div>
                 <Button asChild variant="outline" className="relative">
                   <div>
                       <Upload className="mr-2 h-4 w-4" />
                       Choose File
                       <Input 
                           type="file" 
                           accept="image/png, image/jpeg, image/svg+xml" 
                           onChange={(e) => handleFileChange(e, setSiteLogoUrl, 'Logo')} 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       />
                   </div>
               </Button>
              </div>
              <p className="text-xs text-muted-foreground">Recommended format: SVG, PNG, or JPG. Max size: 2MB.</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Favicon</h3>
              <p className="text-sm text-muted-foreground">
                Upload a square image (PNG, JPG, or SVG) to be used as the site's favicon.
              </p>
            </div>
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg border flex items-center justify-center bg-muted flex-shrink-0">
                {currentFaviconUrl ? (
                    <Image src={currentFaviconUrl} alt="Favicon preview" width={80} height={80} className="object-contain" />
                ) : (
                    <span className="text-xs text-muted-foreground">Preview</span>
                )}
                </div>
                <div className="space-y-2">
                <Button asChild variant="outline" className="relative">
                    <div>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Favicon
                    <Input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml, image/x-icon"
                        onChange={(e) => handleFileChange(e, setFaviconUrl, 'Favicon')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    </div>
                </Button>
                <p className="text-xs text-muted-foreground">Recommended: 128x128px or larger. Max 2MB.</p>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Permalink Settings</CardTitle>
                <CardDescription>Customize the URL structure for your posts.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup 
                    name="permalink_structure"
                    value={permalinkStructure} 
                    onValueChange={setPermalinkStructure} 
                    className="space-y-2"
                >
                    {permalinkOptions.map(option => (
                         <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`permalink-${option.value}`} />
                            <Label htmlFor={`permalink-${option.value}`} className="font-normal flex items-baseline gap-2">
                                <span>{option.label}</span>
                                {option.example && <code className="text-xs text-muted-foreground bg-muted/50 px-1 py-0.5 rounded">{option.example}</code>}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
                
                {permalinkStructure === 'custom' && (
                    <div className="mt-4 pl-6">
                         <Input 
                            name="permalink_custom_structure"
                            value={customPermalink} 
                            onChange={(e) => setCustomPermalink(e.target.value)}
                            placeholder="/%category%/%postname%/"
                        />
                         <p className="text-xs text-muted-foreground mt-2">
                            Available tags: <code className="text-xs">%year%</code>, <code className="text-xs">%monthnum%</code>, <code className="text-xs">%day%</code>, <code className="text-xs">%postname%</code>, <code className="text-xs">%post_id%</code>, <code className="text-xs">%category%</code>.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Card>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
