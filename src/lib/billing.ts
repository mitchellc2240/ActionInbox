import Stripe from "stripe";
import { database } from "./workspace-db";
import { hasPilotAccess } from "./pilot";

export function getBilling() {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  if (!key || !price) return null;
  return { stripe: new Stripe(key), price };
}

export async function findCustomer(userId: string) {
  const [row] = await database()`
    SELECT customer_id FROM actioninbox.billing_customers WHERE user_id = ${userId}
  `;
  return row?.customer_id as string | undefined;
}

export async function getOrCreateCustomer(stripe: Stripe, userId: string, email: string) {
  const existing = await findCustomer(userId);
  if (existing) return existing;

  const customer = await stripe.customers.create(
    { email, metadata: { actioninbox_user_id: userId } },
    { idempotencyKey: `actioninbox-customer-${userId}` },
  );
  const [row] = await database()`
    INSERT INTO actioninbox.billing_customers (user_id, customer_id)
    VALUES (${userId}, ${customer.id})
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING customer_id
  `;
  return row.customer_id as string;
}

export async function subscriptionState(stripe: Stripe, customer: string, price: string) {
  let state: "none" | "needs_attention" = "none";
  for await (const subscription of stripe.subscriptions.list({ customer, status: "all" })) {
    if (!subscription.items.data.some((item) => item.price.id === price)) continue;
    if (["active", "trialing"].includes(subscription.status)) return "active";
    if (!["canceled", "incomplete_expired"].includes(subscription.status)) state = "needs_attention";
  }
  return state;
}

export async function canUseWorkspace(userId: string) {
  if (hasPilotAccess(userId)) return true;
  const billing = getBilling();
  if (!billing) return false;
  const customer = await findCustomer(userId);
  return Boolean(customer && await subscriptionState(billing.stripe, customer, billing.price) === "active");
}
