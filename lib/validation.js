/**
 * Form Validation Library
 * 
 * Follows mind-bank principles:
 * - "Functional Over Flash" - Clear, simple validation
 * - "Secure & Private" - Input sanitization and validation
 * - "No dark patterns" - Transparent validation rules
 */

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (flexible format)
 */
export function isValidPhone(phone) {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate required string fields
 */
export function isValidString(value, minLength = 1, maxLength = 1000) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validate array fields (like struggles)
 */
export function isValidArray(value, minItems = 0, maxItems = 10) {
  if (!Array.isArray(value)) return false;
  return value.length >= minItems && value.length <= maxItems;
}

/**
 * Validate communication preference
 */
export function isValidCommunicationPreference(value) {
  const validOptions = ['email', 'text', 'slack', 'voice-note', 'phone', 'carrier-pigeon'];
  return validOptions.includes(value);
}

/**
 * Validate struggle selections
 */
export function isValidStruggles(struggles) {
  if (!Array.isArray(struggles)) return false;
  if (struggles.length === 0) return false; // At least one required
  if (struggles.length > 3) return false; // Max 3 allowed
  
  const validStruggles = [
    'branding-scattered',
    'story-articulation',
    'wrong-audience',
    'visuals-dont-feel-me',
    'automation-systems',
    'prioritization',
    'overwhelmed'
  ];
  
  return struggles.every(struggle => validStruggles.includes(struggle));
}

/**
 * Sanitize text input
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Validate complete form data
 */
export function validateFormData(data) {
  const errors = {};
  
  // Required fields validation
  if (!isValidString(data.name, 1, 100)) {
    errors.name = 'Name is required and must be between 1-100 characters';
  }
  
  if (!isValidEmail(data.email)) {
    errors.email = 'Valid email address is required';
  }
  
  if (!isValidString(data.brandName, 1, 100)) {
    errors.brandName = 'Brand name is required and must be between 1-100 characters';
  }
  
  if (!isValidString(data.whyNow, 1, 2000)) {
    errors.whyNow = 'Please tell us why now (1-2000 characters)';
  }
  
  if (!isValidString(data.successMetrics, 1, 2000)) {
    errors.successMetrics = 'Success metrics are required (1-2000 characters)';
  }
  
  if (!isValidStruggles(data.struggles)) {
    errors.struggles = 'Please select 1-3 struggles';
  }
  
  if (!isValidCommunicationPreference(data.communication)) {
    errors.communication = 'Please select a communication preference';
  }
  
  // Optional fields validation
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (data.industry && !isValidString(data.industry, 0, 100)) {
    errors.industry = 'Industry must be less than 100 characters';
  }
  
  if (data.onlinePresence && !isValidString(data.onlinePresence, 0, 1000)) {
    errors.onlinePresence = 'Online presence must be less than 1000 characters';
  }
  
  if (data.brandVoice && !isValidString(data.brandVoice, 0, 200)) {
    errors.brandVoice = 'Brand voice must be less than 200 characters';
  }
  
  if (data.brandTone && !isValidString(data.brandTone, 0, 200)) {
    errors.brandTone = 'Brand tone must be less than 200 characters';
  }
  
  if (data.avoidances && !isValidString(data.avoidances, 0, 1000)) {
    errors.avoidances = 'Avoidances must be less than 1000 characters';
  }
  
  if (data.aestheticReferences && !isValidString(data.aestheticReferences, 0, 1000)) {
    errors.aestheticReferences = 'Aesthetic references must be less than 1000 characters';
  }
  
  if (data.offering && !isValidString(data.offering, 0, 1000)) {
    errors.offering = 'Offering description must be less than 1000 characters';
  }
  
  if (data.valueProvision && !isValidString(data.valueProvision, 0, 1000)) {
    errors.valueProvision = 'Value provision must be less than 1000 characters';
  }
  
  if (data.dreamAudience && !isValidString(data.dreamAudience, 0, 1000)) {
    errors.dreamAudience = 'Dream audience must be less than 1000 characters';
  }
  
  if (data.feedback && !isValidString(data.feedback, 0, 1000)) {
    errors.feedback = 'Feedback must be less than 1000 characters';
  }
  
  if (data.additionalInfo && !isValidString(data.additionalInfo, 0, 1000)) {
    errors.additionalInfo = 'Additional info must be less than 1000 characters';
  }
  
  if (data.otherStruggle && !isValidString(data.otherStruggle, 0, 200)) {
    errors.otherStruggle = 'Other struggle must be less than 200 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize complete form data
 */
export function sanitizeFormData(data) {
  const sanitized = {};
  
  // Sanitize text fields
  const textFields = [
    'name', 'email', 'phone', 'brandName', 'industry', 'onlinePresence',
    'whyNow', 'successMetrics', 'brandVoice', 'brandTone', 'avoidances',
    'aestheticReferences', 'offering', 'valueProvision', 'dreamAudience',
    'feedback', 'additionalInfo', 'otherStruggle', 'communication'
  ];
  
  textFields.forEach(field => {
    if (data[field]) {
      sanitized[field] = sanitizeText(data[field]);
    }
  });
  
  // Handle array fields
  if (data.struggles && Array.isArray(data.struggles)) {
    sanitized.struggles = data.struggles.map(struggle => sanitizeText(struggle));
  }
  
  // Handle files
  if (data.files && Array.isArray(data.files)) {
    sanitized.files = data.files.map(file => ({
      url: sanitizeText(file.url),
      fileName: sanitizeText(file.fileName),
      size: file.size,
      uploadedAt: file.uploadedAt
    }));
  }
  
  return sanitized;
}