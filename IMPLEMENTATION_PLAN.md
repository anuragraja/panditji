# IMPLEMENTATION PLAN: PANDIT JI KA DHABA
**Tagline:** घर का स्वाद
**Architecture:** Next.js (App Router) + TypeScript + Tailwind CSS + MongoDB (Mongoose) + JWT Auth + WhatsApp Handoff + Admin Dashboard

---

## 1. Executive Summary & Design Preservation Mandate

The attached HTML website (`original_website.html`) is the **Design Source of Truth**. We are not replacing it with a generic template. The exact visual identity must be preserved across the entire application:
- **Color Palette:**
  - Navy: `#102a43`, Navy Secondary: `#183b5b`, Accent Blue: `#246b9b`
  - Indian Gold: `#d99a2b`, Gold Soft / Cream: `#f5d28d` / `#f2c35e`
  - Cream Background: `#fbf7ef`, Paper: `#fffdf9`, Line/Borders: `#e9e1d4`
  - Ink (Primary Text): `#172b3a`, Muted Text: `#6c7b87`
- **Typography & Brand Identity:**
  - Headings: Georgia, serif (e.g. *Desi Swad. Apno Wali Feeling.*)
  - Logo Monogram: `PJ` with navy background, gold border, and gold tagline `KA DHABA`
  - Trust strip with iconic badges (Authentic Taste, Fresh Ingredients, Freshly Cooked, Warm Hospitality)
  - Food card styling with subtle hover lift, tag badges, gold "+ Add" button
  - Chef's Family Combo gradient banner
  - Our Story section with "SERVING WITH LOVE SINCE 2026" badge
  - Masonry-style 5-image gallery grid
  - 5-star customer testimonials
  - Contact section with live Table Booking form
  - Cart drawer & mobile sticky cart bar

---

## 2. Current Architecture vs. Target Architecture

| Component | Current State | Target State |
|---|---|---|
| **Framework** | Static HTML5 + vanilla JavaScript | Next.js 15+ App Router, React 19 / 18, TypeScript |
| **Styling** | Hardcoded CSS `<style>` tag | Tailwind CSS with design tokens mapped to CSS variables identical to original |
| **Menu Items** | Hardcoded `dishes = [...]` array in JS | MongoDB `MenuItem` collection with dynamic fetching, variants, add-ons |
| **Categories** | Hardcoded client-side extraction | MongoDB `Category` collection managed via Admin panel |
| **Cart** | `localStorage` only, client-only calculation | Persistent cart + secure server-side recalculation on checkout |
| **WhatsApp Order** | Static link to hardcoded `919000000000` | Dynamic order creation in MongoDB first -> URL-encoded receipt to dynamic WhatsApp number from DB settings |
| **Table Booking** | Dummy JS form preventDefault | Stored in MongoDB `Booking` collection with admin approval workflow & WhatsApp notifications |
| **Authentication** | None | Secure JWT in HTTP-only cookies with CUSTOMER and ADMIN roles |
| **Admin Panel** | Non-existent | Full dashboard at `/admin` (Orders, Menu, Categories, Customers, Offers, Bookings, Reviews, Reports, Settings) |
| **Payments** | None (WhatsApp text only) | COD, UPI QR / ID, and Razorpay-ready integration with webhook signature verification |
| **Receipts** | None | Printable thermal / A4 receipts with barcode/details |

---

## 3. Database Models (MongoDB Atlas via Mongoose)

1. **User**
   - `name`, `email`, `phone`, `passwordHash`, `role` (`CUSTOMER` | `ADMIN`), `addresses[]`, `createdAt`, `updatedAt`
2. **Category**
   - `name`, `hindiName`, `slug`, `displayOrder`, `isActive`, `image`
3. **MenuItem**
   - `name`, `hindiName`, `slug`, `description`, `category` (ref), `image`, `foodType` (`VEG` | `NON_VEG` | `BEVERAGE`), `basePrice`, `discountPrice`, `variants` (`[{ name, price }]`), `addOns` (`[{ name, price }]`), `preparationTime`, `available`, `featured`, `popular`, `todaySpecial`
