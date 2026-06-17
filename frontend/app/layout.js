import { Inter, Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { cookies } from "next/headers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("kendmart_locale")?.value || "en";
  const titles = {
    en: "KendMart - Supporting Sustainable Farmers & Climate-Resilient Communities",
    az: "KendMart - Davamlı Fermerləri və İqlimə Davamlı Cəmiyyətləri Dəstəkləmək",
  };
  const descriptions = {
    en: "Connecting consumers with local farmers while creating measurable environmental impact. Support sustainable agriculture and rural communities.",
    az: "İstehlakçıları yerli fermerlərlə birləşdirərək ölçülə bilən ekoloji təsir yaradın. Davamlı kənd təsərrüfatını və kənd icmalarını dəstəkləyin.",
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbfaf7]">
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow pt-24">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
