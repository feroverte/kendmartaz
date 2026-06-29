"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "kendmart-admin";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

import { 
  adminLogout,
  updateSetting,
  createFarmer,
  updateFarmer,
  deleteFarmer,
  updateRequestStatus,
  deleteRequest,
  createArticle,
  updateArticle,
  deleteArticle,
  upsertImpactMap,
  deleteImpactMap,
  updatePageContent,
  createListing,
  updateListing,
  deleteListing,
  getCredits,
  getPageContent,
  createCredit,
  updateCredit,
  deleteCredit,
  getUsers,
  getListingAnswers,
  createFaqCategory,
  deleteFaqCategory,
  createFaqQuestion,
  deleteFaqQuestion,
  getReviews,
  updateReview,
  deleteReview
} from "@/app/actions/dbActions";
import { useLocale } from "@/context/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

import { 
  Users, 
  FileText, 
  Settings, 
  Map, 
  FileEdit, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle,
  Eye,
  Store,
  BarChart3,
  Upload,
  Award,
  X,
  Star
} from "lucide-react";
import BilingualField from "./BilingualField";

function toBilingual(val) {
  if (!val && val !== 0 && val !== "") return { en: "", az: "" };
  if (typeof val === "object" && val !== null && ("en" in val || "az" in val)) return val;
  return { en: val, az: "" };
}

function bilingualify(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (field in result) {
      result[field] = toBilingual(result[field]);
    }
  }
  return result;
}

