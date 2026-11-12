import { getDay, parse } from "date-fns";
import type { CinemaTier } from "@api-hooks/cinemas/model";
import type { SeatMap, SeatPrice } from "@api-hooks/seats/model";
import { PRICE } from "@common/api/mock/data";
import { SERVICE_FEE } from "@constants/app";
import { seatById } from "@common/theater/layout";

// Regular-tier cinemas take 20% off Monday to Thursday
export function priceForShowtime(tier: CinemaTier, date: string): { price: SeatPrice; discountPercent: number } {
  const dow = getDay(parse(date, "yyyy-MM-dd", new Date())); // 0 = Sunday
  const weekday = dow >= 1 && dow <= 4;
  return { price: { ...PRICE[tier] }, discountPercent: tier === "regular" && weekday ? 20 : 0 };
}

export function seatPrice(id: string, price: SeatPrice) {
  return seatById(id)?.kind === "rec" ? price.rec : price.std;
}

export function orderTotals(seats: string[], pricing: Pick<SeatMap, "price" | "discountPercent">) {
  const subtotal = seats.reduce((a, s) => a + seatPrice(s, pricing.price), 0);
  const discount = Math.round((subtotal * pricing.discountPercent) / 100);
  const fee = seats.length ? SERVICE_FEE * seats.length : 0;
  return { subtotal, discount, fee, total: subtotal - discount + fee };
}
