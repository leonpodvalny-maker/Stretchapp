/**
 * Validation and sanitization utilities
 */

export const validation = {
  /**
   * Sanitize text input by trimming and limiting length
   */
  sanitizeText: (text: string, maxLength: number = 100): string => {
    return text.trim().slice(0, maxLength);
  },

  /**
   * Validate and sanitize user name
   */
  validateUserName: (name: string): { isValid: boolean; sanitized: string; error?: string } => {
    const sanitized = validation.sanitizeText(name, 50);

    if (sanitized.length === 0) {
      return { isValid: false, sanitized, error: 'Name cannot be empty' };
    }

    if (sanitized.length < 2) {
      return { isValid: false, sanitized, error: 'Name must be at least 2 characters' };
    }

    // Only allow letters, numbers, spaces, and basic punctuation
    const validPattern = /^[a-zA-Z0-9\s\-_.']+$/;
    if (!validPattern.test(sanitized)) {
      return { isValid: false, sanitized, error: 'Name contains invalid characters' };
    }

    return { isValid: true, sanitized };
  },

  /**
   * Validate training name
   */
  validateTrainingName: (name: string): { isValid: boolean; sanitized: string; error?: string } => {
    const sanitized = validation.sanitizeText(name, 100);

    if (sanitized.length === 0) {
      return { isValid: false, sanitized, error: 'Training name cannot be empty' };
    }

    if (sanitized.length < 3) {
      return { isValid: false, sanitized, error: 'Training name must be at least 3 characters' };
    }

    return { isValid: true, sanitized };
  },

  /**
   * Validate numeric input
   */
  validateNumber: (
    value: number,
    min: number,
    max: number
  ): { isValid: boolean; error?: string } => {
    if (isNaN(value)) {
      return { isValid: false, error: 'Invalid number' };
    }

    if (value < min) {
      return { isValid: false, error: `Value must be at least ${min}` };
    }

    if (value > max) {
      return { isValid: false, error: `Value must be at most ${max}` };
    }

    return { isValid: true };
  },

  /**
   * Validate height based on unit system
   */
  validateHeight: (
    height: number,
    unitSystem: 'metric' | 'imperial'
  ): { isValid: boolean; error?: string } => {
    if (unitSystem === 'metric') {
      // cm: 50-250
      return validation.validateNumber(height, 50, 250);
    } else {
      // inches: 20-100
      return validation.validateNumber(height, 20, 100);
    }
  },

  /**
   * Validate weight based on unit system
   */
  validateWeight: (
    weight: number,
    unitSystem: 'metric' | 'imperial'
  ): { isValid: boolean; error?: string } => {
    if (unitSystem === 'metric') {
      // kg: 20-300
      return validation.validateNumber(weight, 20, 300);
    } else {
      // lbs: 40-660
      return validation.validateNumber(weight, 40, 660);
    }
  },

  /**
   * Validate exercise duration
   */
  validateDuration: (duration: number): { isValid: boolean; error?: string } => {
    return validation.validateNumber(duration, 5, 600); // 5 seconds to 10 minutes
  },

  /**
   * Validate pause between exercises
   */
  validatePause: (pause: number): { isValid: boolean; error?: string } => {
    return validation.validateNumber(pause, 0, 120); // 0 to 2 minutes
  },
};
