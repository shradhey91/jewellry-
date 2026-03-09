
'use server';

/**
 * @fileOverview Product description generator AI agent.
 *
 * - generateProductDescription - A function that generates a product description based on product details.
 * - ProductDescriptionInput - The input type for the generateProductDescription function.
 * - ProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const ProductDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  metal: z.string().describe('The metal of the product (e.g., Gold, Silver).'),
  purity: z.string().describe('The purity of the metal (e.g., 22K, 18K, 925).'),
  grossWeight: z.number().describe('The gross weight of the product in grams.'),
  netWeight: z.number().describe('The net weight of the product in grams.'),
  makingChargeType: z
    .enum(['fixed', 'percentage'])
    .describe('The type of making charge (fixed or percentage).'),
  makingChargeValue: z.number().describe('The value of the making charge.'),
  seoTitle: z.string().describe('The SEO title of the product.'),
  seoDescription: z.string().describe('The SEO description of the product.'),
});
export type ProductDescriptionInput = z.infer<typeof ProductDescriptionInputSchema>;

const ProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});
export type ProductDescriptionOutput = z.infer<typeof ProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: ProductDescriptionInput
): Promise<ProductDescriptionOutput> {
  return productDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: ProductDescriptionInputSchema},
  output: {schema: ProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in crafting compelling and SEO-optimized product descriptions for jewelry.

  Your primary goal is to write a captivating product description. Use the provided SEO Title and SEO Description as the main inspiration and incorporate their keywords and themes naturally.
  Also consider the other product details to ensure the description is accurate and informative.

  Product Name: {{{name}}}
  Metal: {{{metal}}}
  Purity: {{{purity}}}
  Gross Weight: {{{grossWeight}}} grams
  Net Weight: {{{netWeight}}} grams

  **SEO Title (Primary Inspiration):** {{{seoTitle}}}
  **SEO Description (Primary Inspiration):** {{{seoDescription}}}

  Based on the information above, write the product description.

  Description:`,
});

const productDescriptionFlow = ai.defineFlow(
  {
    name: 'productDescriptionFlow',
    inputSchema: ProductDescriptionInputSchema,
    outputSchema: ProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
