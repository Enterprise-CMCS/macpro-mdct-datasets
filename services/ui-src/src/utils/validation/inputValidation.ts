/** Determine whether the given value is a valid HTTP or HTTPS URL */
export const isUrl = (value: string | undefined) => {
  if (!value) return false;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};
