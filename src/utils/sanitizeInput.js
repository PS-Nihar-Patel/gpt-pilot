import DOMPurify from 'dompurify';

export const sanitizeInput = (dirty) => {
  try {
    const clean = DOMPurify.sanitize(dirty);
    console.log("Input sanitized successfully.");
    return clean;
  } catch (error) {
    console.error("Error sanitizing input:", error.message, error.stack);
    throw error; // Rethrow the error after logging it to ensure it can be handled further up the call stack.
  }
};
