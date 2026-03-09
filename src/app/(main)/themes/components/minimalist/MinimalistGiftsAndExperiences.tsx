'use client';

import Image from "next/image";
import Link from "next/link";
import type { MinimalistHomepageContent } from "@/lib/types";

export function MinimalistGiftsAndExperiences({ data }: { data: MinimalistHomepageContent['gifts_and_experiences'] }) {
  if (!data?.enabled) return null;

  return (
    <section className="bg-background px-6 mt-16 md:mt-32 mb-16 md:mb-32">
      <div className="grid gap-12 md:grid-cols-2 items-stretch">
        {/* GIFT */}
        <div className="relative h-[420px] md:h-[520px] overflow-hidden rounded-3xl">
          <Image
            src={data.gift.image}
            alt={data.gift.title}
            fill
            className="object-cover"
            data-ai-hint="jewelry gift"
          />

          <div className="absolute inset-0 bg-foreground/20" />

          <div className="absolute bottom-10 left-10 z-10 max-w-sm text-primary-foreground">
            <h2 className="font-serif text-4xl leading-tight">
              {data.gift.title}
            </h2>
            <p className="mt-4 text-primary-foreground/85">
              {data.gift.subtitle}
            </p>

            <Link
              href={data.gift.cta.href}
              className="inline-block mt-6 rounded-full bg-primary-foreground px-6 py-3 text-sm font-medium text-foreground"
            >
              {data.gift.cta.label}
            </Link>
          </div>
        </div>

        {/* EXPERIENCES */}
        <div className="flex flex-col justify-center">
          <h3 className="mb-8 font-serif text-2xl md:text-3xl">
            {data.experiences.title}
          </h3>

          <div className="grid gap-6">
            {data.experiences.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center gap-6 overflow-hidden rounded-2xl bg-card p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={item.title}
                  />
                </div>

                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
