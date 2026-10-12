import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl = (rawUrl && !rawUrl.includes("localhost") ? rawUrl : "https://panditjirestaurant.com").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/account",
          "/account/",
          "/checkout",
          "/checkout/",
          "/cart",
          "/cart/",
          "/login",
          "/register",
          "/forgot-password",
          "/order-success",
          "/order-success/",
          "/receipt",
          "/receipt/",
          "/track-order",
          "/track-order/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

