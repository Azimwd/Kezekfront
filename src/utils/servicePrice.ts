export type PricedService = { price: number | string; final_price?: number | string; discount_percent?: number };
export function serviceFinalPrice(service: PricedService): number {
  return Number(service.final_price ?? service.price);
}
export function previewDiscount(price: string | number, percent: number): string {
  const cents = Math.round(Number(price) * 100);
  return (Math.round(cents * (100 - percent) / 100) / 100).toLocaleString("ru-KZ", { maximumFractionDigits: 2 });
}
