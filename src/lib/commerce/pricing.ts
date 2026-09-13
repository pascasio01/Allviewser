import type { Business, Cart, MoneyBreakdown, Product } from "./types";

const TAX_RATE = 0.16;

export function lineTotalCents(item: {
  quantity: number;
  unitPriceCents: number;
  optionsDeltaCents: number;
}): number {
  return item.quantity * (item.unitPriceCents + item.optionsDeltaCents);
}

export function computeBreakdown(
  cart: Cart,
  business: Business,
  products: Product[],
): MoneyBreakdown {
  let subtotalCents = 0;
  for (const item of cart.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
    if (!product.available) throw new Error(`Producto no disponible: ${product.name}`);
    for (const optId of item.optionIds) {
      const opt = product.options.find((o) => o.id === optId);
      if (!opt || !opt.available) throw new Error(`Opción no disponible: ${optId}`);
    }
    subtotalCents += lineTotalCents(item);
  }
  if (cart.items.length > 0 && subtotalCents < business.minOrderCents) {
    throw new Error(
      `El pedido mínimo es ${(business.minOrderCents / 100).toFixed(2)} MXN (subtotal actual ${(subtotalCents / 100).toFixed(2)}).`,
    );
  }
  const deliveryFeeCents = cart.items.length ? business.deliveryFeeCents : 0;
  const taxCents = Math.round((subtotalCents + deliveryFeeCents) * TAX_RATE);
  return {
    subtotalCents,
    deliveryFeeCents,
    taxCents,
    totalCents: subtotalCents + deliveryFeeCents + taxCents,
    currency: "MXN",
  };
}
