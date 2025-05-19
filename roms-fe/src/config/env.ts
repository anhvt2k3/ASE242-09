import { z } from 'zod';

// Define schema for environment variables
const envSchema = z.object({
//   API_KEY: z.string().min(1, 'API_KEY is required'),
//   DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
//   PORT: z
//     .string()
//     .default('3000')
//     .transform((val) => parseInt(val, 10))
//     .refine((val) => !isNaN(val), 'PORT must be a valid number'),
    VITE_BE_DOMAIN: z.string().url('BE_DOMAIN should be a valid URL.')
});

// Parse and validate environment variables
const env = envSchema.parse(import.meta.env);

export default env;