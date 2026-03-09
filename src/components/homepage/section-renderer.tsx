
'use client';

import type { HomepageSection, Product, HomepageContent } from '@/lib/types';
import { sectionComponents } from './section-components';

interface SectionRendererProps {
    section: HomepageSection;
    content: HomepageContent;
    newestProducts: Product[];
    bestSellerProducts: Product[];
}

export function SectionRenderer({ section, content, newestProducts, bestSellerProducts }: SectionRendererProps) {
    const Component = sectionComponents[section.type];
    
    if (!Component) {
        return (
            <div className="container py-8 text-center text-red-500">
                Component for section type "{section.type}" not found.
            </div>
        );
    }
    
    // Pass the correct props based on section type
    let props: any = {
        ...content[section.type]
    };

    if (section.type === 'newestProducts') {
        props.products = newestProducts;
    } else if (section.type === 'bestSellers') {
        props.products = bestSellerProducts;
    } else if (section.type === 'imageBanner1' || section.type === 'imageBanner2') {
        props.textPosition = section.type === 'imageBanner1' ? 'left' : 'right';
    }


    return <Component {...props} />;
}
