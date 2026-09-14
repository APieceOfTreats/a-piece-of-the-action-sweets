// Cloudflare Pages Function: /api/checkout
// Prices are validated here on the server. Never trust prices sent by the browser.

const PRODUCTS = {
  "cinnamon-single": { name: "The Original Cinnamon Piece", amount: 700 },
  "cinnamon-box4": { name: "The Original Cinnamon Piece — Box of 4", amount: 2499 },

  "og-cookie-single": { name: "The OG Chocolate Chip", amount: 500 },
  "og-cookie-box4": { name: "The OG Chocolate Chip — Box of 4", amount: 1699 },
  "snickerdoodle-single": { name: "Signature Snickerdoodle", amount: 500 },
  "snickerdoodle-box4": { name: "Signature Snickerdoodle — Box of 4", amount: 1699 },
  "smore-single": { name: "S'more of the Action", amount: 500 },
  "smore-box4": { name: "S'more of the Action — Box of 4", amount: 1699 },

  "strawberry-single": { name: "Strawberry Cakesicle", amount: 400 },
  "strawberry-box4": { name: "Strawberry Cakesicle — Box of 4", amount: 1399 },
  "confetti-single": { name: "Confetti Cakesicle", amount: 400 },
  "confetti-box4": { name: "Confetti Cakesicle — Box of 4", amount: 1399 },
  "cosmic-single": { name: "Cosmic Chocolate Cakesicle", amount: 400 },
  "cosmic-box4": { name: "Cosmic Chocolate Cakesicle — Box of 4", amount: 1399 },

  "apple-single": { name: "Classic Caramel Apple Crunch", amount: 700 },
  "apple-box4": { name: "Classic Caramel Apple Crunch — Box of 4", amount: 2499 },

  "cookie-surprise-box4": { name: "Surprise Me! Cookie Box of 4", amount: 1699 },
  "cakesicle-surprise-box4": { name: "Surprise Me! Cakesicle Box of 4", amount: 1399 }
};

export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    if (!env.SQUARE_ACCESS_TOKEN || !env.SQUARE_LOCATION_ID) {
      return json({ error: "Square checkout is not configured yet." }, 500);
    }

    const body = await request.json();
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return json({ error: "Your cart is empty." }, 400);
    }

    let unitCount = 0;
    const lineItems = [];
    for (const item of body.items) {
      const product = PRODUCTS[item.sku];
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return json({ error: "Your cart contains an invalid item or quantity." }, 400);
      }
      unitCount += quantity;
      lineItems.push({
        name: product.name,
        quantity: String(quantity),
        item_type: "ITEM",
        base_price_money: { amount: product.amount, currency: "USD" }
      });
    }
    if (unitCount > 50) return json({ error: "Please contact us for orders larger than 50 line-item units." }, 400);

    const environment = (env.SQUARE_ENVIRONMENT || "sandbox").toLowerCase();
    const apiBase = environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

    const requestUrl = new URL(request.url);
    const redirectUrl = `${requestUrl.origin}/?checkout=complete`;

    const squareBody = {
      idempotency_key: crypto.randomUUID(),
      order: {
        location_id: env.SQUARE_LOCATION_ID,
        line_items: lineItems
      },
      payment_note: "A Piece of the Action Sweets — Santa Clarita Friday bake",
      checkout_options: {
        redirect_url: redirectUrl,
        merchant_support_email: "orders@apiecetreats.com",
        ask_for_shipping_address: false,
        allow_tipping: false
      }
    };

    const squareResponse = await fetch(`${apiBase}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-08-19"
      },
      body: JSON.stringify(squareBody)
    });

    const squareData = await squareResponse.json();
    if (!squareResponse.ok) {
      console.error("Square error", JSON.stringify(squareData));
      return json({ error: "Square could not create checkout. Check your Square configuration." }, 502);
    }

    const url = squareData?.payment_link?.url;
    if (!url) return json({ error: "Square did not return a checkout URL." }, 502);
    return json({ url }, 200);

  } catch (error) {
    console.error(error);
    return json({ error: "Unable to start checkout right now." }, 500);
  }
}

export function onRequestGet() {
  return json({ ok: true, message: "Square checkout endpoint is online." }, 200);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
