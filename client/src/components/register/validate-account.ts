import type { AccountFields } from "./types";

const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,128}$/;

export function validateAccountFields(fields: AccountFields): string | null {
  const name = fields.name.trim();
  const username = fields.username.replace(/^@/, "");

  if (!name || name.length > 20) return "Name must be between 1 and 20 characters.";
  if (!/^[a-zA-Z_0-9]{1,20}$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) || fields.email.length > 150) {
    return "Enter a valid email address.";
  }
  if (!phonePattern.test(fields.phone)) {
    return "Enter a valid phone number, such as 316 123 4567.";
  }
  if (!passwordPattern.test(fields.password)) {
    return "Password needs 10–128 characters, uppercase and lowercase letters, a number, and one of @$!%*?&. Other characters are not allowed.";
  }

  return null;
}
