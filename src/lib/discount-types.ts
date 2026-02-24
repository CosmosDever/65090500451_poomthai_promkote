export const ITEM_CATEGORIES = [
  "Clothing",
  "Accessories",
  "Electronics",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type CartItem = {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  quantity: number;
};

export type CouponCampaign =
  | { kind: "fixed"; amount: number }
  | { kind: "percentage"; percent: number };

export type OnTopCampaign =
  | { kind: "categoryPercent"; category: ItemCategory; percent: number }
  | { kind: "points"; points: number };

export type SeasonalCampaign = {
  kind: "seasonal";
  every: number;
  discount: number;
};

export type CampaignSelection = {
  coupon?: CouponCampaign;
  onTop?: OnTopCampaign;
  seasonal?: SeasonalCampaign;
};

export type DiscountLine = { label: string; amount: number };

export type CalculationResult = {
  subtotal: number;
  totalAfterCoupon: number;
  totalAfterOnTop: number;
  finalTotal: number;
  discounts: DiscountLine[];
  warnings: string[];
};
