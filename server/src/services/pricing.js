// Merge duplicate product lines so one product cannot appear twice in an order.
function mergeItems(items) {
  const map = new Map();
  for (const { productId, quantity } of items) {
    map.set(productId, (map.get(productId) || 0) + quantity);
  }
  return [...map].map(([productId, quantity]) => ({ productId, quantity }));
}

// All money is integer minor units, so there is no floating point drift.
function computeTotals(lines, deliveryFeeCents) {
  const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
  return { subtotalCents, deliveryFeeCents, totalCents: subtotalCents + deliveryFeeCents };
}

module.exports = { mergeItems, computeTotals };
