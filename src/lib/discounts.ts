import type {
  CalculationResult,
  CampaignSelection,
  CartItem,
  DiscountLine,
} from "./discount-types";

const clamp = (value: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.min(Math.max(value, min), max);

const safeNumber = (value: number) => (Number.isFinite(value) ? value : 0);

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const calculateCartTotal = (items: CartItem[]): number =>
  items.reduce(
    (sum, item) =>
      sum +
      safeNumber(item.price) * clamp(Math.floor(safeNumber(item.quantity))),
    0,
  );

export const calculateDiscounts = (
  items: CartItem[],
  campaigns: CampaignSelection,
): CalculationResult => {
  const sanitizedItems = items
    .map((item) => ({
      ...item,
      price: clamp(safeNumber(item.price)),
      quantity: clamp(Math.floor(safeNumber(item.quantity))),
    }))
    .filter((item) => item.price > 0 && item.quantity > 0);

  const itemTotals = sanitizedItems.map((item) =>
    roundCurrency(item.price * item.quantity),
  );
  const subtotal = roundCurrency(
    itemTotals.reduce((sum, total) => sum + total, 0),
  );
  const discounts: DiscountLine[] = [];
  const warnings: string[] = [];

  let runningTotal = subtotal;
  let couponAdjustedTotals = itemTotals;
  const totalQuantity = sanitizedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  if (campaigns.coupon) {
    if (campaigns.coupon.kind === "fixed") {
      const discount = clamp(campaigns.coupon.amount);
      const applied = roundCurrency(clamp(discount, 0, runningTotal));
      discounts.push({ label: "Coupon (fixed)", amount: applied });

      if (applied > 0 && totalQuantity > 0) {
        const perUnit = applied / totalQuantity;
        couponAdjustedTotals = sanitizedItems.map((item, idx) => {
          const raw = itemTotals[idx];
          const deduct = roundCurrency(perUnit * item.quantity);
          const bounded = roundCurrency(clamp(deduct, 0, raw));
          return roundCurrency(raw - bounded);
        });
        runningTotal = roundCurrency(
          clamp(couponAdjustedTotals.reduce((sum, total) => sum + total, 0)),
        );
      } else {
        runningTotal = roundCurrency(clamp(runningTotal - applied));
      }
    } else {
      const percent = clamp(campaigns.coupon.percent, 0, 100);
      couponAdjustedTotals = itemTotals.map((raw) =>
        roundCurrency(clamp(raw * (1 - percent / 100), 0, raw)),
      );
      const totalAfterPercent = roundCurrency(
        couponAdjustedTotals.reduce((sum, total) => sum + total, 0),
      );
      const applied = roundCurrency(
        clamp(subtotal - totalAfterPercent, 0, subtotal),
      );
      discounts.push({ label: `Coupon (${percent}%)`, amount: applied });
      runningTotal = totalAfterPercent;
    }
  }

  const totalAfterCoupon = runningTotal;

  if (campaigns.onTop) {
    const onTop = campaigns.onTop;
    if (onTop.kind === "categoryPercent") {
      const percent = clamp(onTop.percent, 0, 100);
      const categoryTotal = sanitizedItems.reduce((sum, item, idx) => {
        if (item.category !== onTop.category) return sum;
        return sum + (couponAdjustedTotals[idx] ?? 0);
      }, 0);
      const adjustedCategoryTotal = categoryTotal;
      const applied = roundCurrency((adjustedCategoryTotal * percent) / 100);
      const bounded = roundCurrency(clamp(applied, 0, runningTotal));
      discounts.push({
        label: `On Top ${onTop.category} (${percent}%)`,
        amount: bounded,
      });
      runningTotal = roundCurrency(clamp(runningTotal - bounded));
    } else {
      const cap = runningTotal * 0.2;
      const points = clamp(onTop.points);
      const applied = roundCurrency(clamp(points, 0, cap));
      discounts.push({ label: "On Top (points)", amount: applied });
      runningTotal = roundCurrency(clamp(runningTotal - applied));
    }
  }

  const totalAfterOnTop = runningTotal;

  if (campaigns.seasonal) {
    const every = clamp(campaigns.seasonal.every);
    const discountValue = clamp(campaigns.seasonal.discount);
    if (every <= 0 || discountValue <= 0) {
      warnings.push(
        "Seasonal campaign skipped because parameters are invalid.",
      );
    } else {
      const times = Math.floor(runningTotal / every);
      const applied = roundCurrency(
        clamp(times * discountValue, 0, runningTotal),
      );
      if (applied > 0) {
        discounts.push({
          label: `Seasonal every ${every} (-${discountValue})`,
          amount: applied,
        });
        runningTotal = roundCurrency(clamp(runningTotal - applied));
      }
    }
  }

  const finalTotal = roundCurrency(clamp(runningTotal));

  return {
    subtotal,
    totalAfterCoupon,
    totalAfterOnTop,
    finalTotal,
    discounts,
    warnings,
  };
};
