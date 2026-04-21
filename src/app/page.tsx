"use client";

import { useEffect, useMemo, useState } from "react";

import { calculateDiscounts } from "@/lib/discounts";
import {
  ITEM_CATEGORIES,
  type CampaignSelection,
  type CartItem,
  type ItemCategory,
} from "@/lib/discount-types";
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

type CouponKind = "none" | "fixed" | "percentage";
type OnTopKind = "none" | "category" | "points";

type Product = {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  blurb: string;
};

const mockProducts: Product[] = [
  {
    id: "ts-101",
    name: "T-Shirt",
    category: "Clothing",
    price: 1000,
    blurb: "ผ้าฝ้ายใส่สบายสำหรับทุกวัน",
  },
  {
    id: "h-202",
    name: "Hat",
    category: "Accessories",
    price: 1000,
    blurb: "หมวกทรงเบสบอลสีพื้น",
  },
  {
    id: "b-303",
    name: "Belt",
    category: "Accessories",
    price: 230,
    blurb: "เข็มขัดหนังเรียบ",
  },
  {
    id: "w-404",
    name: "Watch",
    category: "Electronics",
    price: 850,
    blurb: "นาฬิกาอนาล็อกสายหนัง",
  },
  {
    id: "h-505",
    name: "Hoodie",
    category: "Clothing",
    price: 700,
    blurb: "ฮู้ดดี้ผ้าฟลีซอุ่น",
  },
  {
    id: "b-606",
    name: "Bag",
    category: "Accessories",
    price: 640,
    blurb: "กระเป๋าสะพายข้างผ้าแคนวาส",
  },
];

