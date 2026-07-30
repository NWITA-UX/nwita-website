/* Small shared helpers — formatting, WhatsApp deep links, slugs. */

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatMoney(value: number | string, symbol = "$") {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return `${symbol}0`;
  const hasCents = Math.abs(n % 1) > 0.001;
  return `${symbol}${n.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  })}`;
}

export function cleanPhone(p: string) {
  return p.replace(/[^\d]/g, "");
}

/** WhatsApp deep link — wa.me accepts only digits, no "+". */
export function waLink(phone: string, message: string) {
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export interface OrderInfo {
  product: string;
  size?: string;
  color?: string;
  quantity?: number;
  note?: string;
}

/** Pre-filled WhatsApp order message, matching the brand tone. */
export function buildOrderMessage(o: OrderInfo) {
  const lines = ["Hello, I would like to order:", "", `Product: ${o.product}`];
  if (o.size) lines.push(`Size: ${o.size}`);
  if (o.color) lines.push(`Color: ${o.color}`);
  if (o.quantity && o.quantity > 1) lines.push(`Quantity: ${o.quantity}`);
  if (o.note && o.note.trim()) {
    lines.push("", `Note: ${o.note.trim()}`);
  }
  lines.push("", "Thank you.");
  return lines.join("\n");
}

/** Rough luminance check so swatches can pick legible text. */
export function isLightColor(name: string) {
  const light = ["white", "bone", "ivory", "cream", "grey", "gray", "sand", "ecru", "fog"];
  return light.some((l) => name.toLowerCase().includes(l));
}

export const COLOR_HEX: Record<string, string> = {
  black: "#111111",
  bone: "#e6e0d4",
  white: "#f2f0ea",
  ivory: "#ece7db",
  "washed grey": "#8d8b86",
  grey: "#8d8b86",
  charcoal: "#2a2a2c",
  graphite: "#3a3a3d",
  ecru: "#ddd6c6",
};

export function colorHex(name: string) {
  return COLOR_HEX[name.toLowerCase().trim()] ?? "#6b6b6b";
}
