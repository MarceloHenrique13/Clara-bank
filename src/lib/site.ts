export const siteConfig = {
  name: "SkibiriDin",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  description:
    "Controle financeiro do casal - gastos, orçamento e metas em um app mobile-first.",
  links: {
    twitter: "https://x.com/codehagen",
    github: "https://github.com/codehagen/badget",
  },
};

export type SiteConfig = typeof siteConfig;
