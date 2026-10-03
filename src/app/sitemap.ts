import { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db/mongodb";
import { MenuItem } from "@/models/MenuItem";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://panditjikadhaba.com";

  let dishes: Array<{ slug: string; updatedAt?: string | Date }> = [];
  try {
    await connectToDatabase();
    const items = await MenuItem.find({ available: true }).select("slug updatedAt").lean();
    dishes = items as unknown as Array<{ slug: string; updatedAt?: string | Date }>;
  } catch (e) {
    console.error("Error generating sitemap dishes:", e);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const dishRoutes: MetadataRoute.Sitemap = dishes.map((dish) => ({
    url: `${baseUrl}/menu/${dish.slug}`,
    lastModified: dish.updatedAt ? new Date(dish.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...dishRoutes];
}
