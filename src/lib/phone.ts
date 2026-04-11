export function normalizePhoneInput(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

export const phonePattern = /^0\d{9}$/;

export function isValidPhoneInput(value: string) {
  const normalized = normalizePhoneInput(value);
  return typeof normalized === "string" && phonePattern.test(normalized);
}
