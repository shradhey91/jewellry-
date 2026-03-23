
"use client";

import Link from "next/link";
import React from 'react';
import type { FooterContent } from "@/lib/types";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

interface FooterProps {
    content: FooterContent;
}

export function Footer({ content }: FooterProps) {
  if (!content || !content.columns) {
    return null; // Or a fallback UI
  }

  return (
    <footer className="border-t bg-secondary/50 text-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {content.columns.map(column => (
            <div key={column.id} className="col-span-1">
              <h4 className="font-semibold mb-4 text-primary">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map(link => (
                  <li key={link.id}>
                    <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

           <div className="col-span-2">
            <h4 className="font-semibold mt-8 md:mt-0 mb-4 text-primary">Contact Us</h4>
             <ul className="space-y-3">
              <li>
                <a href={`mailto:${content.contact?.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {content.contact?.email}
                </a>
              </li>
            </ul>
            <h4 className="font-semibold mt-8 mb-4 text-primary">We are also present in</h4>
             <ul className="space-y-3">
              {content.locations?.map(location => (
                <li key={location.id} className="text-muted-foreground">{location.name}</li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
             <h4 className="font-semibold mt-8 md:mt-0 mb-4 text-primary">Follow Us On</h4>
             <div className="flex items-center space-x-4">
                {content.socials?.facebook && <Link href={content.socials.facebook} className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>}
                {content.socials?.instagram && <Link href={content.socials.instagram} className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>}
                {content.socials?.twitter && <Link href={content.socials.twitter} className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>}
                {content.socials?.youtube && <Link href={content.socials.youtube} className="text-muted-foreground hover:text-primary"><Youtube className="h-5 w-5" /></Link>}
             </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between">
           <p className="text-xs text-muted-foreground order-2 sm:order-1 mt-4 sm:mt-0">
            {content.bottom?.copyright}
          </p>
          <div className="flex items-center space-x-4 order-1 sm:order-2 text-muted-foreground text-xs">
            {content.bottom?.links.map((link, index) => (
                <React.Fragment key={link.id}>
                    <Link href={link.url} className="hover:text-primary">{link.label}</Link>
                    {index < content.bottom.links.length - 1 && <span className="opacity-50">|</span>}
                </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
