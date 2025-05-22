import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

export type ValidationErrors = {
  [key: string]: string | undefined;
  general?: string;
};

// Sanitization options for XSS protection
const sanitizeOptions = {
  allowedTags: [], // Disallow all HTML tags
  allowedAttributes: {}, // Disallow all attributes
};

// Strategy interface
interface ValidationStrategy {
  validate(value: string): { isValid: boolean; error?: string };
}

// General string validation strategy
class GeneralStringValidationStrategy implements ValidationStrategy {
  private schema = z
    .string()
    // .min(1, 'Input is required')
    .max(500, 'Input cannot exceed 500 characters')
    .refine(
      (value) => !/[<>;"'()`]/.test(value),
      'Input cannot contain special characters like <, >, ;, ", \', (, ), or `'
    );

  validate(value: string): { isValid: boolean; error?: string } {
    try {
      this.schema.parse(value);
      return { isValid: true };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return { isValid: false, error: err.errors[0].message };
      }
      return { isValid: false, error: 'Validation failed' };
    }
  }
}

// Factory to create validation strategies
class ValidationFactory {
  static createValidator(): ValidationStrategy {
        return new GeneralStringValidationStrategy();
    }
  }

// Input validation service
export class InputValidationService {
  // Sanitize a single input
  static sanitizeInput(value: string): string {
    return sanitizeHtml(value, sanitizeOptions);
  }

  // Validate a single input
  static validateInput(value: string): { isValid: boolean; error?: string } {
    const validator = ValidationFactory.createValidator();
    return validator.validate(value);
  }

  static cleanseInput(value: string): string {
    const validation = this.validateInput(value);
    if (validation.isValid) {
      return this.sanitizeInput(value);
    } else {
      console.error('Input validation failed');
      throw validation.error;
    }
  }
}