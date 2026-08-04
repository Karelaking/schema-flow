import type { MetadataRoute } from "next";

// Cache/revalidate sitemap every 24 hours (86,400 seconds)
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://schemaflow-studio.vercel.app";
  const currentDate = new Date();

  // 1. Static pages list
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    // 2. Fetch dynamic records (replace with your ORM / DB call, e.g., Prisma, Drizzle, or fetch)
    // Example: const schemas = await db.schema.findMany({ select: { slug: true, updatedAt: true } });
    const response = await fetch(`${baseUrl}/api/public-schemas`, {
      next: { revalidate: 86400 },
    });
    const schemas: Array<{ slug: string; updatedAt?: string }> = await response.json();

    // 3. Map dynamic records to sitemap entries
    const dynamicRoutes: MetadataRoute.Sitemap = schemas.map((item) => ({
      url: `${baseUrl}/schema/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    // Return static routes gracefully if API or DB fails
    return staticRoutes;
  }
}