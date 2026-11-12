import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Production එකේදී මේක ඔයාගේ ඇත්ත ඩොමේන් එකට මාරු වෙයි (env file එකෙන්)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://revextra.online';

  return {
    rules: {
      userAgent: '*', // හැම search engine එකකටම අවස
      allow: '/',
      disallow: [
        '/api/', // API routes search කරන්න එපාෑ
        '/card/', // Private student data තියෙන නිසා search කරන්න එපා
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