4. **Order**
   - `orderNumber` (format: `PJD-YYYYMMDD-XXXX`), `customer` (ref User, optional for guest), `customerSnapshot` (`{ name, phone, email }`), `items[]` (frozen snapshot of title, variant, add-ons, unit price, quantity, subtotal), `orderType` (`DELIVERY` | `PICKUP`), `deliveryAddressSnapshot`, `subtotal`, `discount`, `couponDiscount`, `deliveryFee`, `tax`, `total`, `coupon` (code), `paymentMethod` (`COD` | `UPI` | `RAZORPAY`), `paymentStatus` (`PENDING` | `PAID` | `FAILED` | `REFUNDED`), `orderStatus` (`PENDING` | `CONFIRMED` | `PREPARING` | `READY` | `OUT_FOR_DELIVERY` | `DELIVERED` | `CANCELLED`), `notes`, `statusHistory[]` (`[{ status, timestamp, note }]`), `whatsappSent` (boolean)
5. **RestaurantSettings**
   - Singleton model: `restaurantName`, `tagline`, `logo`, `phone`, `whatsappNumber`, `whatsappOrdersEnabled`, `email`, `address`, `googleMapsUrl`, `openingHours`, `socialLinks`, `acceptOrders`, `deliveryEnabled`, `pickupEnabled`, `minOrderAmount`, `deliveryFee`, `freeDeliveryAbove`, `estimatedDeliveryTime`, `taxEnabled`, `taxPercentage`, `codEnabled`, `upiEnabled`, `upiId`, `onlinePaymentEnabled`, `heroHeading`, `heroSubtitle`, `heroImage`, `announcementBanner`, `whatsappTemplates`
6. **Booking**
   - `name`, `phone`, `date`, `time`, `guests`, `specialRequest`, `status` (`PENDING` | `CONFIRMED` | `REJECTED` | `COMPLETED` | `CANCELLED`)
7. **Coupon**
   - `code`, `description`, `discountType` (`PERCENTAGE` | `FIXED`), `discountValue`, `minOrder`, `maxDiscount`, `startDate`, `expiryDate`, `usageLimit`, `perUserLimit`, `usedCount`, `active`
8. **Review**
   - `customer` (ref User), `order` (ref Order), `name`, `rating`, `comment`, `approved`, `createdAt`
9. **Payment**
   - `orderId`, `paymentId`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `method`, `amount`, `status`, `rawWebhookPayload`
10. **AuditLog**
    - `user` (ref), `action`, `entity`, `entityId`, `metadata`, `timestamp`

---

## 4. Application Routes Structure

### Customer Routes
- `/` - Homepage (Preserves exact design: Hero, Trust, Menu grid with live DB data, Chef Combo, About, Gallery, Reviews, Contact & Table Booking)
- `/menu` - Comprehensive Menu page with category filters, search bar, veg filter, item cards
- `/menu/[slug]` - Food item details with variants (Half/Full), add-ons (extra butter, paneer, etc.), special instructions
- `/cart` - Dedicated Cart page + Slide-over Drawer
- `/checkout` - Multi-step Checkout (Delivery/Pickup, Address selection/entry, Coupon apply, Payment selection)
- `/order-success/[orderId]` - Order confirmation screen with **"Send Order on WhatsApp"** button, **"Track Order"**, and **"View Receipt"**
- `/track-order/[orderId]` - Live order timeline with real-time status steps
- `/receipt/[orderId]` - Printable receipt (A4 and thermal styling)
- `/login` & `/register` & `/forgot-password` - Customer authentication
- `/account` - Customer dashboard overview
- `/account/orders` & `/account/orders/[id]` - Order history & instant reorder
- `/account/profile` & `/account/addresses` - Profile details & address book management
- `/about`, `/contact`, `/privacy`, `/terms` - Static & dynamic content pages

### Admin Routes
- `/admin/login` - Dedicated secure admin login
- `/admin` - Dashboard (Metrics cards, Revenue/Orders chart via Recharts, recent orders, pending actions)
- `/admin/orders` - Comprehensive Order management (Filters, status updates, WhatsApp notification trigger, thermal print)
- `/admin/orders/[id]` - Order detail modal/page with customer communication
- `/admin/menu` - Menu Item CRUD, variants/add-ons management, stock availability switch, image upload
- `/admin/categories` - Category CRUD and sorting
- `/admin/customers` - Customer directory, lifetime value, order history
- `/admin/offers` - Coupon code manager
- `/admin/bookings` - Table reservation manager with status updates
- `/admin/reviews` - Review moderation (Approve/Reject)
- `/admin/payments` - Transaction history and payment reconciliation
- `/admin/reports` - Analytics (Daily/Weekly/Monthly revenue, top dishes, payment breakdown, CSV export)
- `/admin/website` - Homepage content manager (Hero, About, Gallery, Announcements)
- `/admin/settings` - Restaurant settings, WhatsApp number, Delivery fees, Tax, Payment credentials

