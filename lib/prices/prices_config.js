// Where the static site reads prices and sends buyers. Both are owned by the middleware.
export const prices_url = process.env.NEXT_PUBLIC_PRICES_URL || "/data/prices.json";
export const checkout_base_url = process.env.NEXT_PUBLIC_CHECKOUT_URL || "https://example.invalid/checkout";
