/**
 * Converts a string to a URL-safe kebab-case format
 * - Converts to lowercase
 * - Replaces spaces and underscores with hyphens
 * - Removes any characters that are not alphanumeric or hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start and end
 *
 * @param {string} str - The string to convert
 * @returns {string} - The kebab-cased string
 */
export function toKebabCase(str) {
  if (!str) return '';

  return str
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove any character that's not alphanumeric or hyphen
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates that a username is URL-safe
 * @param {string} username - The username to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidUsername(username) {
  if (!username) return false;

  // Must be between 3 and 50 characters
  if (username.length < 3 || username.length > 50) return false;

  // Must only contain lowercase letters, numbers, and hyphens
  // Cannot start or end with a hyphen
  // Cannot have consecutive hyphens
  const usernameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return usernameRegex.test(username);
}
