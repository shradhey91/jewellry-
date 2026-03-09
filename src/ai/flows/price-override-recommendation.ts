
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered recommendations for manual price overrides.
 *
 * It considers factors like competitor pricing, market trends, and inventory levels to optimize profitability.
 * The flow takes product information as input and returns a recommended price override and a rationale.
 *
 * - getPriceOverrideRecommendation - A function that handles the price override recommendation process.
 * - PriceOverrideRecommendationInput - The input type for the getPriceOverrideRecommendation function.
 * - PriceOverrideRecommendationOutput - The return type for the getPriceOverrideRecommendation function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';

const PriceOverrideRecommendationInputSchema = z.object({
  productId: z.string().describe('The ID of the product.'),
  productName: z.string().describe('The name of the product.'),
  currentPrice: z.number().describe('The current price of the product.'),
  competitorPrice: z.number().describe('The competitor price for the product.'),
  marketTrend: z.string().describe('The current market trend for the product.'),
  inventoryLevel: z.string().describe('The current inventory level of the product (e.g., high, medium, low).'),
});
export type PriceOverrideRecommendationInput = z.infer<typeof PriceOverrideRecommendationInputSchema>;

const PriceOverrideRecommendationOutputSchema = z.object({
  recommendedPriceOverride: z
    .number()
    .describe('The recommended price override for the product.'),
  rationale: z
    .string()
    .describe(
      'The rationale behind the recommended price override, considering competitor pricing, market trends, and inventory levels.'
    ),
});
export type PriceOverrideRecommendationOutput = z.infer<typeof PriceOverrideRecommendationOutputSchema>;

export async function getPriceOverrideRecommendation(
  input: PriceOverrideRecommendationInput
): Promise<PriceOverrideRecommendationOutput> {
  return priceOverrideRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'priceOverrideRecommendationPrompt',
  input: {schema: PriceOverrideRecommendationInputSchema},
  output: {schema: PriceOverrideRecommendationOutputSchema},
  prompt: `You are an AI assistant helping an admin determine the optimal price override for a product.

  Consider the following factors:
  - Current price: {{{currentPrice}}}
  - Competitor price: {{{competitorPrice}}}
  - Market trend: {{{marketTrend}}}
  - Inventory level: {{{inventoryLevel}}}

  Based on these factors, recommend a price override and provide a rationale for your recommendation.

  Respond with a JSON object:
  {
    "recommendedPriceOverride": <number>,
    "rationale": <string>
  }`,
});

const priceOverrideRecommendationFlow = ai.defineFlow(
  {
    name: 'priceOverrideRecommendationFlow',
    inputSchema: PriceOverrideRecommendationInputSchema,
    outputSchema: PriceOverrideRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