export default function AdminDashboardContent({
  initialFarmers,
  initialRequests,
  initialSettings,
  initialArticles,
  initialImpactMaps,
  initialMissionPage,
  initialWhyLocalPage,
  initialResearchPage,
  initialHomePage,
  initialDashboardPage,
  initialListings = []
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("requests");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Data states
  const [requests, setRequests] = useState(initialRequests);
  const [farmers, setFarmers] = useState(initialFarmers);
  const [articles, setArticles] = useState(initialArticles);
  const [impactMaps, setImpactMaps] = useState(initialImpactMaps);
  const [listings, setListings] = useState(initialListings);
  
  // Settings state
  const [settings, setSettings] = useState(initialSettings);
  const [credits, setCredits] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewingAnswers, setViewingAnswers] = useState(null);
  const [answersData, setAnswersData] = useState([]);
  const [answersLoading, setAnswersLoading] = useState(false);

  useEffect(() => {
    getCredits().then(setCredits).catch(() => {});
    getUsers().then(setUsers).catch(() => {});
  }, []);

  const { locale } = useLocale();
  const t = useTranslations();
  const loc = (val) => {
    if (!val) return "";
    try { const p = typeof val === "string" ? JSON.parse(val) : val; if (typeof p === "object" && p !== null) return p[locale] || p.en || ""; } catch {}
    return val;
  };

  // Forms state
  const b64default = (existing, enVal, azVal) => {
    if (existing) return toBilingual(existing);
    return { en: enVal, az: azVal };
  };
  const parseBilingualField = (val) => {
    if (!val && val !== 0 && val !== "") return { en: "", az: "" };
    if (typeof val === "object" && val !== null) return val;
    try { const parsed = JSON.parse(val); if (parsed && typeof parsed === "object" && ("en" in parsed || "az" in parsed)) return parsed; } catch {}
    return { en: val || "", az: "" };
  };

  const emptyOptions = () => [{ en: "", az: "" }, { en: "", az: "" }, { en: "", az: "" }, { en: "", az: "" }];
  const parseQuestionField = (val) => {
    if (!val) return { question: { en: "", az: "" }, options: emptyOptions() };
    if (typeof val === "object" && val !== null) {
      if (val.question) return { question: val.question, options: val.options || emptyOptions() };
      if ("en" in val || "az" in val) return { question: val, options: emptyOptions() };
      return { question: { en: "", az: "" }, options: emptyOptions() };
    }
    if (typeof val === "string") {
      try { const p = JSON.parse(val); if (p && typeof p === "object") { if (p.question) return { question: p.question, options: p.options || emptyOptions() }; if ("en" in p || "az" in p) return { question: p, options: emptyOptions() }; } } catch {}
      return { question: { en: val, az: "" }, options: emptyOptions() };
    }
    return { question: { en: "", az: "" }, options: emptyOptions() };
  };

  const [farmerForm, setFarmerForm] = useState({ id: "", name: "", region: "", products: "", story: "", practices: "", photoUrl: "", phone: "" });
  const [articleForm, setArticleForm] = useState({ id: "", title: toBilingual(""), summary: toBilingual(""), content: toBilingual(""), imageUrl: "" });
  const [impactForm, setImpactForm] = useState({ product: "", points: 5 });
  
  // Pages forms state
  const [missionForm, setMissionForm] = useState({
    heroTitle: b64default(initialMissionPage?.heroTitle, "Our Climate Mission", "İqlim Missiyamız"),
    heroSub: b64default(initialMissionPage?.heroSub, "Rebuilding a sustainable connection between communities and land.", "İcma və torpaq arasında davamlı bir əlaqə qurmaq."),
    ceoPhoto: initialMissionPage?.ceoPhoto || "",
    ceoTitle: b64default(initialMissionPage?.ceoTitle, "CEO & Founder", "CEO və Qurucu"),
    ceoName: b64default(initialMissionPage?.ceoName, "Leyla Heydarova", "Leyla Heydarova"),
    ceoBio: b64default(initialMissionPage?.ceoBio, "Environmental advocate and founder of KendMart. Working to connect consumers with regenerative agriculture practices across Azerbaijan.", "Ətraf mühit müdafiəçisi və KendMart-ın qurucusu. Azərbaycan üzrə istehlakçıları regenerativ kənd təsərrüfatı təcrübələri ilə birləşdirmək üçün çalışır."),
    ceoQuote: b64default(initialMissionPage?.ceoQuote, "Sustainable agriculture is not just about growing food — it is about nurturing communities, protecting our land, and building a future where every choice we make respects the planet and its people.", "Davamlı kənd təsərrüfatı yalnız qida yetişdirmək deyil — icmaları qidalandırmaq, torpağımızı qorumaq və hər seçimimizin planetə və insanlara hörmət etdiyi bir gələcək qurmaqdır."),
    photos: Array.isArray(initialMissionPage?.photos) ? [...initialMissionPage.photos] : [],
    sections: Array.isArray(initialMissionPage?.sections) ? initialMissionPage.sections.map(s => bilingualify(s, ["title", "description"])) : [
      (() => { const o = { title: { en: "Sustainable Agriculture", az: "Davamlı Kənd Təsərrüfatı" }, description: { en: "Traditional industrial agriculture depletes topsoil, relies heavily on chemical pesticides, and emits massive greenhouse gases. We support regenerative methods that protect ecosystems.", az: "Ənənəvi sənaye kənd təsərrüfatı torpağı tükəndirir, kimyəvi pestisidlərdən asılıdır və böyük miqdarda istixana qazı buraxır. Biz ekosistemləri qoruyan regenerativ metodları dəstəkləyirik." } }; return o; })(),
      (() => { const o = { title: { en: "Local Food Systems", az: "Yerli Qida Sistemləri" }, description: { en: "By building short, local demand networks, we reduce the emissions caused by transcontinental food transport (food miles) and packaging waste.", az: "Qısa, yerli tələb şəbəkələri quraraq, transkontinental qida nəqliyyatı (qida milləri) və qablaşdırma tullantıları nəticəsində yaranan emissiyaları azaldırıq." } }; return o; })(),
      (() => { const o = { title: { en: "Healthy Soils", az: "Sağlam Torpaqlar" }, description: { en: "Living soils store carbon, retain water, and provide nutrients. Our farmers practice minimal tilling and use organic compost to nourish soil microbiomes.", az: "Canlı torpaqlar karbon saxlayır, suyu tutur və qida maddələri təmin edir. Fermerlərimiz minimal becərmə tətbiq edir və torpaq mikrobiomlarını qidalandırmaq üçün üzvi kompostdan istifadə edir." } }; return o; })(),
      (() => { const o = { title: { en: "Biodiversity", az: "Bioloji Müxtəliflik" }, description: { en: "Monoculture farms degrade biodiversity. Sustained local farms plant cover crops, maintain hedges, and build habitats for wild pollinators and birds.", az: "Monokultura təsərrüfatları biomüxtəlifliyi azaldır. Davamlı yerli təsərrüfatlar örtük bitkiləri əkir, hasarları saxlayır və vəhşi tozlayıcılar və quşlar üçün yaşayış mühiti yaradır." } }; return o; })(),
      (() => { const o = { title: { en: "Climate Resilience", az: "İqlim Davamlılığı" }, description: { en: "Farms with high organic matter are more resilient to extreme weather like droughts and heavy floods, securing local food supplies in a changing climate.", az: "Yüksək üzvi maddələrə malik təsərrüfatlar quraqlıq və daşqın kimi ekstremal hava şəraitinə daha davamlıdır, dəyişən iqlimdə yerli qida tədarükünü təmin edir." } }; return o; })(),
    ]
  });
  const [whyLocalForm, setWhyLocalForm] = useState({
    heroTitle: toBilingual(initialWhyLocalPage?.heroTitle || ""),
    heroSub: toBilingual(initialWhyLocalPage?.heroSub || ""),
    sections: Array.isArray(initialWhyLocalPage?.sections) ? initialWhyLocalPage.sections.map(s => bilingualify(s, ["title", "content"])) : []
  });
  const [researchForm, setResearchForm] = useState({
    heroTitle: toBilingual(initialResearchPage?.heroTitle || ""),
    heroSub: toBilingual(initialResearchPage?.heroSub || ""),
    stats: Array.isArray(initialResearchPage?.stats) ? initialResearchPage.stats.map(s => bilingualify(s, ["label"])) : []
  });
  const [homeForm, setHomeForm] = useState({
    heroTag: b64default(initialHomePage?.heroTag, "Empowering Regenerative Azerbaijani Farms", "Gücləndirici Regenerativ Azərbaycan Təsərrüfatları"),
    heroTitle: b64default(initialHomePage?.heroTitle, "KendMart: Supporting Sustainable Farmers and Climate-Resilient Communities", "KendMart: Davamlı Fermerləri və İqlimə Davamlı Cəmiyyətləri Dəstəkləmək"),
    heroSub: b64default(initialHomePage?.heroSub, "Connecting consumers with local farmers while creating measurable environmental impact. Request fresh produce directly, regenerate soil health, and slash global food transport emissions.", "İstehlakçıları yerli fermerlərlə birləşdirərək ölçülə bilən ekoloji təsir yaradın. Təzə məhsulları birbaşa sifariş edin, torpaq sağlamlığını bərpa edin və qlobal qida nəqliyyatı emissiyalarını azaldın."),
    farmerSectionTag: b64default(initialHomePage?.farmerSectionTag, "Our Directory", "Kataloqumuz"),
    farmerSectionTitle: b64default(initialHomePage?.farmerSectionTitle, "Meet Our Local Farmers", "Yerli Fermerlərimizlə Tanış Olun"),
    missionSectionTag: b64default(initialHomePage?.missionSectionTag, "Our Pillars", "Sütunlarımız"),
    missionSectionTitle: b64default(initialHomePage?.missionSectionTitle, "Connecting Consumers with Regenerative Systems", "İstehlakçıları Regenerativ Sistemlərlə Birləşdirmək"),
    missionSectionSub: b64default(initialHomePage?.missionSectionSub, "We operate in support of local biological systems, providing a direct connection to farm stewards whose techniques actively combat climate degradation.", "Biz yerli bioloji sistemləri dəstəkləyərək, texnikaları iqlim deqradasiyası ilə fəal mübarizə aparan təsərrüfatçılarla birbaşa əlaqə təmin edirik."),
    missionCards: Array.isArray(initialHomePage?.missionCards) ? initialHomePage.missionCards.map(c => bilingualify(c, ["title", "description"])) : [
      (() => { const o = { title: { en: "Sustainable Agriculture", az: "Davamlı Kənd Təsərrüfatı" }, description: { en: "Supporting crops grown without synthetic chemical fertilizers or oil-based pesticides. Local organic farming reduces ecosystem pollution and chemical runoffs.", az: "Sintetik kimyəvi gübrələr və ya neft əsaslı pestisidlər olmadan yetişdirilən məhsulları dəstəkləmək. Yerli üzvi əkinçilik ekosistem çirklənməsini və kimyəvi axıntıları azaldır." } }; return o; })(),
      (() => { const o = { title: { en: "Local Food Systems", az: "Yerli Qida Sistemləri" }, description: { en: "By requesting products locally, we bypass carbon-heavy transcontinental shipping, cold chain cargo flights, and excessive plastic packaging.", az: "Məhsulları yerli sifariş etməklə, karbon ağır transkontinental daşımacılığın, soyuq zəncir yük uçuşlarının və həddindən artıq plastik qablaşdırmanın qarşısını alırıq." } }; return o; })(),
      (() => { const o = { title: { en: "Healthy Soils", az: "Sağlam Torpaqlar" }, description: { en: "Living organic soil serves as a massive carbon sink. Active crop-rotation, cover crops, and compost feeding secure rich soil ecosystems that capture CO2.", az: "Canlı üzvi torpaq böyük bir karbon uducusu kimi xidmət edir. Aktiv məhsul dövriyyəsi, örtük bitkiləri və kompost qidalanması CO2 tutan zəngin torpaq ekosistemlərini təmin edir." } }; return o; })(),
      (() => { const o = { title: { en: "Biodiversity Protection", az: "Bioloji Müxtəlifliyin Qorunması" }, description: { en: "Sustainable farms prevent monoculture stagnation. Planting diverse crops, flower strips, and hedges protects birds, bees, and essential wild pollinators.", az: "Davamlı təsərrüfatlar monokultura durğunluğunun qarşısını alır. Müxtəlif bitkilər, çiçək zolaqları və hasarlar əkmək quşları, arıları və vacib vəhşi tozlayıcıları qoruyur." } }; return o; })(),
      (() => { const o = { title: { en: "Climate Resilience", az: "İqlim Davamlılığı" }, description: { en: "Ecosystem-driven farms hold 20% more moisture, preventing drought damage and erosion. This protects local food security as weather patterns shift.", az: "Ekosistem əsaslı təsərrüfatlar 20% daha çox nəm saxlayır, quraqlıq zərərini və eroziyanın qarşısını alır. Bu, hava nümunələri dəyişdikcə yerli qida təhlükəsizliyini qoruyur." } }; return o; })(),
      (() => { const o = { title: { en: "Climate Metrics", az: "İqlim Metrikləri" }, description: { en: "Every purchase request updates carbon reduction logs and supporter levels. Discover complete details in our analytics room.", az: "Hər bir alış sorğusu karbon azaltma qeydlərini və dəstəkçi səviyyələrini yeniləyir. Analitika otağımızda tam təfərrüatları kəşf edin." } }; return o; })(),
    ],
    howItWorksTag: b64default(initialHomePage?.howItWorksTag, "Sourcing Cycle", "Tədarük Dövrü"),
    howItWorksTitle: b64default(initialHomePage?.howItWorksTitle, "Direct Request, Zero Waste Lifecycle", "Birbaşa Sifariş, Sıfır Tullantı Həyat Dövrü"),
    howItWorksSub: b64default(initialHomePage?.howItWorksSub, "Understand our request-based loop. By cutting out standard commercial store packaging, middlemen logistics, and storage, we minimize agricultural waste.", "Sorğu əsaslı dövrümüzü anlayın. Standart kommersiya mağaza qablaşdırmasını, vasitəçi logistikasını və anbarı aradan qaldıraraq kənd təsərrüfatı tullantılarını minimuma endiririk."),
    steps: Array.isArray(initialHomePage?.steps) ? initialHomePage.steps.map(s => bilingualify(s, ["title", "description"])) : [
      (() => { const o = { title: { en: "Submit Request", az: "Sorğu Göndər" }, description: { en: "Select a local farmer below and request specific products. No payment or cart is involved.", az: "Aşağıdan bir yerli fermer seçin və xüsusi məhsullar sifariş edin. Heç bir ödəniş və ya səbət daxil deyil." } }; return o; })(),
      (() => { const o = { title: { en: "Farmer Receives Request", az: "Fermer Sorğunu Alır" }, description: { en: "The farmer receives your request directly and contacts you to organize logistics.", az: "Fermer sorğunuzu birbaşa alır və logistikanı təşkil etmək üçün sizinlə əlaqə saxlayır." } }; return o; })(),
      (() => { const o = { title: { en: "Local Agriculture Supported", az: "Yerli Kənd Təsərrüfatı Dəstəkləndi" }, description: { en: "By purchasing directly, farmers earn fair wages without paying retail distribution fees.", az: "Birbaşa satın almaqla, fermerlər pərakəndə paylama haqları ödəmədən ədalətli əmək haqqı qazanırlar." } }; return o; })(),
      (() => { const o = { title: { en: "Climate Impact Increases", az: "İqlim Təsiri Artır" }, description: { en: "Your request earns impact points, increases your supporter level, and slashes global food miles.", az: "Sorğunuz təsir xalları qazanır, dəstəkçi səviyyənizi artırır və qlobal qida millərini azaldır." } }; return o; })(),
    ]
  });
  const [dashboardForm, setDashboardForm] = useState({
    headerTag: b64default(initialDashboardPage?.headerTag, "Live Climate Room", "Canlı İqlim Otağı"),
    headerTitle: b64default(initialDashboardPage?.headerTitle, "Climate Impact Dashboard", "İqlim Təsir Paneli"),
    headerSub: b64default(initialDashboardPage?.headerSub, "Support a local farmer and increase your impact score.", "Yerli bir fermeri dəstəkləyin və təsir xalınızı artırın."),
    levels: Array.isArray(initialDashboardPage?.levels) ? initialDashboardPage.levels.map(l => bilingualify(l, ["name", "desc"])) : [
      (() => { const o = { name: { en: "Seed Supporter", az: "Toxum Dəstəkçisi" }, points: 0, emoji: "🌱", desc: { en: "You have started planting the seeds of change by requesting local crops.", az: "Yerli məhsullar sifariş etməklə dəyişiklik toxumlarını əkməyə başladınız." } }; return o; })(),
      (() => { const o = { name: { en: "Green Supporter", az: "Yaşıl Dəstəkçi" }, points: 50, emoji: "🌿", desc: { en: "Active soil supporter. You help farmers restore chemical-free organic land.", az: "Aktiv torpaq dəstəkçisi. Fermerlərə kimyəvi maddələrdən azad üzvi torpaqları bərpa etməyə kömək edirsiniz." } }; return o; })(),
      (() => { const o = { name: { en: "Climate Friend", az: "İqlim Dostu" }, points: 150, emoji: "🌎", desc: { en: "Your choices have slashed significant global transport carbon emissions.", az: "Seçimləriniz qlobal nəqliyyat karbon emissiyalarını əhəmiyyətli dərəcədə azaldıb." } }; return o; })(),
      (() => { const o = { name: { en: "Climate Champion", az: "İqlim Çempionu" }, points: 350, emoji: "🏆", desc: { en: "Regenerative champion! Your consistent direct requests protect local biodiversity.", az: "Regenerativ çempion! Ardıcıl birbaşa sorğularınız yerli biomüxtəlifliyi qoruyur." } }; return o; })(),
      (() => { const o = { name: { en: "Earth Guardian", az: "Yer Qəyyumu" }, points: 600, emoji: "🌳", desc: { en: "True environmental guardian. You lead the transition to localized agricultural resilience.", az: "Həqiqi ətraf mühit qəyyumu. Yerli kənd təsərrüfatı davamlılığına keçidə rəhbərlik edirsiniz." } }; return o; })(),
    ],
    supporterStatusLabel: b64default(initialDashboardPage?.supporterStatusLabel, "Your Supporter Status", "Dəstəkçi Statusunuz"),
    progressLabel: b64default(initialDashboardPage?.progressLabel, "Progress to", "İrəliləyiş"),
    productsRequestedLabel: b64default(initialDashboardPage?.productsRequestedLabel, "Products Requested", "Sifariş Edilən Məhsullar"),
    farmersSupportedLabel: b64default(initialDashboardPage?.farmersSupportedLabel, "Farmers Supported", "Dəstəklənən Fermerlər"),
    carbonSavedLabel: b64default(initialDashboardPage?.carbonSavedLabel, "Carbon Saved", "Qənaət Edilən Karbon"),
    maxLevelLabel: b64default(initialDashboardPage?.maxLevelLabel, "Max level achieved", "Maksimum səviyyə əldə edildi"),
    pointsLabel: b64default(initialDashboardPage?.pointsLabel, "Points", "Xallar"),
    unlockLabel: b64default(initialDashboardPage?.unlockLabel, "Request more local products to unlock", "Açmaq üçün daha çox yerli məhsul sifariş edin"),
    eachItemLabel: b64default(initialDashboardPage?.eachItemLabel, "status. Each item earns points!", "status. Hər bir məhsul xal qazandırır!"),
    supporterTierLabel: b64default(initialDashboardPage?.supporterTierLabel, "Supporter Tiers", "Dəstəkçi Səviyyələri"),
    ptsSuffix: b64default(initialDashboardPage?.ptsSuffix, "+ pts", "+ xal"),
    activeStatusLabel: b64default(initialDashboardPage?.activeStatusLabel, "Active Status", "Aktiv Status"),
    topProductsTitle: b64default(initialDashboardPage?.topProductsTitle, "Top Sourced Products", "Ən Çox Sifariş Edilən Məhsullar"),
    topProductsSub: b64default(initialDashboardPage?.topProductsSub, "Quantity of requests by item type", "Məhsul növünə görə sorğu sayı"),
    impactFormulaTitle: b64default(initialDashboardPage?.impactFormulaTitle, "Estimated Carbon Reduction Metric", "Təxmini Karbon Azaltma Metriki"),
    impactFormulaText: b64default(initialDashboardPage?.impactFormulaText, "Each food request localizes supply chains. We assume each impact point averages 0.002 tonnes (or 2 kg) of greenhouse gas emissions avoided by bypassing shipping imports and refrigeration chains.", "Hər bir qida sorğusu təchizat zəncirlərini yerləşdirir. Hər bir təsir xalının orta hesabla 0,002 ton (və ya 2 kq) istixana qazı emissiyasının qarşısını aldığını qəbul edirik."),
    calculatedOffsetLabel: b64default(initialDashboardPage?.calculatedOffsetLabel, "Calculated Offset", "Hesablanmış Tənzimləmə"),
    totalSavingsLabel: b64default(initialDashboardPage?.totalSavingsLabel, "Total Greenhouse Savings", "Ümumi İstixana Qazı Qənaəti"),
    tonnesLabel: b64default(initialDashboardPage?.tonnesLabel, "Tonnes CO2", "Ton CO2"),
    treesMatchLabel: b64default(initialDashboardPage?.treesMatchLabel, "Matches {trees} mature trees absorbing carbon for a year", "{trees} yetkin ağacın bir il ərzində udduğu karbona bərabərdir"),
    researchLinkTitle: b64default(initialDashboardPage?.researchLinkTitle, "Research & Insights", "Tədqiqat və Məlumatlar"),
    researchLinkSub: b64default(initialDashboardPage?.researchLinkSub, "Explore published datasets, charts, and climate analytics tracking our environmental impact and regenerative agriculture metrics.", "Ətraf mühit təsirimizi və regenerativ kənd təsərrüfatı göstəricilərini izləyən nəşr olunmuş məlumat dəstlərini, qrafikləri və iqlim analitikasını kəşf edin."),
    impactPointsLabel: b64default(initialDashboardPage?.impactPointsLabel, "Impact Points", "Təsir Xalı"),
    requestsSavedLabel: b64default(initialDashboardPage?.requestsSavedLabel, "Requests Saved", "Qeydə Alınan Sorğular"),
    activeFarmersLabel: b64default(initialDashboardPage?.activeFarmersLabel, "Active Farmers", "Aktiv Fermerlər"),
    co2ReducedLabel: b64default(initialDashboardPage?.co2ReducedLabel, "Est. CO2 Reduced", "Təx. CO2 Azaldılması")
  });

  const [listingForm, setListingForm] = useState({
    id: "", name: toBilingual(""), description: toBilingual(""), farmerName: "", farmerPhone: "",
    location: "", availableWeight: "", qualityDesc: "", impactPoints: 5,
    sustainability: "", photoMain: "/images/placeholder-veg.jpg", photos: "[]", status: "Active"
  });

  // UI edit modes
  const [isFarmerEditing, setIsFarmerEditing] = useState(false);
  const [isArticleEditing, setIsArticleEditing] = useState(false);
  const [isListingEditing, setIsListingEditing] = useState(false);
  
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
  };

  const handleLogout = async () => {
    await adminLogout();
    router.push(`/${ADMIN_PATH}`);
    router.refresh();
  };

  // 1. STATS / OFFSETS HANDLERS
  const handleOffsetChange = (key, val) => {
    setSettings({ ...settings, [key]: val });
  };

  const handleSaveOffsets = async (e) => {
    e.preventDefault();
    try {
      await updateSetting("total_impact_points", settings.total_impact_points);
      await updateSetting("farmers_featured", settings.farmers_featured);
      await updateSetting("purchase_requests", settings.purchase_requests);
      await updateSetting("estimated_climate_impact", settings.estimated_climate_impact);
      await updateSetting("survey_link", settings.survey_link);
      showFeedback("success", t("admin.feedbackCountersUpdated"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackCountersFailed"));
    }
  };

  // 2. REQUESTS HANDLERS
  const handleToggleRequestStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Pending" ? "Approved" : "Pending";
    try {
      await updateRequestStatus(id, nextStatus);
      setRequests(requests.map(r => r.id === id ? { ...r, status: nextStatus } : r));
      showFeedback("success", t("admin.feedbackRequestMarked", { status: nextStatus }));
    } catch (e) {
      showFeedback("error", t("admin.feedbackRequestUpdateFailed"));
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!confirm(t("admin.confirmDeleteRequest"))) return;
    try {
      await deleteRequest(id);
      setRequests(requests.filter(r => r.id !== id));
      showFeedback("success", t("admin.feedbackRequestDeleted"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackRequestDeleteFailed"));
    }
  };

  // 3. FARMERS HANDLERS
  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    const submission = {
      ...farmerForm,
      story: typeof farmerForm.story === "object" ? JSON.stringify(farmerForm.story) : farmerForm.story,
      practices: typeof farmerForm.practices === "object" ? JSON.stringify(farmerForm.practices) : farmerForm.practices
    };
    try {
      if (farmerForm.id) {
        const updated = await updateFarmer(farmerForm.id, submission);
        setFarmers(farmers.map(f => f.id === farmerForm.id ? updated : f));
        showFeedback("success", t("admin.feedbackFarmerUpdated"));
      } else {
        const created = await createFarmer(submission);
        setFarmers([created, ...farmers]);
        showFeedback("success", t("admin.feedbackFarmerAdded"));
      }
      setFarmerForm({ id: "", name: "", region: "", products: "", story: toBilingual(""), practices: toBilingual(""), photoUrl: "", phone: "" });
      setIsFarmerEditing(false);
    } catch (e) {
      showFeedback("error", t("admin.feedbackFarmerSaveFailed"));
    }
  };

  const handleEditFarmerClick = (farmer) => {
    setFarmerForm({
      ...farmer,
      story: parseBilingualField(farmer.story),
      practices: parseBilingualField(farmer.practices)
    });
    setIsFarmerEditing(true);
  };

  const handleDeleteFarmer = async (id) => {
    if (!confirm(t("admin.confirmDeleteFarmer"))) return;
    try {
      await deleteFarmer(id);
      setFarmers(farmers.filter(f => f.id !== id));
      showFeedback("success", t("admin.feedbackFarmerDeleted"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackFarmerDeleteFailed"));
    }
  };

  // 4. ARTICLES HANDLERS
  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    const submission = {
      ...articleForm,
      title: typeof articleForm.title === "object" ? JSON.stringify(articleForm.title) : articleForm.title,
      summary: typeof articleForm.summary === "object" ? JSON.stringify(articleForm.summary) : articleForm.summary,
      content: typeof articleForm.content === "object" ? JSON.stringify(articleForm.content) : articleForm.content
    };
    try {
      if (articleForm.id) {
        const updated = await updateArticle(articleForm.id, submission);
        setArticles(articles.map(a => a.id === articleForm.id ? updated : a));
        showFeedback("success", t("admin.feedbackArticleUpdated"));
      } else {
        const created = await createArticle(submission);
        setArticles([created, ...articles]);
        showFeedback("success", t("admin.feedbackArticlePublished"));
      }
      setArticleForm({ id: "", title: toBilingual(""), summary: toBilingual(""), content: toBilingual(""), imageUrl: "" });
      setIsArticleEditing(false);
    } catch (e) {
      showFeedback("error", t("admin.feedbackArticleSaveFailed"));
    }
  };

  const handleEditArticleClick = (art) => {
    setArticleForm({
      ...art,
      title: parseBilingualField(art.title),
      summary: parseBilingualField(art.summary),
      content: parseBilingualField(art.content)
    });
    setIsArticleEditing(true);
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm(t("admin.confirmDeleteArticle"))) return;
    try {
      await deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
      showFeedback("success", t("admin.feedbackArticleDeleted"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackArticleDeleteFailed"));
    }
  };

  // External Articles State
  const [externalArticles, setExternalArticles] = useState([]);
  const [extArticleForm, setExtArticleForm] = useState({ id: "", title: "", url: "", description: "", imageUrl: "" });
  const [isExtArticleEditing, setIsExtArticleEditing] = useState(false);

  useEffect(() => {
    getPageContent("external_articles").then(data => {
      if (data && Array.isArray(data.articles)) setExternalArticles(data.articles);
    }).catch(() => {});
  }, []);

  const handleExtArticleSubmit = async (e) => {
    e.preventDefault();
    let updated;
    if (extArticleForm.id) {
      updated = externalArticles.map(a => a.id === extArticleForm.id ? { ...a, title: typeof extArticleForm.title === "object" ? JSON.stringify(extArticleForm.title) : extArticleForm.title, url: extArticleForm.url, description: typeof extArticleForm.description === "object" ? JSON.stringify(extArticleForm.description) : extArticleForm.description, imageUrl: extArticleForm.imageUrl } : a);
    } else {
      const newArt = { id: Date.now().toString(), title: typeof extArticleForm.title === "object" ? JSON.stringify(extArticleForm.title) : extArticleForm.title, url: extArticleForm.url, description: typeof extArticleForm.description === "object" ? JSON.stringify(extArticleForm.description) : extArticleForm.description, imageUrl: extArticleForm.imageUrl };
      updated = [...externalArticles, newArt];
    }
    try {
      await updatePageContent("external_articles", { articles: updated });
      setExternalArticles(updated);
      setExtArticleForm({ id: "", title: "", url: "", description: "", imageUrl: "" });
      setIsExtArticleEditing(false);
      showFeedback("success", t("admin.feedbackExtArticleSaved"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackExtArticleSaveFailed"));
    }
  };

  const handleEditExtArticle = (art) => {
    setExtArticleForm({
      ...art,
      title: parseBilingualField(art.title),
      description: parseBilingualField(art.description)
    });
    setIsExtArticleEditing(true);
  };

  const handleDeleteExtArticle = async (id) => {
    if (!confirm(t("admin.confirmDeleteExtArticle"))) return;
    const updated = externalArticles.filter(a => a.id !== id);
    try {
      await updatePageContent("external_articles", { articles: updated });
      setExternalArticles(updated);
      showFeedback("success", t("admin.feedbackExtArticleDeleted"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackExtArticleDeleteFailed"));
    }
  };

  // 5. IMPACT MAP HANDLERS
  const handleImpactMapSubmit = async (e) => {
    e.preventDefault();
    if (!impactForm.product.trim()) return;
    try {
      const updated = await upsertImpactMap(impactForm.product.trim(), impactForm.points);
      const idx = impactMaps.findIndex(m => m.product.toLowerCase() === updated.product.toLowerCase());
      if (idx === -1) {
        setImpactMaps([...impactMaps, updated]);
      } else {
        setImpactMaps(impactMaps.map(m => m.product.toLowerCase() === updated.product.toLowerCase() ? updated : m));
      }
      setImpactForm({ product: "", points: 5 });
      showFeedback("success", t("admin.feedbackImpactSaved"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackImpactSaveFailed"));
    }
  };

  const handleDeleteImpactMap = async (product) => {
    if (!confirm(t("admin.confirmRemoveImpact", { product }))) return;
    try {
      await deleteImpactMap(product);
      setImpactMaps(impactMaps.filter(m => m.product !== product));
      showFeedback("success", t("admin.feedbackImpactDeleted"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackImpactDeleteFailed"));
    }
  };

  // 6. LISTING HANDLERS
  const handleListingSubmit = async (e) => {
    e.preventDefault();
    const submission = {
      ...listingForm,
      name: typeof listingForm.name === "object" ? JSON.stringify(listingForm.name) : listingForm.name,
      description: typeof listingForm.description === "object" ? JSON.stringify(listingForm.description) : listingForm.description,
      qualityDesc: typeof listingForm.qualityDesc === "object" ? JSON.stringify(listingForm.qualityDesc) : listingForm.qualityDesc,
      sustainability: typeof listingForm.sustainability === "object" ? JSON.stringify(listingForm.sustainability) : listingForm.sustainability
    };
    try {
      if (listingForm.id) {
        const updated = await updateListing(listingForm.id, submission);
        setListings(listings.map(l => l.id === listingForm.id ? updated : l));
        showFeedback("success", t("admin.feedbackListingUpdated"));
      } else {
        const created = await createListing(submission);
        setListings([created, ...listings]);
        showFeedback("success", t("admin.feedbackListingCreated"));
      }
      setListingForm({ id: "", name: toBilingual(""), description: toBilingual(""), farmerName: "", farmerPhone: "", location: "", availableWeight: "", qualityDesc: "", impactPoints: 5, sustainability: "", question1: { question: { en: "", az: "" }, options: emptyOptions() }, question2: { question: { en: "", az: "" }, options: emptyOptions() }, photoMain: "/images/placeholder-veg.jpg", photos: "[]", status: "Active" });
      setIsListingEditing(false);
    } catch (e) {
      showFeedback("error", t("admin.feedbackListingSaveFailed"));
    }
  };

  const handleEditListing = (listing) => {
    setListingForm({
      ...listing,
      name: parseBilingualField(listing.name),
      description: parseBilingualField(listing.description),
      qualityDesc: parseBilingualField(listing.qualityDesc),
      sustainability: parseBilingualField(listing.sustainability),
      question1: parseQuestionField(listing.question1),
      question2: parseQuestionField(listing.question2)
    });
    setIsListingEditing(true);
  };

  const handleDeleteListing = async (id) => {
    if (!confirm(t("admin.confirmDeleteListing"))) return;
    try {
      await deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
      showFeedback("success", t("admin.feedbackListingDeleted"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackListingDeleteFailed"));
    }
  };

  const handleViewAnswers = async (listing) => {
    setViewingAnswers(listing);
    setAnswersLoading(true);
    const data = await getListingAnswers(listing.id);
    setAnswersData(data);
    setAnswersLoading(false);
  };

  // 7. PAGE TEXT CONTENT HANDLERS
  const handleSavePageContent = async (key, dataObj) => {
    try {
      await updatePageContent(key, dataObj);
      showFeedback("success", t("admin.feedbackPageContentsUpdated"));
    } catch (e) {
      showFeedback("error", t("admin.feedbackPageContentsFailed"));
    }
  };

  const handleMissionSectionChange = (idx, field, value) => {
    const updatedSecs = [...missionForm.sections];
    updatedSecs[idx] = { ...updatedSecs[idx], [field]: value };
    setMissionForm({ ...missionForm, sections: updatedSecs });
  };

  const handleWhyLocalSectionChange = (idx, field, value) => {
    const updatedSecs = [...whyLocalForm.sections];
    updatedSecs[idx] = { ...updatedSecs[idx], [field]: value };
    setWhyLocalForm({ ...whyLocalForm, sections: updatedSecs });
  };

  const handleResearchStatChange = (idx, field, value) => {
    const updatedStats = [...researchForm.stats];
    updatedStats[idx] = { ...updatedStats[idx], [field]: value };
    setResearchForm({ ...researchForm, stats: updatedStats });
  };

  const handleHomeField = (field, value) => {
    setHomeForm({ ...homeForm, [field]: value });
  };

  const handleHomeMissionCard = (idx, field, value) => {
    const cards = [...homeForm.missionCards];
    cards[idx] = { ...cards[idx], [field]: value };
    setHomeForm({ ...homeForm, missionCards: cards });
  };

  const handleHomeStep = (idx, field, value) => {
    const steps = [...homeForm.steps];
    steps[idx] = { ...steps[idx], [field]: value };
    setHomeForm({ ...homeForm, steps: steps });
  };

  const handleDashboardField = (field, value) => {
    setDashboardForm({ ...dashboardForm, [field]: value });
  };

  const handleDashboardLevel = (idx, field, value) => {
    const levels = [...dashboardForm.levels];
    levels[idx] = { ...levels[idx], [field]: value };
    setDashboardForm({ ...dashboardForm, levels: levels });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-950/10 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950 font-bold">
            {t("admin.console")}
          </h1>
          <p className="text-xs text-emerald-950/50 mt-1">
            {t("admin.configDesc")}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("admin.logout")}
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div className={`p-4 rounded-2xl mb-6 flex items-center gap-2 text-sm font-semibold border ${
          feedback.type === "success" 
            ? "bg-emerald-50 border-emerald-150 text-emerald-800" 
            : "bg-red-50 border-red-150 text-red-700"
        }`}>
          {feedback.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {feedback.message}
        </div>
      )}

      {/* Layout Grid: Left Tabs Sidebar, Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 flex flex-col gap-1.5">
          {[
            { id: "requests", label: t("admin.tabRequests"), icon: <FileText className="w-4 h-4" /> },
            { id: "farmers", label: t("admin.tabFarmers"), icon: <Users className="w-4 h-4" /> },
            { id: "articles", label: t("admin.tabArticles"), icon: <FileEdit className="w-4 h-4" /> },
            { id: "settings", label: t("admin.tabSettings"), icon: <Settings className="w-4 h-4" /> },
            { id: "impact", label: t("admin.tabImpact"), icon: <Map className="w-4 h-4" /> },
            { id: "pages", label: t("admin.tabPages"), icon: <FileEdit className="w-4 h-4" /> },
            { id: "listings", label: t("admin.tabListings"), icon: <Store className="w-4 h-4" /> },
            { id: "research", label: t("admin.tabResearch"), icon: <BarChart3 className="w-4 h-4" /> },
            { id: "credits", label: t("admin.tabCredits"), icon: <Award className="w-4 h-4" /> },
            { id: "users", label: t("admin.tabUsers"), icon: <Users className="w-4 h-4" /> },
            { id: "faq", label: t("admin.tabFaq"), icon: <FileText className="w-4 h-4" /> },
            { id: "reviews", label: t("admin.tabReviews"), icon: <FileText className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsFarmerEditing(false);
                setIsArticleEditing(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "bg-white text-emerald-950/70 border border-emerald-950/5 hover:bg-emerald-900/5 hover:text-emerald-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-white border border-emerald-950/5 rounded-3xl p-6 md:p-8 shadow-sm">
          
          {/* TAB 1: REQUESTS MANAGER */}
          {activeTab === "requests" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("admin.requestsTitle")}</h2>
                <p className="text-xs text-emerald-950/50 mt-1">{t("admin.requestsDesc")}</p>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-12 text-emerald-950/40 font-light">{t("admin.requestsEmpty")}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-emerald-950/10 text-emerald-950/60 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="pb-3 pr-4">{t("admin.requestsConsumer")}</th>
                        <th className="pb-3 pr-4">{t("admin.requestsFarmer")}</th>
                        <th className="pb-3 pr-4">{t("admin.requestsProduct")}</th>
                        <th className="pb-3 pr-4">{t("admin.requestsPts")}</th>
                        <th className="pb-3 pr-4">{t("admin.requestsStatus")}</th>
                        <th className="pb-3 text-right">{t("admin.requestsActions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/5">
                      {requests.map((r) => (
                        <tr key={r.id} className="align-top">
                          <td className="py-4 pr-4">
                            <span className="font-semibold text-emerald-950 block">{r.customerName}</span>
                            <span className="text-xs text-emerald-950/50 block font-numeric">{r.email} • {r.phone}</span>
                          </td>
                          <td className="py-4 pr-4 text-emerald-900 font-medium">{r.farmerName}</td>
                          <td className="py-4 pr-4">
                            <span className="font-semibold">{r.product}</span>
                            <span className="text-xs text-emerald-950/50 block">{r.quantity} {t("admin.units")}</span>
                          </td>
                          <td className="py-4 pr-4 font-numeric font-bold">🌱{r.points}</td>
                          <td className="py-4 pr-4">
                            <button
                              onClick={() => handleToggleRequestStatus(r.id, r.status)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                r.status === "Approved"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-amber-100 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {r.status}
                            </button>
                          </td>
                          <td className="py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => handleDeleteRequest(r.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t("admin.deleteRequest")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FARMERS DIRECTORY */}
          {activeTab === "farmers" && (
            <div className="flex flex-col gap-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("admin.farmersTitle")}</h2>
                  <p className="text-xs text-emerald-950/50 mt-1">{t("admin.farmersDesc")}</p>
                </div>
                {!isFarmerEditing && (
                  <button
                    onClick={() => {
                      setFarmerForm({ id: "", name: "", region: "", products: "", story: toBilingual(""), practices: toBilingual(""), photoUrl: "", phone: "" });
                      setIsFarmerEditing(true);
                    }}
                    className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> {t("admin.addFarmer")}
                  </button>
                )}
              </div>

              {isFarmerEditing ? (
                <form onSubmit={handleFarmerSubmit} className="flex flex-col gap-4 bg-[#fcfbfa] border border-emerald-950/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-serif font-bold text-emerald-950">
                    {farmerForm.id ? t("admin.editFarmer") : t("admin.registerFarmer")}
                  </h3>
                  
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.farmerName")}</label>
                    <input
                      type="text"
                      value={farmerForm.name}
                      onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                      className="w-full p-2.5 bg-white border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                      required
                    />
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.farmerRegion")}</label>
                    <input
                      type="text"
                      placeholder={t("admin.farmerRegionPlaceholder")}
                      value={farmerForm.region}
                      onChange={(e) => setFarmerForm({ ...farmerForm, region: e.target.value })}
                      className="w-full p-2.5 bg-white border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.farmerPhoneLabel")}</label>
                    <input
                      type="text"
                      placeholder={t("admin.farmerPhonePlaceholder")}
                      value={farmerForm.phone}
                      onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                      className="w-full p-2.5 bg-white border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                    />
                  </div>

                  {/* Products */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.farmerProducts")}</label>
                    <input
                      type="text"
                      placeholder={t("admin.farmerProductsPlaceholder")}
                      value={farmerForm.products}
                      onChange={(e) => setFarmerForm({ ...farmerForm, products: e.target.value })}
                      className="w-full p-2.5 bg-white border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                      required
                    />
                  </div>

                  {/* Image with upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.farmerPhoto")}</label>
                    {farmerForm.photoUrl && (
                      <img src={farmerForm.photoUrl} alt={t("admin.farmerAlt")} className="w-20 h-20 object-cover rounded-xl mb-2 border" />
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t("admin.farmerPhotoPlaceholder")}
                        value={farmerForm.photoUrl}
                        onChange={(e) => setFarmerForm({ ...farmerForm, photoUrl: e.target.value })}
                        className="flex-1 p-2.5 bg-white border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                        required
                      />
                        <label className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-semibold uppercase cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap">
                          <Upload className="w-3 h-3" /> {t("admin.upload")}
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData });
                              const data = await res.json();
                              if (data.success) {
                                setFarmerForm({ ...farmerForm, photoUrl: data.url });
                                showFeedback("success", t("admin.feedbackImageUploaded"));
                              } else {
                                showFeedback("error", data.error || t("admin.feedbackUploadFailed"));
                              }
                            } catch (err) { showFeedback("error", t("admin.feedbackUploadFailed")); console.error(err); }
                          }} />
                        </label>
                    </div>
                  </div>

                  <BilingualField label={t("admin.farmerStory")} value={farmerForm.story} onChange={(v) => setFarmerForm({ ...farmerForm, story: v })} type="textarea" rows={3} />
                  <BilingualField label={t("admin.farmerPractices")} value={farmerForm.practices} onChange={(v) => setFarmerForm({ ...farmerForm, practices: v })} type="textarea" rows={2} />

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsFarmerEditing(false)}
                      className="flex-1 py-2.5 border border-emerald-950/15 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-950"
                    >
                      {t("admin.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-850"
                    >
                      {t("admin.saveProfile")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {farmers.map(f => (
                    <div key={f.id} className="p-5 border border-emerald-950/5 rounded-2xl flex flex-col justify-between bg-[#fcfbfa]">
                      <div>
                        <div className="flex gap-3 items-center mb-3">
                          <img src={f.photoUrl} alt={f.name} className="w-12 h-12 object-cover rounded-xl border border-emerald-900/10" />
                          <div>
                            <h4 className="font-semibold text-emerald-950 leading-none">{f.name}</h4>
                            <span className="text-[10px] text-emerald-950/50 font-bold uppercase mt-1 block">{f.region}</span>
                            {f.phone && <span className="text-[10px] text-emerald-600 mt-0.5 block">{f.phone}</span>}
                          </div>
                        </div>
                        <p className="text-xs text-emerald-950/70 line-clamp-2 italic mb-2">"{loc(f.story)}"</p>
                        <p className="text-xs text-green-700 font-semibold mb-3">🌾 {t("admin.crops")}: {f.products}</p>
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t border-emerald-950/5">
                        <button
                          onClick={() => handleEditFarmerClick(f)}
                          className="flex-1 py-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> {t("admin.edit")}
                        </button>
                        <button
                          onClick={() => handleDeleteFarmer(f.id)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> {t("admin.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARTICLES & BLOG */}
          {activeTab === "articles" && (
            <div className="flex flex-col gap-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("admin.articlesTitle")}</h2>
                  <p className="text-xs text-emerald-950/50 mt-1">{t("admin.articlesDesc")}</p>
                </div>
                  {!isArticleEditing && (
                    <button
                      onClick={() => {
                        setArticleForm({ id: "", title: toBilingual(""), summary: toBilingual(""), content: toBilingual(""), imageUrl: "" });
                        setIsArticleEditing(true);
                      }}
                      className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> {t("admin.createArticle")}
                    </button>
                  )}
              </div>

              {isArticleEditing ? (
                <form onSubmit={handleArticleSubmit} className="flex flex-col gap-4 bg-[#fcfbfa] border border-emerald-950/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-serif font-bold text-emerald-950">
                    {articleForm.id ? t("admin.editArticle") : t("admin.writeArticle")}
                  </h3>
                  
                  <BilingualField label={t("admin.articleTitle")} value={articleForm.title} onChange={(v) => setArticleForm({ ...articleForm, title: v })} />
                  <BilingualField label={t("admin.articleSummary")} value={articleForm.summary} onChange={(v) => setArticleForm({ ...articleForm, summary: v })} />

                  {/* Cover image */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.articleImage")}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t("admin.articleImagePlaceholder")}
                        value={articleForm.imageUrl}
                        onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                        className="flex-1 p-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                        required
                      />
                      <label className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-semibold uppercase cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap">
                        <Upload className="w-3 h-3" /> {t("admin.upload")}
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.success) {
                              setArticleForm({ ...articleForm, imageUrl: data.url });
                              showFeedback("success", t("admin.feedbackImageUploaded"));
                            } else {
                              showFeedback("error", data.error || t("admin.feedbackUploadFailed"));
                            }
                          } catch (err) { showFeedback("error", t("admin.feedbackUploadFailed")); console.error(err); }
                        }} />
                      </label>
                    </div>
                  </div>

                  <BilingualField label={t("admin.articleContent")} value={articleForm.content} onChange={(v) => setArticleForm({ ...articleForm, content: v })} type="textarea" rows={10} />

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsArticleEditing(false)}
                      className="flex-1 py-2.5 border border-emerald-950/15 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-950"
                    >
                      {t("admin.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-850"
                    >
                      {t("admin.publishArticle")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  {articles.map(art => (
                    <div key={art.id} className="p-4 border border-emerald-950/5 rounded-2xl flex items-center justify-between gap-4 bg-[#fcfbfa]">
                      <div className="flex items-center gap-3">
                        <img src={art.imageUrl} alt={loc(art.title)} className="w-16 h-12 object-cover rounded-lg border" />
                        <div>
                          <h4 className="font-semibold text-emerald-950 line-clamp-1">{loc(art.title)}</h4>
                          <p className="text-xs text-emerald-955/50 line-clamp-1 mt-0.5">{loc(art.summary)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditArticleClick(art)}
                          className="p-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-lg text-xs font-bold"
                          title={t("admin.edit")}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold"
                          title={t("admin.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* External Articles Section */}
              <div className="border-t border-emerald-950/10 pt-8 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.externalArticles")}</h3>
                    <p className="text-xs text-emerald-950/50 mt-1">{t("admin.externalArticlesDesc")}</p>
                  </div>
                  {!isExtArticleEditing && (
                    <button
                      onClick={() => {
                        setExtArticleForm({ id: "", title: "", url: "", description: "", imageUrl: "" });
                        setIsExtArticleEditing(true);
                      }}
                      className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> {t("admin.addExternalArticle")}
                    </button>
                  )}
                </div>

                {isExtArticleEditing ? (
                  <form onSubmit={handleExtArticleSubmit} className="flex flex-col gap-4 bg-[#fcfbfa] border border-emerald-950/5 p-6 rounded-2xl">
                    <h4 className="text-lg font-serif font-bold text-emerald-950">
                      {extArticleForm.id ? t("admin.editExternalArticle") : t("admin.addExternalArticle")}
                    </h4>
                    <BilingualField label={t("admin.articleTitle")} value={extArticleForm.title} onChange={(v) => setExtArticleForm({ ...extArticleForm, title: v })} />
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.externalUrl")}</label>
                      <input type="url" placeholder={t("admin.externalUrlPlaceholder")} value={extArticleForm.url} onChange={(e) => setExtArticleForm({ ...extArticleForm, url: e.target.value })} className="w-full p-2.5 bg-white border border-emerald-955/15 rounded-xl text-sm" required />
                    </div>
                    <BilingualField label={t("admin.articleSummary")} value={extArticleForm.description} onChange={(v) => setExtArticleForm({ ...extArticleForm, description: v })} type="textarea" rows={3} />
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.thumbnailImage")}</label>
                      {extArticleForm.imageUrl && (
                        <img src={extArticleForm.imageUrl} alt={t("admin.preview")} className="w-24 h-16 object-cover rounded-xl mb-2 border" />
                      )}
                      <div className="flex gap-2">
                        <input type="text" placeholder={t("admin.thumbnailPlaceholder")} value={extArticleForm.imageUrl || ""} onChange={(e) => setExtArticleForm({ ...extArticleForm, imageUrl: e.target.value })} className="flex-1 p-2.5 bg-white border border-emerald-955/15 rounded-xl text-sm" />
                        <label className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-semibold uppercase cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap">
                          <Upload className="w-3 h-3" /> {t("admin.upload")}
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData });
                              const data = await res.json();
                              if (data.success) {
                                setExtArticleForm({ ...extArticleForm, imageUrl: data.url });
                                showFeedback("success", t("admin.feedbackImageUploaded"));
                              } else {
                                showFeedback("error", data.error || t("admin.feedbackUploadFailed"));
                              }
                            } catch (err) { showFeedback("error", t("admin.feedbackUploadFailed")); console.error(err); }
                          }} />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button type="button" onClick={() => setIsExtArticleEditing(false)} className="flex-1 py-2.5 border border-emerald-950/15 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-950">{t("admin.cancel")}</button>
                      <button type="submit" className="flex-1 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-850">{t("admin.saveExternalArticle")}</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3">
                    {externalArticles.length === 0 ? (
                      <p className="text-sm text-emerald-950/40 py-4 text-center">{t("admin.noExternalArticles")}</p>
                    ) : (
                      externalArticles.map(art => (
                        <div key={art.id} className="p-4 border border-emerald-950/5 rounded-2xl flex items-center justify-between gap-4 bg-[#fcfbfa]">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {art.imageUrl && (
                              <img src={art.imageUrl} alt={loc(art.title)} className="w-14 h-14 object-cover rounded-xl shrink-0 border" />
                            )}
                            <div className="min-w-0">
                              <h4 className="font-semibold text-emerald-950 truncate">{loc(art.title)}</h4>
                              <p className="text-xs text-emerald-950/50 truncate mt-0.5">{art.url}</p>
                              <p className="text-xs text-emerald-950/70 line-clamp-2 mt-1">{loc(art.description)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleEditExtArticle(art)} className="p-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-lg text-xs font-bold" title={t("admin.edit")}><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteExtArticle(art.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold" title={t("admin.delete")}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HOMEPAGE OFFSETS */}
          {activeTab === "settings" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("admin.settingsTitle")}</h2>
                <p className="text-xs text-emerald-950/50 mt-1">{t("admin.settingsDesc")}</p>
              </div>

              <form onSubmit={handleSaveOffsets} className="flex flex-col gap-4">
                {/* Total Points */}
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.offsetTotalImpact")}</label>
                  <input
                    type="number"
                    value={settings.total_impact_points || "0"}
                    onChange={(e) => handleOffsetChange("total_impact_points", e.target.value)}
                    className="w-full p-2.5 bg-[#fcfbfa] border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                    required
                  />
                </div>

                {/* Farmers Featured */}
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.offsetFarmersFeatured")}</label>
                  <input
                    type="number"
                    value={settings.farmers_featured || "0"}
                    onChange={(e) => handleOffsetChange("farmers_featured", e.target.value)}
                    className="w-full p-2.5 bg-[#fcfbfa] border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                    required
                  />
                </div>

                {/* Requests submitted */}
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.offsetRequests")}</label>
                  <input
                    type="number"
                    value={settings.purchase_requests || "0"}
                    onChange={(e) => handleOffsetChange("purchase_requests", e.target.value)}
                    className="w-full p-2.5 bg-[#fcfbfa] border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                    required
                  />
                </div>

                {/* Estimated CO2 savings */}
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.offsetClimateImpact")}</label>
                  <input
                    type="text"
                    value={settings.estimated_climate_impact || "0.0"}
                    onChange={(e) => handleOffsetChange("estimated_climate_impact", e.target.value)}
                    className="w-full p-2.5 bg-[#fcfbfa] border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                    required
                  />
                </div>

                {/* Survey Link */}
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.offsetSurveyLink")}</label>
                  <input
                    type="url"
                    placeholder={t("admin.offsetSurveyPlaceholder")}
                    value={settings.survey_link || ""}
                    onChange={(e) => handleOffsetChange("survey_link", e.target.value)}
                    className="w-full p-2.5 bg-[#fcfbfa] border border-emerald-955/15 rounded-xl text-sm focus:outline-none focus:border-emerald-800"
                  />
                  <p className="text-[10px] text-emerald-950/40 mt-1">{t("admin.offsetSurveyHint")}</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-900 text-white rounded-xl text-sm font-semibold uppercase tracking-wider hover:bg-emerald-850 mt-2 transition-colors"
                >
                  {t("admin.saveSettings")}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: IMPACT POINT MAPPINGS */}
          {activeTab === "impact" && (
            <div className="flex flex-col gap-6">
              
              <div>
                <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("admin.impactTitle")}</h2>
                <p className="text-xs text-emerald-950/50 mt-1">{t("admin.impactDesc")}</p>
              </div>

              {/* Add/Edit mapping form */}
              <form onSubmit={handleImpactMapSubmit} className="flex gap-4 bg-[#fcfbfa] border p-4 rounded-xl items-end">
                <div className="flex-grow">
                  <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.impactProductName")}</label>
                  <input
                    type="text"
                    placeholder={t("admin.impactProductPlaceholder")}
                    value={impactForm.product}
                    onChange={(e) => setImpactForm({ ...impactForm, product: e.target.value })}
                    className="w-full p-2 bg-white border border-emerald-955/15 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.impactPoints")}</label>
                  <input
                    type="number"
                    value={impactForm.points}
                    onChange={(e) => setImpactForm({ ...impactForm, points: parseInt(e.target.value) || 5 })}
                    className="w-full p-2 bg-white border border-emerald-955/15 rounded-lg text-sm font-numeric text-center"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-850 h-9"
                >
                  {t("admin.save")}
                </button>
              </form>

              {/* Table list */}
              <div className="border border-emerald-950/5 rounded-2xl overflow-hidden bg-[#fcfbfa]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-emerald-900/5 text-emerald-950/60 border-b border-emerald-950/10 text-[11px] font-bold uppercase">
                      <th className="p-3 pl-4">{t("admin.impactProductName")}</th>
                      <th className="p-3 text-center">{t("admin.impactPointsAwarded")}</th>
                      <th className="p-3 text-right pr-4">{t("admin.requestsActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/5 text-emerald-950">
                    {impactMaps.map((map) => (
                      <tr key={map.product}>
                        <td className="p-3 pl-4 font-semibold">{map.product}</td>
                        <td className="p-3 text-center font-numeric font-bold text-emerald-900">🌱 {map.points} {t("admin.pts")}</td>
                        <td className="p-3 text-right pr-4 flex justify-end gap-2">
                          <button
                            onClick={() => setImpactForm({ product: map.product, points: map.points })}
                            className="p-1 text-emerald-800 hover:bg-emerald-50 rounded"
                            title={t("admin.edit")}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteImpactMap(map.product)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title={t("admin.delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: EDIT PAGES TEXTS */}
          {activeTab === "pages" && (
            <div className="flex flex-col gap-10">
              
              {/* Mission Page Section */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePageContent("mission_page", missionForm);
                }}
                className="flex flex-col gap-4 border-b border-emerald-950/10 pb-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.pageMission")}</h3>
                  <button type="submit" className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold uppercase">
                    {t("admin.saveMissionContent")}
                  </button>
                </div>
                <BilingualField
                  label={t("admin.heroTitle")}
                  value={missionForm.heroTitle}
                  onChange={(v) => setMissionForm({ ...missionForm, heroTitle: v })}
                />
                <BilingualField
                  label={t("admin.heroSubheading")}
                  value={missionForm.heroSub}
                  onChange={(v) => setMissionForm({ ...missionForm, heroSub: v })}
                  type="textarea"
                />

                {/* CEO Photo Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-955/50 mb-1">{t("admin.ceoPhoto")}</label>
                  {missionForm.ceoPhoto && (
                    <img src={missionForm.ceoPhoto} alt={t("admin.ceoAlt")} className="w-24 h-24 object-cover rounded-xl mb-2 border" />
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t("admin.ceoPhotoPlaceholder")}
                      value={missionForm.ceoPhoto || ""}
                      onChange={(e) => setMissionForm({ ...missionForm, ceoPhoto: e.target.value })}
                      className="flex-1 p-2 bg-[#fcfbfa] border border-emerald-955/15 rounded-lg text-sm"
                    />
                    <label className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-semibold uppercase cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap">
                      <Upload className="w-3 h-3" /> {t("admin.upload")}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.success) {
                            setMissionForm({ ...missionForm, ceoPhoto: data.url });
                            showFeedback("success", t("admin.feedbackImageUploaded"));
                          } else {
                            showFeedback("error", data.error || t("admin.feedbackUploadFailed"));
                          }
                        } catch (err) { showFeedback("error", t("admin.feedbackUploadFailed")); console.error(err); }
                      }} />
                    </label>
                  </div>
                </div>
                <BilingualField label={t("admin.ceoTitle")} value={missionForm.ceoTitle} onChange={(v) => setMissionForm({ ...missionForm, ceoTitle: v })} />
                <BilingualField label={t("admin.ceoName")} value={missionForm.ceoName} onChange={(v) => setMissionForm({ ...missionForm, ceoName: v })} />
                <BilingualField label={t("admin.ceoBio")} value={missionForm.ceoBio} onChange={(v) => setMissionForm({ ...missionForm, ceoBio: v })} type="textarea" />
                <BilingualField label={t("admin.ceoQuote")} value={missionForm.ceoQuote} onChange={(v) => setMissionForm({ ...missionForm, ceoQuote: v })} type="textarea" />

                {/* Photo Gallery Carousel */}
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-955/50 mb-1">{t("admin.missionPhotoGallery")}</label>
                  <p className="text-[10px] text-emerald-950/40 mb-2">{t("admin.missionGalleryDesc")}</p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {missionForm.photos.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => setMissionForm({ ...missionForm, photos: missionForm.photos.filter((_, i) => i !== idx) })}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://example.com/photo.jpg"
                      id="photoUrlInput"
                      className="flex-1 p-2 bg-[#fcfbfa] border border-emerald-955/15 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("photoUrlInput");
                        const url = input?.value?.trim();
                        if (!url) return;
                        setMissionForm({ ...missionForm, photos: [...missionForm.photos, url] });
                        if (input) input.value = "";
                      }}
                      className="px-3 py-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-lg text-xs font-semibold whitespace-nowrap"
                    >
                      + {t("admin.addPhotoUrl")}
                    </button>
                    <label className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-semibold uppercase cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap">
                      <Upload className="w-3 h-3" /> {t("admin.upload")}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.success) {
                            setMissionForm({ ...missionForm, photos: [...missionForm.photos, data.url] });
                            showFeedback("success", t("admin.feedbackImageUploaded"));
                          } else {
                            showFeedback("error", data.error || t("admin.feedbackUploadFailed"));
                          }
                        } catch (err) { showFeedback("error", t("admin.feedbackUploadFailed")); console.error(err); }
                      }} />
                    </label>
                  </div>
                </div>
                
                {/* Sections loop */}
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-xs font-bold text-emerald-950/40 uppercase">{t("admin.pillarCards")}</span>
                  {missionForm.sections.map((sec, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-[#fcfbfa]/50 flex flex-col gap-2">
                      <BilingualField
                        value={sec.title}
                        onChange={(v) => handleMissionSectionChange(idx, "title", v)}
                      />
                      <BilingualField
                        value={sec.description}
                        onChange={(v) => handleMissionSectionChange(idx, "description", v)}
                        type="textarea"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </form>

              {/* Why Local Page Section */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePageContent("why_local_page", whyLocalForm);
                }}
                className="flex flex-col gap-4 border-b border-emerald-950/10 pb-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.pageWhyLocal")}</h3>
                  <button type="submit" className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold uppercase">
                    {t("admin.saveWhyLocalContent")}
                  </button>
                </div>
                <BilingualField label={t("admin.heroTitle")} value={whyLocalForm.heroTitle} onChange={(v) => setWhyLocalForm({ ...whyLocalForm, heroTitle: v })} />
                <BilingualField label={t("admin.heroSubheading")} value={whyLocalForm.heroSub} onChange={(v) => setWhyLocalForm({ ...whyLocalForm, heroSub: v })} type="textarea" />

                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-xs font-bold text-emerald-950/40 uppercase">{t("admin.detailsCards")}</span>
                  {whyLocalForm.sections.map((sec, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-[#fcfbfa]/50 flex flex-col gap-2">
                      <BilingualField value={sec.title} onChange={(v) => handleWhyLocalSectionChange(idx, "title", v)} />
                      <BilingualField value={sec.content} onChange={(v) => handleWhyLocalSectionChange(idx, "content", v)} type="textarea" rows={3} />
                    </div>
                  ))}
                </div>
              </form>

              {/* Home Page Section */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePageContent("home_page", homeForm);
                }}
                className="flex flex-col gap-4 border-b border-emerald-950/10 pb-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.pageHome")}</h3>
                  <button type="submit" className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold uppercase">
                    {t("admin.saveHomeContent")}
                  </button>
                </div>

                {/* Hero Section */}
                <span className="text-xs font-bold text-emerald-950/40 uppercase">{t("admin.heroSection")}</span>
                <BilingualField label={t("admin.tag")} value={homeForm.heroTag} onChange={(v) => handleHomeField("heroTag", v)} />
                <BilingualField label={t("admin.title")} value={homeForm.heroTitle} onChange={(v) => handleHomeField("heroTitle", v)} />
                <BilingualField label={t("admin.subheading")} value={homeForm.heroSub} onChange={(v) => handleHomeField("heroSub", v)} type="textarea" />

                {/* Farmer Section */}
                <span className="text-xs font-bold text-emerald-950/40 uppercase mt-2">{t("admin.farmerSection")}</span>
                <BilingualField label={t("admin.sectionTag")} value={homeForm.farmerSectionTag} onChange={(v) => handleHomeField("farmerSectionTag", v)} />
                <BilingualField label={t("admin.sectionTitle")} value={homeForm.farmerSectionTitle} onChange={(v) => handleHomeField("farmerSectionTitle", v)} />

                {/* Mission Section */}
                <span className="text-xs font-bold text-emerald-950/40 uppercase mt-2">{t("admin.missionSection")}</span>
                <BilingualField label={t("admin.sectionTag")} value={homeForm.missionSectionTag} onChange={(v) => handleHomeField("missionSectionTag", v)} />
                <BilingualField label={t("admin.sectionTitle")} value={homeForm.missionSectionTitle} onChange={(v) => handleHomeField("missionSectionTitle", v)} />
                <BilingualField label={t("admin.sectionSubheading")} value={homeForm.missionSectionSub} onChange={(v) => handleHomeField("missionSectionSub", v)} type="textarea" />
                <div className="flex flex-col gap-3 mt-1">
                  <span className="text-xs font-bold text-emerald-950/40 uppercase">{t("admin.missionCards")}</span>
                  {(homeForm.missionCards || []).map((card, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-[#fcfbfa]/50 flex flex-col gap-2">
                      <BilingualField value={card.title} onChange={(v) => handleHomeMissionCard(idx, "title", v)} />
                      <BilingualField value={card.description} onChange={(v) => handleHomeMissionCard(idx, "description", v)} type="textarea" rows={2} />
                    </div>
                  ))}
                </div>

                {/* How It Works Section */}
                <span className="text-xs font-bold text-emerald-950/40 uppercase mt-2">{t("admin.howItWorksSection")}</span>
                <BilingualField label={t("admin.sectionTag")} value={homeForm.howItWorksTag} onChange={(v) => handleHomeField("howItWorksTag", v)} />
                <BilingualField label={t("admin.sectionTitle")} value={homeForm.howItWorksTitle} onChange={(v) => handleHomeField("howItWorksTitle", v)} />
                <BilingualField label={t("admin.sectionSubheading")} value={homeForm.howItWorksSub} onChange={(v) => handleHomeField("howItWorksSub", v)} type="textarea" />
                <div className="flex flex-col gap-3 mt-1">
                  <span className="text-xs font-bold text-emerald-950/40 uppercase">{t("admin.steps")}</span>
                  {(homeForm.steps || []).map((step, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-[#fcfbfa]/50 flex flex-col gap-2">
                      <BilingualField value={step.title} onChange={(v) => handleHomeStep(idx, "title", v)} />
                      <BilingualField value={step.description} onChange={(v) => handleHomeStep(idx, "description", v)} type="textarea" rows={2} />
                    </div>
                  ))}
                </div>
              </form>

              {/* Dashboard Page Section */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePageContent("dashboard_page", dashboardForm);
                }}
                className="flex flex-col gap-4 border-b border-emerald-950/10 pb-8"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.pageDashboard")}</h3>
                  <button type="submit" className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold uppercase">
                    {t("admin.saveDashboardContent")}
                  </button>
                </div>

                <span className="text-xs font-bold text-emerald-950/40 uppercase">{t("admin.header")}</span>
                <BilingualField label={t("admin.headerTag")} value={dashboardForm.headerTag} onChange={(v) => handleDashboardField("headerTag", v)} />
                <BilingualField label={t("admin.headerTitle")} value={dashboardForm.headerTitle} onChange={(v) => handleDashboardField("headerTitle", v)} />
                <BilingualField label={t("admin.headerSubheading")} value={dashboardForm.headerSub} onChange={(v) => handleDashboardField("headerSub", v)} type="textarea" />

                <span className="text-xs font-bold text-emerald-950/40 uppercase mt-2">{t("admin.supporterLevels")}</span>
                <div className="flex flex-col gap-3">
                  {(dashboardForm.levels || []).map((level, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-[#fcfbfa]/50 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <BilingualField value={level.name} onChange={(v) => handleDashboardLevel(idx, "name", v)} />
                        <input type="text" value={level.emoji || ""} onChange={(e) => handleDashboardLevel(idx, "emoji", e.target.value)} placeholder={t("admin.emojiPlaceholder")} className="w-16 p-2 bg-white border border-emerald-955/15 rounded-lg text-xs text-center" />
                      </div>
                      <input type="number" value={level.points} onChange={(e) => handleDashboardLevel(idx, "points", parseInt(e.target.value) || 0)} placeholder={t("admin.minPointsPlaceholder")} className="w-full p-2 bg-white border border-emerald-955/15 rounded-lg text-xs" />
                      <BilingualField value={level.desc} onChange={(v) => handleDashboardLevel(idx, "desc", v)} type="textarea" rows={2} />
                    </div>
                  ))}
                </div>

                <span className="text-xs font-bold text-emerald-950/40 uppercase mt-2">{t("admin.labelsText")}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "supporterStatusLabel", labelKey: "admin.dashboardSupporterStatusLabel" },
                    { key: "progressLabel", labelKey: "admin.dashboardProgressLabel" },
                    { key: "productsRequestedLabel", labelKey: "admin.dashboardProductsRequestedLabel" },
                    { key: "farmersSupportedLabel", labelKey: "admin.dashboardFarmersSupportedLabel" },
                    { key: "carbonSavedLabel", labelKey: "admin.dashboardCarbonSavedLabel" },
                    { key: "maxLevelLabel", labelKey: "admin.dashboardMaxLevelLabel" },
                    { key: "pointsLabel", labelKey: "admin.dashboardPointsLabel" },
                    { key: "unlockLabel", labelKey: "admin.dashboardUnlockLabel" },
                    { key: "eachItemLabel", labelKey: "admin.dashboardEachItemLabel" },
                    { key: "supporterTierLabel", labelKey: "admin.dashboardSupporterTierLabel" },
                    { key: "ptsSuffix", labelKey: "admin.dashboardPtsSuffix" },
                    { key: "activeStatusLabel", labelKey: "admin.dashboardActiveStatusLabel" },
                    { key: "topProductsTitle", labelKey: "admin.dashboardTopProductsTitle" },
                    { key: "topProductsSub", labelKey: "admin.dashboardTopProductsSub" },
                    { key: "impactFormulaTitle", labelKey: "admin.dashboardImpactFormulaTitle" },
                    { key: "calculatedOffsetLabel", labelKey: "admin.dashboardCalculatedOffsetLabel" },
                    { key: "totalSavingsLabel", labelKey: "admin.dashboardTotalSavingsLabel" },
                    { key: "tonnesLabel", labelKey: "admin.dashboardTonnesLabel" },
                    { key: "treesMatchLabel", labelKey: "admin.dashboardTreesMatchLabel" },
                    { key: "researchLinkTitle", labelKey: "admin.dashboardResearchLinkTitle" },
                    { key: "researchLinkSub", labelKey: "admin.dashboardResearchLinkSub" },
                    { key: "impactPointsLabel", labelKey: "admin.dashboardImpactPointsLabel" },
                    { key: "requestsSavedLabel", labelKey: "admin.dashboardRequestsSavedLabel" },
                    { key: "activeFarmersLabel", labelKey: "admin.dashboardActiveFarmersLabel" },
                    { key: "co2ReducedLabel", labelKey: "admin.dashboardCo2ReducedLabel" }
                  ].map(({ key, labelKey }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold uppercase text-emerald-955/50 mb-1">{t(labelKey)}</label>
                      <input type="text" value={dashboardForm[key]?.en || dashboardForm[key] || ""} onChange={(e) => handleDashboardField(key, { en: e.target.value, az: dashboardForm[key]?.az || "" })} className="w-full p-2 bg-[#fcfbfa] border border-emerald-955/15 rounded-lg text-sm" />
                    </div>
                  ))}
                </div>

                <BilingualField label={t("admin.impactFormulaText")} value={dashboardForm.impactFormulaText} onChange={(v) => handleDashboardField("impactFormulaText", v)} type="textarea" rows={3} />
              </form>

              {/* Research Page Section */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePageContent("research_page", researchForm);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.pageResearch")}</h3>
                  <button type="submit" className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold uppercase">
                    {t("admin.saveResearchContent")}
                  </button>
                </div>
                <BilingualField label={t("admin.heroTitle")} value={researchForm.heroTitle} onChange={(v) => setResearchForm({ ...researchForm, heroTitle: v })} />
                <BilingualField label={t("admin.heroSubheading")} value={researchForm.heroSub} onChange={(v) => setResearchForm({ ...researchForm, heroSub: v })} type="textarea" />

                {/* Stats cards */}
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-xs font-bold text-emerald-950/40 uppercase">{t("admin.researchStats")}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {researchForm.stats.map((st, idx) => (
                      <div key={idx} className="p-3 border rounded-xl bg-[#fcfbfa]/50 flex flex-col gap-2">
                        <BilingualField
                          value={st.label}
                          onChange={(v) => handleResearchStatChange(idx, "label", v)}
                        />
                        <input
                          type="text"
                          value={st.value}
                          onChange={(e) => handleResearchStatChange(idx, "value", e.target.value)}
                          placeholder={t("admin.statValuePlaceholder")}
                          className="w-full p-2 bg-white border border-emerald-955/15 rounded-lg text-xs font-numeric font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </form>

            </div>
          )}

          {/* TAB 7: LISTINGS MANAGER */}
          {activeTab === "listings" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("admin.listingsTitle")}</h2>
                  <p className="text-xs text-emerald-950/50 mt-1">{t("admin.listingsDesc")}</p>
                </div>
                {!isListingEditing && (
                  <button
                    onClick={() => { setListingForm({ id: "", name: toBilingual(""), description: toBilingual(""), farmerName: "", farmerPhone: "", location: "", availableWeight: "", qualityDesc: "", impactPoints: 5, sustainability: "", question1: { question: { en: "", az: "" }, options: emptyOptions() }, question2: { question: { en: "", az: "" }, options: emptyOptions() }, photoMain: "/images/placeholder-veg.jpg", photos: "[]", status: "Active" }); setIsListingEditing(true); }}
                    className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> {t("admin.addListing")}
                  </button>
                )}
              </div>

              {isListingEditing ? (
                <form onSubmit={handleListingSubmit} className="flex flex-col gap-4 bg-[#fcfbfa] border border-emerald-950/5 p-6 rounded-2xl">
                  <h3 className="text-lg font-serif font-bold text-emerald-950">{listingForm.id ? t("admin.editListing") : t("admin.createNewListing")}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <BilingualField label={t("admin.listingName")} value={listingForm.name} onChange={(v) => setListingForm({...listingForm, name: v})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.listingAvailableWeight")}</label>
                      <input type="text" value={listingForm.availableWeight} onChange={(e) => setListingForm({...listingForm, availableWeight: e.target.value})} className="w-full p-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm" placeholder={t("admin.listingWeightPlaceholder")} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.listingFarmerName")}</label>
                      <input type="text" value={listingForm.farmerName} onChange={(e) => setListingForm({...listingForm, farmerName: e.target.value})} className="w-full p-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.listingFarmerPhone")}</label>
                      <input type="text" value={listingForm.farmerPhone} onChange={(e) => setListingForm({...listingForm, farmerPhone: e.target.value})} className="w-full p-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm" placeholder={t("admin.listingPhonePlaceholder")} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.listingLocation")}</label>
                      <input type="text" value={listingForm.location} onChange={(e) => setListingForm({...listingForm, location: e.target.value})} className="w-full p-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm" placeholder={t("admin.listingLocationPlaceholder")} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.listingImpactPerKg")}</label>
                      <input type="number" value={listingForm.impactPoints} onChange={(e) => setListingForm({...listingForm, impactPoints: parseInt(e.target.value) || 5})} className="w-full p-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.listingPhoto")}</label>
                      <div className="flex gap-2">
                        <input type="text" value={listingForm.photoMain} onChange={(e) => setListingForm({...listingForm, photoMain: e.target.value})} className="flex-1 p-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm" placeholder={t("admin.listingPhotoPlaceholder")} />
                        <label className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-semibold uppercase cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap">
                          <Upload className="w-3 h-3" /> {t("admin.upload")}
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch(`${BACKEND_URL}/api/upload`, {
                                method: "POST",
                                body: formData
                              });
                              const data = await res.json();
                              if (data.success) {
                                setListingForm({...listingForm, photoMain: data.url});
                                showFeedback("success", t("admin.feedbackImageUploaded"));
                              } else {
                                showFeedback("error", data.error || t("admin.feedbackUploadFailed"));
                              }
                            } catch (err) { showFeedback("error", t("admin.feedbackUploadFailed")); console.error(err); }
                          }} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.listingStatus")}</label>
                      <select value={listingForm.status} onChange={(e) => setListingForm({...listingForm, status: e.target.value})} className="w-full p-2.5 bg-white border border-emerald-950/15 rounded-xl text-sm">
                        <option value="Active">{t("admin.active")}</option>
                        <option value="Inactive">{t("admin.inactive")}</option>
                      </select>
                    </div>
                  </div>

                  <BilingualField label={t("admin.listingDescription")} value={listingForm.description} onChange={(v) => setListingForm({...listingForm, description: v})} type="textarea" rows={3} />
                  <BilingualField label={t("admin.listingQualityDesc")} value={listingForm.qualityDesc} onChange={(v) => setListingForm({...listingForm, qualityDesc: v})} type="textarea" rows={2} />

                    {/* Additional Photos */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-emerald-950/60 mb-1">{t("admin.listingAdditionalPhotos")}</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(() => {
                          try { return JSON.parse(listingForm.photos || "[]"); }
                          catch { return []; }
                        })().map((p, i) => (
                          <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-emerald-200 shrink-0">
                            <img src={p} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => {
                                  const arr = JSON.parse(listingForm.photos || "[]");
                                  const removed = arr.filter((_, idx) => idx !== i);
                                  setListingForm({...listingForm, photos: JSON.stringify(removed)});
                                }}
                                className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                              >
                                <Trash2 className="w-3 h-3 text-white" />
                              </button>
                            </div>
                            <div className="absolute top-0.5 right-0.5 flex gap-0.5">
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = JSON.parse(listingForm.photos || "[]");
                                    [arr[i-1], arr[i]] = [arr[i], arr[i-1]];
                                    setListingForm({...listingForm, photos: JSON.stringify(arr)});
                                  }}
                                  className="w-5 h-5 rounded bg-white/80 flex items-center justify-center hover:bg-white text-[10px] font-bold"
                                >
                                  ←
                                </button>
                              )}
                              {i < JSON.parse(listingForm.photos || "[]").length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = JSON.parse(listingForm.photos || "[]");
                                    [arr[i], arr[i+1]] = [arr[i+1], arr[i]];
                                    setListingForm({...listingForm, photos: JSON.stringify(arr)});
                                  }}
                                  className="w-5 h-5 rounded bg-white/80 flex items-center justify-center hover:bg-white text-[10px] font-bold"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors bg-emerald-50/50 shrink-0">
                          <Plus className="w-5 h-5 text-emerald-400" />
                          <span className="text-[8px] text-emerald-400 mt-0.5 font-semibold">{t("admin.upload")}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", body: formData });
                              const data = await res.json();
                              if (data.success) {
                                const arr = JSON.parse(listingForm.photos || "[]");
                                if (arr.length >= 9) { showFeedback("error", "Max 9 additional photos"); return; }
                                arr.push(data.url);
                                setListingForm({...listingForm, photos: JSON.stringify(arr)});
                                showFeedback("success", t("admin.feedbackImageUploaded"));
                              } else {
                                showFeedback("error", data.error || t("admin.feedbackUploadFailed"));
                              }
                            } catch (err) { showFeedback("error", t("admin.feedbackUploadFailed")); }
                            e.target.value = "";
                          }} />
                        </label>
                      </div>
                      <p className="text-[10px] text-emerald-950/30">{t("admin.listingPhotosMax", { n: 9 })}</p>
                    </div>

                  <BilingualField label={t("admin.listingSustainability")} value={listingForm.sustainability} onChange={(v) => setListingForm({...listingForm, sustainability: v})} type="textarea" rows={3} />

                  <div className="border-t border-emerald-950/10 pt-4">
                    <h4 className="text-sm font-bold text-emerald-950 mb-3">{t("admin.listingQuestionsTitle")}</h4>
                    <p className="text-[10px] text-emerald-950/50 mb-4">{t("admin.listingQuestionsDesc")}</p>
                    <div className="flex flex-col gap-6">
                      {[1, 2].map((qIdx) => {
                        const qKey = `question${qIdx}`;
                        const qField = listingForm[qKey] || { question: { en: "", az: "" }, options: emptyOptions() };
                        return (
                          <div key={qIdx} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-950/5">
                            <BilingualField label={`${t("admin.listingQuestion")} ${qIdx}`} value={qField.question} onChange={(v) => setListingForm({...listingForm, [qKey]: { ...qField, question: v }})} type="textarea" rows={2} />
                            <div className="mt-3 grid grid-cols-1 gap-2">
                              {[0, 1, 2, 3].map((optIdx) => {
                                const opts = qField.options || emptyOptions();
                                return (
                                  <BilingualField key={optIdx} label={`${t("admin.option")} ${optIdx + 1}${optIdx === 3 ? ` (${t("admin.other")})` : ""}`} value={opts[optIdx]} onChange={(v) => { const newOpts = [...opts]; newOpts[optIdx] = v; setListingForm({...listingForm, [qKey]: { ...qField, options: newOpts }}); }} />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setIsListingEditing(false)} className="flex-1 py-2.5 border border-emerald-950/15 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-950">{t("admin.cancel")}</button>
                    <button type="submit" className="flex-1 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-800">{listingForm.id ? t("admin.updateListing") : t("admin.createListing")}</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {listings.map((listing) => (
                      <div key={listing.id} className="p-4 border border-emerald-950/5 rounded-2xl flex items-center justify-between gap-4 bg-[#fcfbfa]">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex -space-x-2 shrink-0">
                          <img src={listing.photoMain} alt={listing.name} className="w-12 h-12 rounded-xl border border-emerald-200 object-cover relative z-10" />
                          {(() => {
                            try { const extra = JSON.parse(listing.photos || "[]"); return extra.slice(0, 2).map((p, i) => (
                              <img key={i} src={p} alt="" className="w-12 h-12 rounded-xl border border-emerald-200 object-cover relative z-[5] -ml-2 opacity-70" />
                            )); } catch { return null; }
                          })()}
                          {(() => {
                            try { const extra = JSON.parse(listing.photos || "[]"); return extra.length > 2 ? <div className="w-12 h-12 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-600 relative -ml-2">+{extra.length - 2}</div> : null; }
                            catch { return null; }
                          })()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-emerald-950">{listing.name}</h4>
                          <p className="text-xs text-emerald-600">{listing.farmerName} &middot; {listing.location}</p>
                          <p className="text-[10px] text-emerald-950/40 mt-0.5">{listing.availableWeight} &middot; {listing.impactPoints} pts/kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${listing.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{listing.status}</span>
                        <button onClick={() => handleViewAnswers(listing)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg" title={t("admin.viewAnswers")}><Users className="w-4 h-4" /></button>
                        <button onClick={() => handleEditListing(listing)} className="p-2 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteListing(listing.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {listings.length === 0 && <div className="text-center py-12 text-emerald-950/40">{t("admin.noListings")}</div>}
                </div>
              )}

              {/* Answers viewer modal */}
              {viewingAnswers && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/50 backdrop-blur-sm">
                  <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
                    <div className="sticky top-0 bg-white border-b border-emerald-950/5 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                      <h3 className="font-serif text-lg font-bold text-emerald-950">{t("admin.answersFor")} {viewingAnswers.name}</h3>
                      <button onClick={() => setViewingAnswers(null)} className="p-1 text-emerald-400 hover:text-emerald-900"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6">
                      {answersLoading ? (
                        <div className="text-center py-8 text-emerald-950/40">{t("admin.loading")}</div>
                      ) : answersData.length === 0 ? (
                        <div className="text-center py-8 text-emerald-950/40">{t("admin.noAnswers")}</div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {answersData.map((ans) => (
                            <div key={ans.id} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-semibold text-emerald-950 text-sm">{ans.user?.name || ans.user?.email || t("admin.unknownUser")}</p>
                                  <p className="text-[10px] text-emerald-950/40">{ans.user?.email}</p>
                                </div>
                                <span className="text-[10px] text-emerald-600 font-semibold">{new Date(ans.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                {(() => {
                                  const q1 = viewingAnswers.question1;
                                  const q2 = viewingAnswers.question2;
                                  const a = typeof ans.answers === "object" ? ans.answers : {};
                                  const loc = (v) => { try { const p = typeof v === "string" ? JSON.parse(v) : v; return p?.[locale] || p?.en || ""; } catch { return v || ""; } };
                                  const qText = (q) => q?.question ? loc(q.question) : loc(q);
                                  const pairs = [];
                                  const fmt = (v) => Array.isArray(v) ? v.join(", ") : (v || "");
                                  if (a.q1 || a.usage) pairs.push({ q: qText(q1) || (a.usage ? t("admin.defaultQ1") : ""), a: fmt(a.q1 || a.usage) });
                                  if (a.q2 || a.reason) pairs.push({ q: qText(q2) || (a.reason ? t("admin.defaultQ2") : ""), a: fmt(a.q2 || a.reason) });
                                  return pairs.filter(p => p.q || p.a).map((p, i) => (
                                    <div key={i} className="text-xs">
                                      <span className="font-semibold text-emerald-950/70">{p.q}</span>
                                      <p className="text-emerald-950 mt-0.5">{p.a}</p>
                                    </div>
                                  ));
                                })()}
                              </div>
                              <div className="mt-2 text-[10px] text-emerald-600 font-semibold">{t("admin.pointsAwarded")}: {ans.points}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Research Analytics */}
          {activeTab === "research" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="w-16 h-16 text-emerald-300 mb-4" />
              <h3 className="text-xl font-serif text-emerald-950 font-bold mb-2">{t("admin.researchTitle")}</h3>
              <p className="text-sm text-emerald-950/50 max-w-md mb-6">{t("admin.researchDesc")}</p>
               <Link href={`/${ADMIN_PATH}/research`} className="px-6 py-3 bg-emerald-900 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> {t("admin.openResearch")}
              </Link>
            </div>
          )}

          {activeTab === "credits" && (
            <CreditsManager
              credits={credits}
              setCredits={setCredits}
              showFeedback={showFeedback}
              t={t}
            />
          )}

          {activeTab === "users" && (
            <UsersList t={t} users={users} />
          )}

          {activeTab === "faq" && (
            <FaqManager t={t} showFeedback={showFeedback} />
          )}

          {activeTab === "reviews" && (
            <ReviewsManager t={t} showFeedback={showFeedback} />
          )}

        </div>

      </div>

    </div>
  );
}

// FAQ Manager Component
function FaqManager({ t, showFeedback }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState({ en: "", az: "" });
  const [editingCat, setEditingCat] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ categoryId: "", question: { en: "", az: "" }, answer: { en: "", az: "" } });

  const loadFaq = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/faq`, { cache: "no-store" });
      const data = await res.json();
      setCategories(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadFaq(); }, []);

  const handleAddCategory = async () => {
    if (!newCatName.en.trim()) return;
    try {
      await createFaqCategory(newCatName);
      showFeedback("success", "Category added");
      setNewCatName({ en: "", az: "" });
      loadFaq();
    } catch (e) { showFeedback("error", "Failed"); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm(t("admin.faqDeleteCategory"))) return;
    try {
      await deleteFaqCategory(id);
      showFeedback("success", "Category deleted");
      loadFaq();
    } catch (e) { showFeedback("error", "Failed"); }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question.en.trim() || !newQuestion.categoryId) return;
    try {
      await createFaqQuestion(newQuestion.categoryId, newQuestion.question, newQuestion.answer);
      showFeedback("success", "Question added");
      setNewQuestion({ categoryId: "", question: { en: "", az: "" }, answer: { en: "", az: "" } });
      loadFaq();
    } catch (e) { showFeedback("error", "Failed"); }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm(t("admin.faqDeleteQuestion"))) return;
    try {
      await deleteFaqQuestion(id);
      showFeedback("success", "Question deleted");
      loadFaq();
    } catch (e) { showFeedback("error", "Failed"); }
  };

  if (loading) return <p className="text-emerald-950/40">{t("admin.loading")}</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.faqTitle")}</h3>
        <p className="text-sm text-emerald-950/60 mt-1">{t("admin.faqDesc")}</p>
      </div>

      {/* Add Category */}
      <div className="bg-white rounded-2xl border border-emerald-950/5 p-5 flex flex-col gap-3">
        <span className="text-xs font-bold uppercase text-emerald-950/40">{t("admin.faqAddCategory")}</span>
        <div className="flex gap-2">
          <input value={newCatName.en} onChange={(e) => setNewCatName({ ...newCatName, en: e.target.value })} placeholder="EN" className="flex-1 p-2 bg-[#fcfbfa] border rounded-lg text-sm" />
          <input value={newCatName.az} onChange={(e) => setNewCatName({ ...newCatName, az: e.target.value })} placeholder="AZ" className="flex-1 p-2 bg-[#fcfbfa] border rounded-lg text-sm" />
          <button onClick={handleAddCategory} className="px-4 py-2 bg-emerald-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap">+ {t("admin.faqAddCategory")}</button>
        </div>
      </div>

      {/* Categories */}
      {categories.length === 0 && <p className="text-emerald-950/40">{t("admin.faqNoCategories")}</p>}

      {categories.map((cat) => (
        <div key={cat.id} className="bg-white rounded-2xl border border-emerald-950/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-serif font-semibold text-emerald-950">{cat.name?.en || cat.name?.az || ""}</h4>
            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Existing questions */}
          {cat.questions?.length > 0 ? (
            <div className="flex flex-col gap-2 mb-4">
              {cat.questions.map((q) => (
                <div key={q.id} className="flex items-start gap-3 p-3 bg-[#fcfbfa] rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-950">{q.question?.en || ""}</p>
                    <p className="text-xs text-emerald-950/60 mt-0.5">{q.answer?.en || ""}</p>
                  </div>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-950/40 mb-4">{t("admin.faqNoQuestions")}</p>
          )}

          {/* Add Question to this category */}
          <details className="mt-2">
            <summary className="text-xs font-semibold text-emerald-700 cursor-pointer hover:text-emerald-600">{t("admin.faqAddQuestion")}</summary>
            <div className="flex flex-col gap-2 mt-3">
              <input placeholder={`${t("admin.faqQuestion")} (EN)`} value={newQuestion.question.en} onChange={(e) => setNewQuestion({ ...newQuestion, categoryId: cat.id, question: { ...newQuestion.question, en: e.target.value } })} className="p-2 bg-[#fcfbfa] border rounded-lg text-sm" />
              <input placeholder={`${t("admin.faqQuestion")} (AZ)`} value={newQuestion.question.az} onChange={(e) => setNewQuestion({ ...newQuestion, categoryId: cat.id, question: { ...newQuestion.question, az: e.target.value } })} className="p-2 bg-[#fcfbfa] border rounded-lg text-sm" />
              <textarea placeholder={`${t("admin.faqAnswer")} (EN)`} value={newQuestion.answer.en} onChange={(e) => setNewQuestion({ ...newQuestion, categoryId: cat.id, answer: { ...newQuestion.answer, en: e.target.value } })} className="p-2 bg-[#fcfbfa] border rounded-lg text-sm resize-none" rows={2} />
              <textarea placeholder={`${t("admin.faqAnswer")} (AZ)`} value={newQuestion.answer.az} onChange={(e) => setNewQuestion({ ...newQuestion, categoryId: cat.id, answer: { ...newQuestion.answer, az: e.target.value } })} className="p-2 bg-[#fcfbfa] border rounded-lg text-sm resize-none" rows={2} />
              <button onClick={handleAddQuestion} className="self-start px-4 py-1.5 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-lg text-xs font-semibold">+ {t("admin.faqAddQuestion")}</button>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}

// Reviews Manager Component
function ReviewsManager({ t, showFeedback }) {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("");
  const [search, setSearch] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews({ limit: 50, all: true, rating: ratingFilter || undefined, search: search || undefined });
      let list = data.reviews || [];
      if (filter === "visible") list = list.filter(r => !r.hidden);
      else if (filter === "hidden") list = list.filter(r => r.hidden);
      setReviews(list);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, [filter, ratingFilter, search]);

  const handleToggle = async (id, currentHidden) => {
    try {
      await updateReview(id, { hidden: !currentHidden });
      showFeedback("success", t("admin.reviewsToggleSuccess"));
      loadReviews();
    } catch (e) { showFeedback("error", "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("admin.reviewsConfirmDelete"))) return;
    try {
      await deleteReview(id);
      showFeedback("success", t("admin.reviewsDeleteSuccess"));
      loadReviews();
    } catch (e) { showFeedback("error", "Failed"); }
  };

  if (loading) return <p className="text-emerald-950/40">{t("admin.loading")}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.reviewsTitle")}</h3>
        <p className="text-sm text-emerald-950/60 mt-1">{t("admin.reviewsDesc")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-white border border-emerald-950/10 rounded-xl p-1">
          {["all", "visible", "hidden"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-emerald-900 text-white" : "text-emerald-950/60 hover:text-emerald-900"}`}>
              {f === "all" ? t("admin.reviewsAll") : f === "visible" ? t("admin.reviewsVisible") : t("admin.reviewsHidden")}
            </button>
          ))}
        </div>
        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="p-2 bg-white border border-emerald-950/10 rounded-xl text-xs font-semibold">
          <option value="">{t("admin.reviewsFilterRating")}</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.reviewsSearch")} className="flex-1 min-w-[160px] p-2 bg-white border border-emerald-950/10 rounded-xl text-xs" />
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <span className="text-emerald-950/60">{t("reviews.totalReviews")}: <strong className="text-emerald-950">{total}</strong></span>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-emerald-950/40 py-8">{t("admin.reviewsNoResults")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className={`bg-white rounded-2xl border p-4 flex flex-col gap-2 ${r.hidden ? "border-red-200 opacity-60" : "border-emerald-950/5"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-800">{r.userName?.charAt(0) || "?"}</div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">{r.userName}</p>
                    <p className="text-[10px] text-emerald-950/40">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-emerald-900/20"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-emerald-950/70 ml-11">{r.text}</p>
              <div className="flex gap-2 ml-11">
                <button onClick={() => handleToggle(r.id, r.hidden)} className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${r.hidden ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"}`}>
                  {r.hidden ? t("admin.reviewsShow") : t("admin.reviewsHide")}
                </button>
                <button onClick={() => handleDelete(r.id)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-semibold transition-colors">
                  {t("admin.reviewsDelete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Credits Manager Component
function CreditsManager({ credits, setCredits, showFeedback, t }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ role: "", name: "", platform: "", url: "" });

  const resetForm = () => { setForm({ role: "", name: "", platform: "", url: "" }); setEditId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.role.trim() || !form.name.trim()) { showFeedback("error", t("admin.feedbackRoleNameRequired")); return; }
    try {
      if (editId) {
        await updateCredit(editId, form);
      } else {
        await createCredit(form);
      }
      const updated = await getCredits();
      setCredits(updated);
      resetForm();
      showFeedback("success", t("admin.feedbackCreditSaved"));
    } catch { showFeedback("error", t("admin.feedbackCreditSaveFailed")); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("admin.confirmDeleteCredit"))) return;
    try {
      await deleteCredit(id);
      setCredits(prev => prev.filter(c => c.id !== id));
      if (editId === id) resetForm();
      showFeedback("success", t("admin.feedbackCreditDeleted"));
    } catch { showFeedback("error", t("admin.feedbackCreditDeleteFailed")); }
  };

  const handleEdit = (credit) => {
    setForm({ role: credit.role, name: credit.name, platform: credit.platform || "", url: credit.url || "" });
    setEditId(credit.id);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-emerald-950 font-bold">{t("admin.creditsTitle")}</h2>
          <p className="text-xs text-emerald-950/50 mt-1">{t("admin.creditsDesc")}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${showForm ? "bg-red-50 text-red-600" : "bg-emerald-900 text-white hover:bg-emerald-800"}`}>
          {showForm ? t("admin.cancel") : t("admin.addCredit")}
        </button>
      </div>

      {showForm && (
        <div className="bg-emerald-50/50 border border-emerald-950/10 rounded-2xl p-5 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder={t("admin.creditRole")} className="px-3 py-2 bg-white border border-emerald-950/10 rounded-xl text-sm focus:outline-none focus:border-emerald-800" />
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={t("admin.creditName")} className="px-3 py-2 bg-white border border-emerald-950/10 rounded-xl text-sm focus:outline-none focus:border-emerald-800" />
            <input value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} placeholder={t("admin.creditPlatform")} className="px-3 py-2 bg-white border border-emerald-950/10 rounded-xl text-sm focus:outline-none focus:border-emerald-800" />
            <input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder={t("admin.creditUrl")} className="px-3 py-2 bg-white border border-emerald-950/10 rounded-xl text-sm focus:outline-none focus:border-emerald-800" />
          </div>
          <button onClick={handleSave} className="self-start px-5 py-2 bg-emerald-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors">
            {editId ? t("admin.updateCredit") : t("admin.addCredit")}
          </button>
        </div>
      )}

      {credits.length === 0 ? (
        <div className="text-center py-12 text-emerald-950/40 text-sm">{t("admin.noCredits")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {credits.map(credit => (
            <div key={credit.id} className="bg-white border border-emerald-950/5 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">{credit.role}</p>
                  <p className="text-base font-semibold text-emerald-950 mt-0.5">{credit.name}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(credit)} className="p-1.5 text-emerald-950/30 hover:text-emerald-700 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(credit.id)} className="p-1.5 text-emerald-950/30 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {credit.platform && (
                <a href={credit.url || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-700 hover:text-emerald-900 underline underline-offset-2">
                  {credit.platform}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersList({ t, users }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-serif text-emerald-950 font-bold">{t("admin.usersTitle")}</h3>
        <p className="text-xs text-emerald-950/50 mt-1">{t("admin.usersDesc")}</p>
      </div>
      {users.length === 0 ? (
        <p className="text-sm text-emerald-950/40 py-8 text-center">{t("admin.usersEmpty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-950/10">
                <th className="text-left py-3 px-2 text-[10px] font-bold uppercase text-emerald-950/40">{t("admin.usersName")}</th>
                <th className="text-left py-3 px-2 text-[10px] font-bold uppercase text-emerald-950/40">{t("admin.usersEmail")}</th>
                <th className="text-left py-3 px-2 text-[10px] font-bold uppercase text-emerald-950/40">{t("admin.usersPhone")}</th>
                <th className="text-center py-3 px-2 text-[10px] font-bold uppercase text-emerald-950/40">{t("admin.usersPoints")}</th>
                <th className="text-right py-3 px-2 text-[10px] font-bold uppercase text-emerald-950/40">{t("admin.usersDate")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-emerald-950/5 hover:bg-emerald-900/[0.02]">
                  <td className="py-3 px-2 text-emerald-950 font-medium">{u.name}</td>
                  <td className="py-3 px-2 text-emerald-950/70">{u.email}</td>
                  <td className="py-3 px-2 text-emerald-950/70">{u.phone || "—"}</td>
                  <td className="py-3 px-2 text-center text-emerald-800 font-semibold">{u.impactPoints}</td>
                  <td className="py-3 px-2 text-right text-emerald-950/50 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
