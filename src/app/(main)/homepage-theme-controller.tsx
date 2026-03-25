"use client";

import type {
  Product,
  HomepageContent,
  MinimalistHomepageContent,
} from "@/lib/types";
import { DefaultHomepageTheme } from "./themes/default-homepage-theme";
import MinimalistHomepageTheme from "./themes/minimalist-homepage-theme";

interface DefaultThemeProps {
  content: HomepageContent;
  newestProducts: Product[];
  bestSellerProducts: Product[];
}

interface MinimalistThemeProps {
  content: MinimalistHomepageContent;
  newestProducts: Product[];
  bestSellerProducts: Product[];
}

interface HomepageThemeControllerProps {
  activeHomepageTheme: string;
  defaultThemeProps: DefaultThemeProps;
  minimalistThemeProps: MinimalistThemeProps;
}

export function HomepageThemeController({
  activeHomepageTheme,
  defaultThemeProps,
  minimalistThemeProps,
}: HomepageThemeControllerProps) {
  switch (activeHomepageTheme) {
    case "minimalist":
      return <MinimalistHomepageTheme {...minimalistThemeProps} />;
    case "default":
    default:
      return <DefaultHomepageTheme {...defaultThemeProps} />;
  }
}
