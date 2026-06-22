import React from "react";
import { getFaq, getReviews, checkUserSession } from "@/app/actions/dbActions";
import { getServerLocale, localizeText } from "@/lib/serverLocale";
import FaqSection from "@/components/FaqSection";
import ReviewsSection from "@/components/ReviewsSection";

export const revalidate = 0;

export default async function FaqReviewsPage() {
  const locale = await getServerLocale();
  const faqData = await getFaq();
  const reviewsData = await getReviews({ limit: 6 });
  const isLoggedIn = await checkUserSession();

  const faqWithLocales = faqData.map(cat => ({
    ...cat,
    name: localizeText(cat.name, locale) || "",
    questions: cat.questions.map(q => ({
      ...q,
      question: localizeText(q.question, locale) || "",
      answer: localizeText(q.answer, locale) || ""
    }))
  }));

  return (
    <div className="bg-[#fbfaf7] min-h-screen py-16">
      <FaqSection faq={faqWithLocales} locale={locale} />
      <ReviewsSection initialData={reviewsData} locale={locale} isLoggedIn={isLoggedIn} />
    </div>
  );
}