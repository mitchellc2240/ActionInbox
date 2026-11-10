"use server";

import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { findCustomer, getBilling, getOrCreateCustomer, subscriptionState } from "@/lib/billing";

function accountUrl() {
  const origin = new URL(process.env.ACTIONINBOX_SITE_URL ?? "");
  if (origin.protocol !== "https:" && origin.hostname !== "localhost") {
    throw new Error("Invalid ActionInbox site URL.");
  }
  return new URL("/account", origin).href;
}

export async function openBilling(form: FormData) {
  const auth = getAuth();
  const user = auth && (await auth.getSession()).data?.user;
  const billing = getBilling();
  if (!user || !billing) redirect("/account");
  const portal = form.get("intent") === "portal";
  let target: string | null = null;

  try {
    const returnUrl = accountUrl();
    const { stripe, price } = billing;
    const customer = portal
      ? await findCustomer(user.id)
      : await getOrCreateCustomer(stripe, user.id, user.email);
    if (customer) {
      if (portal || await subscriptionState(stripe, customer, price) !== "none") {
        target = (await stripe.billingPortal.sessions.create({ customer, return_url: returnUrl })).url;
      } else {
        const open = await stripe.checkout.sessions.list({ customer, status: "open", limit: 1 });
        target = open.data[0]?.url ?? (await stripe.checkout.sessions.create({
          customer,
          mode: "subscription",
          line_items: [{ price, quantity: 1 }],
          success_url: returnUrl,
          cancel_url: returnUrl,
        }, { idempotencyKey: `actioninbox-checkout-${customer}-${price}-${Math.floor(Date.now() / 60000)}` })).url;
      }
    }
  } catch (error) {
    console.error("ActionInbox billing session failed", error instanceof Error ? error.name : "Unknown error");
  }

  redirect(target ?? "/account?billing=unavailable");
}
