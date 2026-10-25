import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { CompareProvider } from "@/components/CompareProvider";
import MobileTabBar from "@/components/MobileTabBar";
import ScrollTop from "@/components/ScrollTop";
import SiteChrome from "@/components/SiteChrome";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans" });

export const metadata = {
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: "Laptops, desktop PCs, components, monitors and accessories from Newcom, Colombo.",
};

// Applies the saved or system theme before first paint (same "newcom-theme" key as the mockup).
const themeScript = `try{var t=localStorage.getItem('newcom-theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      {/* browser extensions (Grammarly, ColorZilla, password managers) add attributes to <body> before React loads */}
      <body suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">{themeScript}</Script>
        <CartProvider>
          <CompareProvider>
            <SiteChrome header={<Header />} footer={<Footer />} extras={<><MobileTabBar /><ScrollTop /></>}>
              {children}
            </SiteChrome>
          </CompareProvider>
        </CartProvider>
      </body>
    </html>
  );
}
