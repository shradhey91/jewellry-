"use client";

import Link from "next/link";
import React from 'react';
import type { FooterContent } from "@/lib/types";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MobileFooterProps {
    content: FooterContent;
}

export function MobileFooter({ content }: MobileFooterProps) {
  if (!content || !content.columns) {
    return null; // Or a fallback UI
  }

  return (
    <footer className="border-t bg-secondary/50 text-sm">
      <div className="container mx-auto py-8 px-4">
        
        <Accordion type="multiple" className="w-full">
            {content.columns.map(column => (
                <AccordionItem value={column.id} key={column.id}>
                    <AccordionTrigger className="font-semibold text-primary">{column.title}</AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-3 pt-2">
                            {column.links.map(link => (
                            <li key={link.id}>
                                <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                                {link.label}
                                </Link>
                            </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>

        <div className="mt-8">
            <h4 className="font-semibold mb-4 text-primary">Follow Us</h4>
            <div className="flex items-center space-x-4">
            {content.socials?.facebook && <Link href={content.socials.facebook} className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>}
            {content.socials?.instagram && <Link href={content.socials.instagram} className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>}
            {content.socials?.twitter && <Link href={content.socials.twitter} className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>}
            {content.socials?.youtube && <Link href={content.socials.youtube} className="text-muted-foreground hover:text-primary"><Youtube className="h-5 w-5" /></Link>}
            </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col items-center pb-6">
          <div className="flex items-center space-x-4 text-muted-foreground text-xs">
            {content.bottom?.links.map((link, index) => (
                <React.Fragment key={link.id}>
                    <Link href={link.url} className="hover:text-primary">{link.label}</Link>
                    {index < content.bottom.links.length - 1 && <span className="opacity-50">|</span>}
                </React.Fragment>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {content.bottom?.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}