import { ThemeProvider } from "@/components/theme-provider";
import { CommandMenu } from "@/components/dialog/command-menu";
import { constructMetadata } from "@/lib/construct-metadata";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#071525" },
  ],
};

export const metadata: Metadata = constructMetadata({
  title: "SkibiriDin",
  description:
    "Controle financeiro do casal - gastos, orçamento e metas em um app mobile-first.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased font-sans bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <CommandMenu />
        </ThemeProvider>
      </body>
    </html>
  );
}
