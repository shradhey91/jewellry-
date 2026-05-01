import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Wrapped in try/catch so a missing GOOGLE_GENAI_API_KEY on Vercel
// doesn't crash the entire module at initialization time.
let ai: ReturnType<typeof genkit>;
try {
  ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  });
} catch (e) {
  console.warn('Genkit AI initialization failed (GOOGLE_GENAI_API_KEY may be missing):', e);
  // Create a minimal stub so imports don't break
  ai = genkit({ plugins: [] }) as any;
}

export { ai };