export default function Home() {
  const [items, setItems] = useState<CartItem[]>([]);

  const [couponKind, setCouponKind] = useState<CouponKind>("none");
  const [couponFixedValue, setCouponFixedValue] = useState(50);
  const [couponPercentValue, setCouponPercentValue] = useState(10);

  const [onTopKind, setOnTopKind] = useState<OnTopKind>("none");
  const [onTopCategory, setOnTopCategory] = useState<ItemCategory>(
    ITEM_CATEGORIES[0],
  );
  const [onTopPercentValue, setOnTopPercentValue] = useState(15);
  const [pointValue, setPointValue] = useState(60);

  const [seasonalEnabled, setSeasonalEnabled] = useState(false);
  const [seasonalEvery, setSeasonalEvery] = useState(300);
  const [seasonalDiscount, setSeasonalDiscount] = useState(40);

  useEffect(() => {
    const categoriesInCart = items.map((item) => item.category);
    if (categoriesInCart.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOnTopCategory(ITEM_CATEGORIES[0]);
      return;
    }
    if (!categoriesInCart.includes(onTopCategory)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOnTopCategory(categoriesInCart[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateItem = (id: string, patch: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const campaigns = useMemo<CampaignSelection>(() => {
    if (items.length === 0) {
      return { coupon: undefined, onTop: undefined, seasonal: undefined };
    }

    const coupon: CampaignSelection["coupon"] =
      couponKind === "fixed"
        ? { kind: "fixed", amount: couponFixedValue }
        : couponKind === "percentage"
          ? { kind: "percentage", percent: couponPercentValue }
          : undefined;

    const onTop: CampaignSelection["onTop"] =
      onTopKind === "category"
        ? {
            kind: "categoryPercent",
            category: onTopCategory,
            percent: onTopPercentValue,
          }
        : onTopKind === "points"
          ? { kind: "points", points: pointValue }
          : undefined;

    const seasonal: CampaignSelection["seasonal"] = seasonalEnabled
      ? { kind: "seasonal", every: seasonalEvery, discount: seasonalDiscount }
      : undefined;

    return { coupon, onTop, seasonal };
  }, [
    couponFixedValue,
    couponKind,
    couponPercentValue,
    items.length,
    onTopCategory,
    onTopKind,
    onTopPercentValue,
    pointValue,
    seasonalDiscount,
    seasonalEnabled,
    seasonalEvery,
  ]);

  const result = useMemo(
    () => calculateDiscounts(items, campaigns),
    [items, campaigns],
  );

  const maxPoints = Math.max(Math.floor(result.totalAfterCoupon * 0.2), 0);

  useEffect(() => {
    if (pointValue > maxPoints) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPointValue(maxPoints);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPoints]);

  const validationMessages: string[] = [];
  if (
    couponKind === "percentage" &&
    (couponPercentValue < 0 || couponPercentValue > 100)
  ) {
    validationMessages.push(
      "คูปองเปอร์เซ็นต์ต้องอยู่ระหว่าง 0-100% (Rule: Coupon)",
    );
  }
  if (
    onTopKind === "category" &&
    (onTopPercentValue < 0 || onTopPercentValue > 100)
  ) {
    validationMessages.push(
      "ส่วนลดหมวดหมู่ต้องอยู่ระหว่าง 0-100% (Rule: On Top)",
    );
  }
  if (onTopKind === "points" && pointValue < 0) {
    validationMessages.push("แต้มต้องไม่ติดลบ และจะถูกคุมไม่เกิน 20% ของยอด");
  }
  if (seasonalEnabled && (seasonalEvery <= 0 || seasonalDiscount <= 0)) {
    validationMessages.push("Seasonal ต้องมีค่า Every และ Discount มากกว่า 0");
  }

  const allWarnings = [...validationMessages, ...result.warnings];
  const cartIsEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-[#1B1D36] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Discount Take Home Assignment
            </h1>
          </div>
        </header>

        <div className="gap-6 flex md:grid-cols-[7fr,3fr]">
          <section className="space-y-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">สินค้า</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex h-full flex-col justify-between gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                      <span>{product.category}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-300">{product.blurb}</p>
                    <p className="text-lg font-semibold text-[#FA374A]">
                      {currency.format(product.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    id={`add-to-cart-${product.id}`}
                    onClick={() => addToCart(product)}
                    className="rounded-lg bg-[#FA374A] px-4 py-2 text-sm font-semibold text-[#1B1D36] shadow-lg shadow-[#FA374A]/30 transition hover:-translate-y-[1px] hover:shadow-[#FA374A]/50"
                  >
                    เพิ่มลงรถเข็น
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 md:sticky md:top-6 md:self-start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">รถเข็น</h2>
              </div>

              {cartIsEmpty ? (
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-4 text-sm text-slate-300">
                  ยังไม่มีสินค้าในรถเข็น เลือกสินค้าด้านซ้ายเพื่อเริ่มต้น
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr,auto] gap-3 rounded-lg bg-white/5 p-3 ring-1 ring-white/10"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-300">
                          {item.category}
                        </p>
                        <p className="text-sm text-[#FA374A]">
                          {currency.format(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, {
                              quantity: parseNumber(e.target.value),
                            })
                          }
                          id={`cart-qty-${item.id}`}
                          className="w-16 rounded-md border border-white/15 bg-white/10 px-2 py-1 text-sm text-white focus:border-[#FA374A] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          id={`cart-remove-${item.id}`}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-[#FA374A] hover:text-[#FA374A]"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>เลือกส่วนลด</span>
              </div>

              {cartIsEmpty && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                  ต้องมีสินค้าในรถเข็นก่อน จึงจะใช้ส่วนลดได้
                </div>
              )}

              <div className="space-y-3">
                <div className="grid gap-3">
                  <label className="text-sm font-semibold text-white">
                    Coupon
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <select
                      disabled={cartIsEmpty}
                      className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                      value={couponKind}
                      id="coupon-kind"
                      onChange={(e) =>
                        setCouponKind(e.target.value as CouponKind)
                      }
                    >
                      <option value="none" className="bg-[#1B1D36] text-white">
                        ไม่ใช้
                      </option>
                      <option value="fixed" className="bg-[#1B1D36] text-white">
                        Fixed amount
                      </option>
                      <option
                        value="percentage"
                        className="bg-[#1B1D36] text-white"
                      >
                        Percentage
                      </option>
                    </select>
                    {couponKind === "fixed" && (
                      <input
                        disabled={cartIsEmpty}
                        type="number"
                        min={0}
                        value={couponFixedValue}
                        onChange={(e) =>
                          setCouponFixedValue(parseNumber(e.target.value))
                        }
                        id="coupon-fixed"
                        className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                        placeholder="Amount THB"
                      />
                    )}
                    {couponKind === "percentage" && (
                      <input
                        disabled={cartIsEmpty}
                        type="number"
                        min={0}
                        max={100}
                        value={couponPercentValue}
                        onChange={(e) =>
                          setCouponPercentValue(parseNumber(e.target.value))
                        }
                        id="coupon-percent"
                        className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                        placeholder="Percent"
                      />
                    )}
                  </div>
                </div>

                <div className="grid gap-3">
                  <label className="text-sm font-semibold text-white">
                    On Top
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <select
                      disabled={cartIsEmpty}
                      className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                      value={onTopKind}
                      id="on-top-kind"
                      onChange={(e) =>
                        setOnTopKind(e.target.value as OnTopKind)
                      }
                    >
                      <option value="none" className="bg-[#1B1D36] text-white">
                        ไม่ใช้
                      </option>
                      <option
                        value="category"
                        className="bg-[#1B1D36] text-white"
                      >
                        Category %
                      </option>
                      <option
                        value="points"
                        className="bg-[#1B1D36] text-white"
                      >
                        Points (max 20%)
                      </option>
                    </select>

                    {onTopKind === "category" && (
                      <select
                        disabled={cartIsEmpty}
                        className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                        value={onTopCategory}
                        id="on-top-category"
                        onChange={(e) =>
                          setOnTopCategory(e.target.value as ItemCategory)
                        }
                      >
                        {ITEM_CATEGORIES.map((category) => (
                          <option
                            key={category}
                            value={category}
                            className="bg-[#1B1D36] text-white"
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    )}

                    {onTopKind === "category" && (
                      <input
                        disabled={cartIsEmpty}
                        type="number"
                        min={0}
                        max={100}
                        value={onTopPercentValue}
                        onChange={(e) =>
                          setOnTopPercentValue(parseNumber(e.target.value))
                        }
                        id="on-top-percent"
                        className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                        placeholder="Percent"
                      />
                    )}

                    {onTopKind === "points" && (
                      <div className="space-y-1">
                        <input
                          disabled={cartIsEmpty}
                          type="number"
                          min={0}
                          value={pointValue}
                          onChange={(e) =>
                            setPointValue(
                              Math.min(parseNumber(e.target.value), maxPoints),
                            )
                          }
                          id="on-top-points"
                          className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                          placeholder="Points"
                        />
                        <p className="text-[11px] text-slate-300">
                          ใช้ได้สูงสุด {currency.format(maxPoints)} (20%
                          ของยอดหลัง Coupon)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3">
                  <label className="text-sm font-semibold text-white">
                    Seasonal
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        disabled={cartIsEmpty}
                        type="checkbox"
                        checked={seasonalEnabled}
                        onChange={(e) => setSeasonalEnabled(e.target.checked)}
                        id="seasonal-toggle"
                        className="h-4 w-4 rounded border border-white/30 bg-white/20 accent-[#FA374A]"
                      />
                      เปิด / ปิด ส่วนลด Seasonal
                    </label>
                    {seasonalEnabled && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          disabled={cartIsEmpty}
                          type="number"
                          min={0}
                          value={seasonalEvery}
                          onChange={(e) =>
                            setSeasonalEvery(parseNumber(e.target.value))
                          }
                          id="seasonal-every"
                          className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                        />
                        <input
                          disabled={cartIsEmpty}
                          type="number"
                          min={0}
                          value={seasonalDiscount}
                          onChange={(e) =>
                            setSeasonalDiscount(parseNumber(e.target.value))
                          }
                          id="seasonal-discount"
                          className={`rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:border-[#FA374A] focus:outline-none ${cartIsEmpty ? "cursor-not-allowed opacity-50" : ""}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl bg-[#FA374A]/10 p-4 ring-1 ring-[#FA374A]/30">
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>ยอดรวมสินค้า</span>
                <span className="font-semibold text-white">
                  {currency.format(result.subtotal)}
                </span>
              </div>

              {result.discounts.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between text-sm text-[#FA374A]"
                >
                  <span>{line.label}</span>
                  <span>-{currency.format(line.amount)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-[#FA374A]/40 pt-2 text-base font-semibold text-white">
                <span>จ่ายสุทธิ</span>
                <span>{currency.format(result.finalTotal)}</span>
              </div>

              {allWarnings.length > 0 && (
                <div className="space-y-1 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  {allWarnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
