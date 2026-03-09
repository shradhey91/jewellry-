
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered suggestions for dynamic pricing.
 *
 * As an admin, I want to see AI-powered suggestions for manual price overrides, so I can quickly adjust prices
 * based on market trends and competitor pricing, while still adhering to the pricing formula.
 *
 * - getDynamicPricingSuggestions - A function that handles the dynamic pricing suggestion process.
 * - DynamicPricingSuggestionsInput - The input type for the getDynamicPricingSuggestions function.
 * - DynamicPricingSuggestionsOutput - The return type for the getDynamicPricingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const DynamicPricingSuggestionsInputSchema = z.object({
  productId: z.string().describe('The ID of the product.'),
  productName: z.string().describe('The name of the product.'),
  currentPrice: z.number().describe('The current price of the product.'),
  calculatedPrice: z.number().describe('The calculated price of the product based on the pricing formula.'),
  competitorPrice: z.number().describe('The competitor price for the product.'),
  marketTrend: z.string().describe('The current market trend for the product.'),
  inventoryLevel: z.string().describe('The current inventory level of the product (e.g., high, medium, low).'),
  recentSalesData: z.string().describe('Recent sales data for the product.'),
});
export type DynamicPricingSuggestionsInput = z.infer<typeof DynamicPricingSuggestionsInputSchema>;

const DynamicPricingSuggestionsOutputSchema = z.object({
  suggestedPriceOverride: z
    .number()
    .describe('The suggested price override for the product.'),
  rationale: z
    .string()
    .describe(
      'The rationale behind the suggested price override, considering market trends, competitor pricing, inventory levels, and recent sales data, while still adhering to the pricing formula.'
    ),
});
export type DynamicPricingSuggestionsOutput = z.infer<typeof DynamicPricingSuggestionsOutputSchema>;

export async function getDynamicPricingSuggestions(
  input: DynamicPricingSuggestionsInput
): Promise<DynamicPricingSuggestionsOutput> {
  return dynamicPricingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dynamicPricingSuggestionsPrompt',
  input: {schema: DynamicPricingSuggestionsInputSchema},
  output: {schema: DynamicPricingSuggestionsOutputSchema},
  prompt: `You are an AI assistant helping an admin determine dynamic pricing suggestions for a product.

  Consider the following factors:
  - Product Name: {{{productName}}}
  - Current price: {{{currentPrice}}}
  - Calculated Price: {{{calculatedPrice}}}
  - Competitor price: {{{competitorPrice}}}
  - Market trend: {{{marketTrend}}}
  - Inventory level: {{{inventoryLevel}}}
  - Recent sales data: {{{recentSalesData}}}

  Based on these factors, and still adhering to the existing pricing formula, recommend a price override and provide a rationale for your recommendation.

  Respond with a JSON object:
  {
    "suggestedPriceOverride": <number>,
    "rationale": <string>
  }`,
});

const dynamicPricingSuggestionsFlow = ai.defineFlow(
  {
    name: 'dynamicPricingSuggestionsFlow',
    inputSchema: DynamicPricingSuggestionsInputSchema,
    outputSchema: DynamicPricingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
