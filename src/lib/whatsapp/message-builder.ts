import { IOrder, IRestaurantSettings, OrderStatus } from "@/types";
import { formatCurrency, sanitizeIndianPhone } from "@/lib/utils";

export function buildOrderWhatsAppText(order: IOrder): string {
  const itemsText = order.items
    .map((item) => {
      let itemTitle = item.name;
      if (item.selectedVariant) {
        itemTitle += ` (${item.selectedVariant.name})`;
      }
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        const addOnsStr = item.selectedAddOns.map((a) => a.name).join(", ");
        itemTitle += ` [Add-on: ${addOnsStr}]`;
      }
      return `${item.quantity} × ${itemTitle} — ${formatCurrency(item.subtotal)}`;
    })
    .join("\n");

  let addressBlock = "";
  if (order.orderType === "DELIVERY" && order.deliveryAddressSnapshot) {
    const a = order.deliveryAddressSnapshot;
    const parts = [
      a.houseNumber,
      a.street,
      a.landmark ? `Near ${a.landmark}` : null,
      a.city,
      a.state,
      a.pincode,
    ].filter(Boolean);
    addressBlock = parts.join(", ");
  } else {
    addressBlock = "Pickup at Dhaba Counter";
  }

  const paymentMethodLabel =
    order.paymentMethod === "COD"
      ? "Cash on Delivery"
      : order.paymentMethod === "UPI"
      ? `UPI Payment (${order.paymentStatus})`
      : `Online Payment / Razorpay (${order.paymentStatus})`;

  const lines = [
    "🍛 *PANDIT JI KA DHABA*",
    "_घर का स्वाद_",
    "",
    "🧾 *NEW ORDER*",
    "",
    `*Order ID:* ${order.orderNumber}`,
    "",
    "👤 *Customer:*",
    order.customerSnapshot.name,
    "",
    "📞 *Phone:*",
    order.customerSnapshot.phone,
    "",
    "📦 *ITEMS:*",
    "",
    itemsText,
    "",
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    order.discount > 0 ? `Discount: -${formatCurrency(order.discount)}` : null,
    order.couponDiscount > 0 ? `Coupon (${order.coupon}): -${formatCurrency(order.couponDiscount)}` : null,
    order.orderType === "DELIVERY"
      ? `Delivery: ${order.deliveryFee === 0 ? "FREE" : formatCurrency(order.deliveryFee)}`
      : "Order Type: Self Pickup (₹0 Delivery)",
    order.tax > 0 ? `Tax: ${formatCurrency(order.tax)}` : null,
    "",
    `*TOTAL: ${formatCurrency(order.total)}*`,
    "",
    "💳 *Payment:*",
    paymentMethodLabel,
    "",
    "📍 *Delivery Address:*",
    addressBlock,
    order.notes ? `\n📝 *Note:*\n${order.notes}` : null,
    "",
    "Please confirm my order.",
  ].filter((line) => line !== null);

  return lines.join("\n");
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = sanitizeIndianPhone(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function buildAdminStatusMessage(
  status: OrderStatus,
  order: IOrder,
  settings?: IRestaurantSettings | null
): string {
  const templates = settings?.whatsappTemplates;
  let template = "";

  switch (status) {
    case "CONFIRMED":
      template =
        templates?.confirmed ||
        "Namaste {customerName}! Your order #{orderNumber} has been CONFIRMED by Pandit Ji Ka Dhaba. We are preparing it fresh for you!";
      break;
    case "PREPARING":
      template =
        templates?.preparing ||
        "Namaste {customerName}! Your order #{orderNumber} is now PREPARING with desi ghee and love. 🍛";
      break;
    case "READY":
    case "READY_FOR_PICKUP":
      template =
        templates?.ready ||
        "Namaste {customerName}! Your order #{orderNumber} is READY! You can collect it or wait for our delivery partner.";
      break;
    case "OUT_FOR_DELIVERY":
      template =
        templates?.outForDelivery ||
        "Namaste {customerName}! Your order #{orderNumber} is OUT FOR DELIVERY and on its way to your address. 🛵";
      break;
    case "DELIVERED":
    case "COMPLETED":
      template =
        templates?.delivered ||
        "Namaste {customerName}! Your order #{orderNumber} has been DELIVERED. Enjoy the authentic desi swad! घर का स्वाद ❤️";
      break;
    case "CANCELLED":
      template =
        templates?.cancelled ||
        "Namaste {customerName}! Your order #{orderNumber} has been cancelled. Please contact us for any assistance.";
      break;
    default:
      template = "Namaste {customerName}! Status for your order #{orderNumber}: {status}";
  }

  return template
    .replace("{customerName}", order.customerSnapshot.name)
    .replace("{orderNumber}", order.orderNumber)
    .replace("{status}", status);
}