---

## 5. Implementation Milestones

### Milestone 1: Project Setup & Pixel-Perfect Design Migration
- Initialize Next.js project with App Router, TypeScript, and Tailwind CSS.
- Configure Tailwind with exact custom colors (`navy`, `navy2`, `blue`, `gold`, `cream`, `paper`, `ink`, `muted`, `line`).
- Reconstruct the homepage components (`Navbar`, `Hero`, `TrustBar`, `MenuPreview`, `ComboOffer`, `About`, `Gallery`, `Reviews`, `ContactBooking`, `Footer`, `CartDrawer`).
- Verify visual fidelity against `original_website.html`.
- Run `npm run lint` and `npm run build` to verify clean setup.

### Milestone 2: MongoDB Atlas & Mongoose Models + Database Seeding
- Establish robust MongoDB connection helper (`lib/db/mongodb.ts`) with connection caching.
- Implement all 10 Mongoose schemas & models with strict TypeScript interfaces.
- Create `scripts/seed.ts` containing the original 10 dishes, standard categories, initial restaurant settings, and test reviews.
- Create CLI command `npm run seed` and `npm run create-admin`.

### Milestone 3: Authentication & Security Architecture
- Implement secure JWT token generation & verification with HTTP-only cookies.
- Create Auth APIs (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`).
- Create `requireAdmin` server-side authorization middleware/helper.
- Implement login and registration pages for customers and admin.

### Milestone 4: Real Database Menu & Categories
- Build Menu APIs (`/api/menu`, `/api/menu/[slug]`, `/api/categories`).
- Connect customer menu section and `/menu` page to live MongoDB data.
- Implement category filtering, search, and veg/non-veg filters.

### Milestone 5: Cart System & Food Customization
- Implement custom React Cart context backed by `localStorage` for guests and synced for logged-in users.
- Support food variant selection (e.g. Half / Full) and add-on selection (e.g. Extra Butter, Paneer).
- Add sticky mobile cart footer bar.

### Milestone 6: Checkout System
- Build Checkout flow with address validation (House, Street, Landmark, City, State, Pincode).
- Coupon discount engine with server-side validation.
- Delivery fee & tax calculation based on dynamic restaurant settings.

### Milestone 7: Order Creation & Server-side Pricing
- Secure order submission API (`/api/orders`).
- Server recalculates all product prices from DB snapshot (preventing client price tampering).
- Human-readable order number generator (`PJD-YYYYMMDD-XXXX`).
- Order tracking API & timeline UI (`/track-order/[orderId]`).

### Milestone 8: WhatsApp Order System & Communication
- Dynamic WhatsApp URL generator using `RestaurantSettings.whatsappNumber`.
- Formatted multi-line desi order receipt with emojis and itemized bill.
- "Send Order on WhatsApp" button + "Copy Order Details" fallback.
- Admin WhatsApp customer communication templates.

### Milestone 9: Admin Dashboard & Order Management
- Admin dashboard layout with sidebar, header, stats cards, and Recharts analytics.
- Real-time order list with status badges and quick status progression buttons.
- Full order detail modal with receipt generation and customer WhatsApp link.

### Milestone 10: Admin Management Suites (Menu, Offers, Bookings, Reviews, Settings)
- Menu item CRUD with Cloudinary architecture.
- Category manager with order sorting.
- Coupons and discount manager.
- Table booking manager with approval workflow.
- Review moderation system.
- Global Restaurant Settings manager (WhatsApp, delivery thresholds, tax, timing).

### Milestone 11: Receipts, Reports, SEO & Performance
- Professional printable receipt (A4 and thermal roll 80mm).
- Admin Reports with Recharts and CSV export.
- SEO metadata, OpenGraph, JSON-LD Restaurant Schema, `sitemap.xml`, and `robots.txt`.
- Performance optimizations with Next/Image and responsive layouts.

### Milestone 12: Final Testing, Verification & Production Build
- End-to-end testing of customer ordering, WhatsApp handoff, admin workflows.
- Verification of `npm run build` and production readiness.
- Complete documentation (`README.md`, `.env.example`).
