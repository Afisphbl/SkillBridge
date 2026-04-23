import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/UI/ToastProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | SkillBridge",
    default: "SkillBridge - The Next-Gen Freelance Marketplace",
  },
  description:
    "SkillBridge is a premium SaaS platform connecting elite freelancers with global clients. Experience real-time collaboration, advanced project tracking, and seamless payments.",
  keywords: ["freelance", "marketplace", "remote work", "professional services", "saas"],
  authors: [{ name: "SkillBridge Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://skill-bridge-weld-delta.vercel.app/",
    siteName: "SkillBridge",
    title: "SkillBridge - Freelance Marketplace",
    description: "Connect with top talent and manage your projects with ease on SkillBridge.",
    images: [
      {
        url: "https://skill-bridge-weld-delta.vercel.app/SkillBridge.png",
        width: 1200,
        height: 630,
        alt: "SkillBridge Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillBridge - Freelance Marketplace",
    description: "The professional way to hire and work.",
    images: ["https://skill-bridge-weld-delta.vercel.app/SkillBridge.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initThemeScript = `
    (function () {
      try {
        var themeKey = "skillbridge-theme";
        var modeKey = "skillbridge-theme-mode";
        var mode = localStorage.getItem(modeKey);
        var stored = localStorage.getItem(themeKey);
        var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var theme;
        if (mode === "light" || mode === "dark") {
          theme = mode;
        } else if (mode === "system") {
          theme = systemDark ? "dark" : "light";
        } else {
          theme = stored || (systemDark ? "dark" : "light");
        }
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {}
    })();
  `;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ToastProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
