// task060 3.1: robots.txt (架构师 8/8 [已批准])
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/dashboard", "/account", "/login", "/register"],
      },
    ],
    sitemap: "https://www.cprotrading.com/sitemap.xml",
  };
}