# PANDIT JI KA DHABA — Restaurant Ordering & Admin Management Platform
**Tagline:** घर का स्वाद (Authentic Indian Taste)

A modern, production-ready, full-stack restaurant ordering web application with dynamic MongoDB Atlas database, customer ordering portal, real-time WhatsApp order handoff engine, and secure administrative management dashboard.

---

## 🌟 Key Highlights & Design Preservation

This platform was built by preserving the visual identity and aesthetic of the original design source of truth:
- **Exact Visual Identity:** Cream background (`#fbf7ef`), Navy primary (`#102a43`), Accent blue (`#246b9b`), and Dhaba gold (`#d99a2b`).
- **Typography:** Classic Georgia serif restaurant headings paired with modern sans-serif body text.
- **Components:** Original hero section with guest rating badges, 4-item trust strip, menu cards with hover lift, chef combo offer banner, masonry gallery layout, 5-star customer reviews, contact & table booking form, sticky mobile cart bar, and slide-over cart drawer.

---

## 📦 Tech Stack

- **Framework:** Next.js 15+ (App Router) with React 19 and TypeScript
- **Styling:** Vanilla CSS variables + Tailwind CSS with custom design tokens
- **Database:** MongoDB Atlas with Mongoose schemas and connection caching singleton
- **Authentication:** Secure JWT sessions stored in HTTP-only, SameSite cookies
- **Validation:** Zod schemas for all client and server endpoints
- **Icons:** Lucide React
- **Analytics Charts:** Recharts
- **Image Architecture:** Cloudinary CDN integration with local fallback
- **Payments:** Razorpay-ready architecture with server-side signature verification & webhooks
- **WhatsApp Integration:** Dynamic URL-encoded multi-line emoji receipts based on database settings

---

## 🚀 Features

### 👤 Customer Features
1. **Explore Menu:** Dynamic category filter pills, search bar, and "Pure Veg" toggle.
2. **Food Details & Portions:** Choose between portion sizes (e.g., Half / Full) and add-ons (e.g., Extra Butter, Extra Paneer).
3. **Cart & Local Persistence:** Persistent cart across browser refreshes with item quantities, notes, and subtotal calculation.
4. **Checkout Flow:** Mobile-first checkout with Delivery or Self Pickup options, address book, and order notes.
5. **Coupons:** Server-side coupon verification (`PANDIT10` for 10% off, `DESISWAD` for flat ₹50 off).
6. **WhatsApp Order Handoff:**
   - Order is validated and saved in MongoDB first.
   - Order ID (e.g., `PJD-20261003-1234`) is generated.
   - One-click **"Send Order on WhatsApp"** button opens WhatsApp with formatted order receipt.
   - Fallback **"Copy Order Details"** button provided.
7. **Live Order Tracking:** Step-by-step visual timeline: *Order Placed → Confirmed → Preparing → Ready → Out for Delivery → Delivered*.
8. **Printable Receipt:** Standard A4 and 80mm thermal roll print format.
9. **Table Booking:** Instant reservation request saved to database with WhatsApp confirmation option.
10. **Customer Account:** Profile management, saved addresses, and 1-click reorder.

### 🛡️ Admin Management Dashboard (`/admin`)
1. **Dashboard Metrics:** Today's Orders, Gross Revenue, Pending Orders, Orders In Kitchen, Completed Orders, and Total Customers.
2. **Analytics & Reports:** 7-day and 30-day revenue charts using Recharts, best-selling dishes, payment methods distribution, and CSV export.
3. **Orders Management:** Filter by status, change order status in real time, view full address/item snapshots, and message customers directly on WhatsApp.
4. **Menu Management:** Create, edit, delete, duplicate, and toggle dish availability. Manage portion variants and add-on pricing.
5. **Category Management:** Create and reorder menu categories.
6. **Customer Directory:** Track customer lifetime spend, total orders, and saved addresses.
7. **Offer & Coupon Manager:** Create percentage or fixed discount coupons with minimum order limits and expiry dates.
8. **Table Reservations:** Accept or reject guest table requests.
9. **Review Moderation:** Approve or reject guest reviews before publishing.
10. **Payment Reconciliation:** Audit COD, UPI, and online gateway transactions.
11. **Restaurant & WhatsApp Settings:** Configure business name, contact phone, physical address, opening hours, delivery fees, free delivery threshold, and dynamic restaurant WhatsApp number.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+ installed
- MongoDB installed locally or a free MongoDB Atlas connection string

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

Example `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/pandit_ji_ka_dhaba
AUTH_SECRET=pandit_ji_ka_dhaba_secret_jwt_key_2026_authentic_taste_desiswad
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional integrations
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="Pandit Ji Ka Dhaba <no-reply@panditjikadhaba.com>"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Database with Initial Menu & Categories
Populate the database with all 10 authentic dishes from the original website:
```bash
npm run seed
```

### 5. Create the Initial Administrator Account
Run the secure CLI script to create your admin account:
```bash
npm run create-admin
```
Follow the interactive prompts to enter Admin Name, Phone, Email, and Password.

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- Customer Website: `http://localhost:3000`
- Admin Login: `http://localhost:3000/admin/login`
- Admin Dashboard: `http://localhost:3000/admin`

---

## 🏗️ Production Build

To test and compile the production build:
```bash
npm run build
npm start
```

---

## 🔒 Security Architecture

1. **Server-Side Price Recalculation:** Prices from the frontend are never trusted. All items, portion variants, and add-ons are recalculated server-side against current database records during checkout.
2. **Server-Side Coupon Validation:** Coupon expiry, minimum order amount, and usage limits are verified on the server.
3. **HTTP-Only Cookies:** Auth tokens are stored in secure HTTP-only cookies to prevent XSS credential theft.
4. **Role-Based Authorization:** Every `/api/admin/*` and admin page route uses `requireAdmin()` to verify valid JWT and `ADMIN` role.
5. **Payment Webhook Verification:** Razorpay webhook requests are cryptographically verified using HMAC SHA-256 signatures before updating payment states.
