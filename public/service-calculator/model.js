// Fictional service prices, in USD cents. These are not development fees.
export const packages = { essential: 15000, extended: 25000 };
export function calculate({ packageId = 'essential', quantity = 1, extra = false, priority = false } = {}) {
  if (!Object.hasOwn(packages, packageId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    throw new RangeError('Choose a package and a whole quantity from 1 to 20.');
  }
  const base = packages[packageId] * quantity;
  const extras = extra ? 2500 * quantity : 0;
  const subtotal = base + extras;
  const surcharge = priority ? Math.round(subtotal * 0.25) : 0;
  return { base, extras, subtotal, surcharge, total: subtotal + surcharge };
}
export const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
