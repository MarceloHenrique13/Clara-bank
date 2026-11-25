export const siteConfig = {
  name: "SkibiriDin",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  description:
    "Controle financeiro do casal - gastos, orçamento e metas em um app mobile-first.",
  links: {
    email: "support@skibiridin.app",
    twitter: "https://x.com/codehagen",
    discord: "https://discord.gg/TK7k6uY4",
    github: "https://github.com/MarceloHenrique13/Clara-bank",
    instagram: "https://instagram.com/codehagen",
  },
};

export type SiteConfig = typeof siteConfig;
