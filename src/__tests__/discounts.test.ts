import { describe, it, expect } from 'vitest';
import { calculateCartTotal, calculateDiscounts } from '../lib/discounts';
import type { CartItem, CampaignSelection } from '../lib/discount-types';

describe('calculateCartTotal', () => {
  it('should calculate total for single item', () => {
    const items: CartItem[] = [{ price: 100, quantity: 2, category: 'electronics' }];
    expect(calculateCartTotal(items)).toBe(200);
  });

  it('should calculate total for multiple items', () => {
    const items: CartItem[] = [
      { price: 100, quantity: 2, category: 'electronics' },
      { price: 50, quantity: 3, category: 'clothing' },
    ];
    expect(calculateCartTotal(items)).toBe(350);
  });

  it('should return 0 for empty cart', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('should handle fractional quantities by flooring them', () => {
    const items: CartItem[] = [{ price: 100, quantity: 2.9, category: 'electronics' }];
    expect(calculateCartTotal(items)).toBe(200);
  });
});

describe('calculateDiscounts', () => {
  it('should calculate subtotal correctly', () => {
    const items: CartItem[] = [{ price: 100, quantity: 2, category: 'electronics' }];
    const campaigns: CampaignSelection = {};
    const result = calculateDiscounts(items, campaigns);
    expect(result.subtotal).toBe(200);
    expect(result.finalTotal).toBe(200);
  });

  it('should apply fixed coupon discount', () => {
    const items: CartItem[] = [{ price: 100, quantity: 2, category: 'electronics' }];
    const campaigns: CampaignSelection = {
      coupon: { kind: 'fixed', amount: 30 },
    };
    const result = calculateDiscounts(items, campaigns);
    expect(result.subtotal).toBe(200);
    expect(result.finalTotal).toBe(170);
    expect(result.discounts).toHaveLength(1);
    expect(result.discounts[0].amount).toBe(30);
  });

  it('should apply percentage coupon discount', () => {
    const items: CartItem[] = [{ price: 100, quantity: 2, category: 'electronics' }];
    const campaigns: CampaignSelection = {
      coupon: { kind: 'percent', percent: 10 },
    };
    const result = calculateDiscounts(items, campaigns);
    expect(result.subtotal).toBe(200);
    expect(result.finalTotal).toBe(180);
    expect(result.discounts[0].amount).toBe(20);
  });

  it('should apply seasonal discount', () => {
    const items: CartItem[] = [{ price: 100, quantity: 3, category: 'electronics' }];
    const campaigns: CampaignSelection = {
      seasonal: { every: 100, discount: 20 },
    };
    const result = calculateDiscounts(items, campaigns);
    expect(result.subtotal).toBe(300);
    // 300 / 100 = 3 times, 3 * 20 = 60
    expect(result.finalTotal).toBe(240);
    expect(result.discounts.some(d => d.label.includes('Seasonal'))).toBe(true);
  });

  it('should handle invalid seasonal parameters', () => {
    const items: CartItem[] = [{ price: 100, quantity: 2, category: 'electronics' }];
    const campaigns: CampaignSelection = {
      seasonal: { every: 0, discount: 20 },
    };
    const result = calculateDiscounts(items, campaigns);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.finalTotal).toBe(200);
  });

  it('should not apply discount exceeding final total', () => {
    const items: CartItem[] = [{ price: 100, quantity: 1, category: 'electronics' }];
    const campaigns: CampaignSelection = {
      coupon: { kind: 'fixed', amount: 500 },
    };
    const result = calculateDiscounts(items, campaigns);
    expect(result.finalTotal).toBeGreaterThanOrEqual(0);
  });

  it('should apply multiple discount types in order', () => {
    const items: CartItem[] = [{ price: 100, quantity: 2, category: 'electronics' }];
    const campaigns: CampaignSelection = {
      coupon: { kind: 'fixed', amount: 30 },
      onTop: { kind: 'points', points: 10 },
    };
    const result = calculateDiscounts(items, campaigns);
    expect(result.discounts.length).toBeGreaterThanOrEqual(2);
    expect(result.finalTotal).toBeLessThan(result.subtotal);
  });
});
