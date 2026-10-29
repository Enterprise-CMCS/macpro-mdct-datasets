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

/** Determine whether the given value is a valid email address */
export const isEmail = (value: string | undefined) => {
  /*
   * We are using the regex recommended by the HTML specification itself.
   * https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
   */
  const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return !!value && emailPattern.test(value);
};
