'use client';

import Image from "next/image";
import Link from "next/link";
import React from 'react';
import * as LucideIcons from "lucide-react";
import type { MinimalistHomepageContent } from "@/lib/types";

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: string; className: string }) => {
  if (!name || typeof name !== 'string') return null;
  const LucideIcon = LucideIcons[name as IconName];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} />;
};

export function MinimalistAssuranceAndExchange({ data }: { data: MinimalistHomepageContent['assurance_and_exchange'] }) {
  if (!data?.enabled) return null;

  return (
    <section className="bg-background px-4 sm:px-6 lg:px-8 mt-16 md:mt-32">
      {/* ASSURANCE */}
      <h2 className="mb-12 text-center font-serif text-2xl md:text-3xl">
        {data.assurance.title}
      </h2>

      <div className="grid gap-10 md:grid-cols-3">
        {data.assurance.items.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-card p-6 md:p-10 text-center shadow-sm"
          >
            <div className="mx-auto mb-6 h-14 w-14 flex items-center justify-center">
              <Icon name={item.icon} className="h-10 w-10 text-primary" />
            </div>

            <p className="font-medium">{item.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* EXCHANGE */}
      <div className="mt-16 md:mt-24 grid gap-10 md:grid-cols-2 items-center">
        <div className="relative h-[300px] md:h-[420px] overflow-hidden rounded-3xl">
          <Image
            src={data.exchange.image}
            alt={data.exchange.title}
            fill
            className="object-cover"
            data-ai-hint="gold exchange"
          />
        </div>

        <div className="max-w-md">
          <h3 className="font-serif text-2xl md:text-3xl">
            {data.exchange.title}
          </h3>
          <p className="mt-4 text-muted-foreground">
            {data.exchange.subtitle}
          </p>

          <Link
            href={data.exchange.cta.href}
            className="inline-block mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
          >
            {data.exchange.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
