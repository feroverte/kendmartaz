"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, Settings, LogOut, Globe } from "lucide-react";
import { checkAdminSession } from "@/app/actions/dbActions";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { locale, toggleLocale } = useLocale();
  const t = useTranslations();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    checkAdminSession().then(setIsAdmin);
    setIsOpen(false);

    fetch("/api/auth/user-check")
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.dashboard"), href: "/dashboard" },
    { name: t("nav.mission"), href: "/mission" },
    { name: t("nav.whyLocal"), href: "/why-local" },
    { name: t("nav.research"), href: "/research" },
    { name: t("nav.articles"), href: "/blog" },
    { name: t("nav.market"), href: "/market" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#fbfaf7]/90 backdrop-blur-md border-b border-emerald-900/10 shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/images/logo.png" alt="KendMart" className="h-14 w-auto" />
          <span className="text-xl font-bold font-serif-display tracking-tight text-emerald-950 leading-none">
            KendMart
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-tight transition-colors duration-200 relative py-1 ${
                isActive(link.href)
                  ? "text-emerald-900 font-semibold"
                  : "text-emerald-950/70 hover:text-emerald-900"
              }`}
            >
              {link.name}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-900 rounded-full animate-fade-in" />
              )}
            </Link>
          ))}

          {/* Language Toggle */}
          <button
            onClick={() => { toggleLocale(); router.refresh(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-900 border border-emerald-900/15"
            title={locale === "en" ? t("language.azerbaijani") : t("language.english")}
          >
            <Globe className="w-3.5 h-3.5" />
            {t("language." + locale)}
          </button>

          {/* User / Profile button */}
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-900 border border-emerald-900/15"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200 text-[10px] font-bold">
                {user.name?.charAt(0) || "U"}
              </div>
              {user.name?.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900"
            >
              <User className="w-4 h-4" />
              {t("nav.signIn")}
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-emerald-900 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Links Overlay */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#fbfaf7] border-b border-emerald-900/10 shadow-lg py-6 px-8 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-base font-semibold py-2 transition-colors ${
                isActive(link.href) ? "text-emerald-800" : "text-emerald-950/70"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Language Toggle */}
          <button
            onClick={() => { toggleLocale(); setIsOpen(false); router.refresh(); }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-900/5 text-emerald-900 rounded-xl text-sm font-semibold uppercase tracking-wider border border-emerald-900/10"
          >
            <Globe className="w-4 h-4" />
            {locale === "en" ? t("language.az") : t("language.en")}
          </button>

          {user ? (
            <>
              <div className="flex items-center gap-3 py-3 border-t border-emerald-900/10 mt-2 pt-4">
                <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200 font-bold">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-950">{user.name}</p>
                  <p className="text-[10px] text-emerald-950/50">{user.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-900 text-white rounded-xl text-sm font-semibold uppercase tracking-wider"
              >
                <User className="w-4 h-4" /> {t("nav.myProfile")}
              </Link>
              <Link
                href="/profile?tab=settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-900/5 text-emerald-900 rounded-xl text-sm font-semibold uppercase tracking-wider border border-emerald-900/10"
              >
                <Settings className="w-4 h-4" /> {t("nav.accountSettings")}
              </Link>
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await fetch("/api/auth/user-logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm font-semibold uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4" /> {t("nav.signOut")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-950 text-white rounded-xl text-sm font-semibold uppercase tracking-wider mt-2"
              >
                <User className="w-4 h-4" />
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-900/5 text-emerald-900 rounded-xl text-sm font-semibold uppercase tracking-wider border border-emerald-900/10"
              >
                {t("nav.createAccount")}
              </Link>
            </>
          )}
        </div>
      )}

    </nav>
  );
}
