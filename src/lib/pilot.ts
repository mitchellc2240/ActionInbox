export function hasPilotAccess(userId: string) {
  return Boolean(userId) && (process.env.ACTIONINBOX_PILOT_USER_IDS ?? "").split(",").some((id) => id.trim() === userId);
}

export function getPilotCheckoutUrl(userId: string, email: string) {
  const value = process.env.ACTIONINBOX_STRIPE_PAYMENT_LINK;
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.origin !== "https://buy.stripe.com") return null;
    url.searchParams.set("client_reference_id", userId);
    url.searchParams.set("prefilled_email", email);
    return url.href;
  } catch {
    return null;
  }
}
