import type { MetadataRoute } from "next";

const siteUrl =
  "https://piping-portal-all-calculation-aiygib1px-b721260-4852s-projects.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}