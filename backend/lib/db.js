import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
  prisma = global.prismaGlobal;
}

async function seedIfEmpty() {
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) return;

  console.log("Seeding initial database...");

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "KendMart@2026!", 10);

  await prisma.admin.create({
    data: {
      email: (process.env.ADMIN_EMAIL || "admin@kendmart.az").toLowerCase().trim(),
      password: hashedPassword,
      name: "Admin"
    }
  });

  const e = (en, az) => ({ en, az });

  const pages = [
    {
      key: "mission_page",
      content: JSON.stringify({
        heroTitle: e("Our Climate Mission", "İqlim Missiyamız"),
        heroSub: e("Rebuilding a sustainable connection between communities and land.", "Cəmiyyətlər və torpaq arasında davamlı bir əlaqə qururuq."),
        ceoPhoto: "",
        ceoTitle: e("CEO & Founder", "CEO & Təsisçi"),
        ceoName: "Leyla Heydarova",
        ceoBio: e("Environmental advocate and founder of KendMart. Working to connect consumers with regenerative agriculture practices across Azerbaijan.", "Ətraf mühit müdafiəçisi və KendMart təsisçisi. Azərbaycanda istehlakçıları regenerativ kənd təsərrüfatı təcrübələri ilə əlaqələndirmək üçün çalışır."),
        ceoQuote: e("Sustainable agriculture is not just about growing food — it is about nurturing communities, protecting our land, and building a future where every choice we make respects the planet and its people.", "Davamlı kənd təsərrüfatı sadəcə qida yetişdirmək deyil — bu, cəmiyyətlərə qayğı göstərmək, torpağımızı qorumaq və hər seçimimizin planetə və insanlara hörmət etdiyi bir gələcək qurmaqdır."),
        sections: [
          { title: e("Sustainable Agriculture", "Davamlı Kənd Təsərrüfatı"), description: e("Traditional industrial agriculture depletes topsoil, relies heavily on chemical pesticides, and emits massive greenhouse gases. We support regenerative methods that protect ecosystems.", "Ənənəvi sənaye kənd təsərrüfatı üst torpağı tükəndirir, kimyəvi pestisidlərdən asılıdır və böyük miqdarda istixana qazı buraxır. Biz ekosistemləri qoruyan regenerativ metodları dəstəkləyirik.") },
          { title: e("Local Food Systems", "Yerli Qida Sistemləri"), description: e("By building short, local demand networks, we reduce the emissions caused by transcontinental food transport (food miles) and packaging waste.", "Qısa, yerli tələb şəbəkələri quraraq, transkontinental qida nəqliyyatı (qida milləri) və qablaşdırma tullantıları nəticəsində yaranan emissiyaları azaldırıq.") },
          { title: e("Healthy Soils", "Sağlam Torpaqlar"), description: e("Living soils store carbon, retain water, and provide nutrients. Our farmers practice minimal tilling and use organic compost to nourish soil microbiomes.", "Canlı torpaqlar karbon saxlayır, su tutur və qida maddələri təmin edir. Fermerlərimiz minimal şumlama tətbiq edir və torpaq mikrobiomlarını qidalandırmaq üçün üzvi kompostdan istifadə edir.") },
          { title: e("Biodiversity", "Bioloji Müxtəliflik"), description: e("Monoculture farms degrade biodiversity. Sustained local farms plant cover crops, maintain hedges, and build habitats for wild pollinators and birds.", "Monokultura təsərrüfatları biomüxtəlifliyi azaldır. Davamlı yerli fermalar örtük bitkiləri əkir, çəpərlər saxlayır və vəhşi tozlayıcılar və quşlar üçün yaşayış yerləri qurur.") },
          { title: e("Climate Resilience", "İqlim Dayanıqlılığı"), description: e("Farms with high organic matter are more resilient to extreme weather like droughts and heavy floods, securing local food supplies in a changing climate.", "Yüksək üzvi maddəyə malik təsərrüfatlar quraqlıq və daşqın kimi ekstremal hava şəraitinə qarşı daha dayanıqlıdır, dəyişən iqlimdə yerli qida təchizatını təmin edir.") }
        ]
      })
    },
    {
      key: "why_local_page",
      content: JSON.stringify({
        heroTitle: e("Why Local Sustainable Farming Matters", "Yerli Davamlı Kənd Təsərrüfatı Niyə Vacibdir"),
        heroSub: e("A deep dive into how changing our sourcing habits combats the climate crisis.", "Təchizat vərdişlərimizi dəyişdirməyin iqlim böhranı ilə necə mübarizə apardığına dair dərin araşdırma."),
        sections: [
          { id: "industrial", title: e("Reduced Dependence on Industrial Agriculture", "Sənaye Kənd Təsərrüfatından Asılılığın Azaldılması"), content: e("Industrial farming relies on heavy machinery, chemical fertilizers, and massive synthetic inputs. This chemical treadmill degrades the soil and pollutes waterways. Sourcing from local, regenerative farmers breaks this dependency cycle.", "Sənaye əkinçiliyi ağır maşınlara, kimyəvi gübrələrə və böyük sintetik maddələrə əsaslanır. Bu kimyəvi dövran torpağı deqradasiya edir və su yollarını çirkləndirir. Yerli, regenerativ fermerlərdən təchizat bu asılılıq dövrünü qırır.") },
          { id: "soils", title: e("Healthier Soils", "Daha Sağlam Torpaqlar"), content: e("Healthy soil functions like a sponge. By using cover crops, mulching, and natural composting, local sustainable farmers ensure their land retains moisture and nutrients. This drastically reduces the need for artificial irrigation and prevents soil erosion.", "Sağlam torpaq süngər kimi fəaliyyət göstərir. Örtük bitkiləri, malçlama və təbii kompostdan istifadə edərək, yerli davamlı fermerlər torpaqlarının nəm və qida maddələrini saxlamasını təmin edir. Bu, süni suvarma ehtiyacını kəskin şəkildə azaldır və torpaq eroziyasının qarşısını alır.") },
          { id: "chemicals", title: e("Reduced Chemical Use", "Kimyəvi Maddələrin Azaldılması"), content: e("Synthetic pesticides and herbicides run off into local rivers, killing aquatic ecosystems and beneficial insect populations. Sustainable farming practices leverage natural predators, crop rotation, and companion planting to manage pests without toxifying the environment.", "Sintetik pestisidlər və herbisidlər yerli çaylara axaraq su ekosistemlərini və faydalı həşərat populyasiyalarını məhv edir. Davamlı əkinçilik təcrübələri təbii yırtıcılardan, məhsul dövriyyəsindən və yoldaş əkindən istifadə edərək ətraf mühiti zəhərləmədən zərərvericiləri idarə edir.") },
          { id: "resilience", title: e("Climate Resilience", "İqlim Dayanıqlılığı"), content: e("Global supply chains are vulnerable to extreme climate events. By strengthening local agricultural production, we build community resilience. A region that can feed itself sustainably is highly robust against international crises.", "Qlobal təchizat zəncirləri ekstremal iqlim hadisələrinə qarşı həssasdır. Yerli kənd təsərrüfatı istehsalını gücləndirməklə, icma dayanıqlılığı qururuq. Özünü davamlı şəkildə qidalandıra bilən region beynəlxalq böhranlara qarşı yüksək dərəcədə davamlıdır.") }
        ]
      })
    },
    {
      key: "research_page",
      content: JSON.stringify({
        heroTitle: e("Research & Insights", "Araşdırma və Məlumatlar"),
        heroSub: e("Data-driven proof of how sustainable farming combats global warming.", "Davamlı əkinçiliyin qlobal istiləşmə ilə necə mübarizə apardığının məlumat əsaslı sübutu.")
      })
    },
    {
      key: "home_page",
      content: JSON.stringify({
        heroTag: e("Empowering Regenerative Azerbaijani Farms", "Azərbaycanın Regenerativ Fermalarını Gücləndiririk"),
        heroTitle: e("KendMart: Supporting Sustainable Farmers and Climate-Resilient Communities", "KendMart: Davamlı Fermerləri və İqlimə Davamlı Cəmiyyətləri Dəstəkləyir"),
        heroSub: e("Connecting consumers with local farmers while creating measurable environmental impact. Request fresh produce directly, regenerate soil health, and slash global food transport emissions.", "İstehlakçıları yerli fermerlərlə birləşdirərək ölçülə bilən ətraf mühit təsiri yaradırıq. Təzə məhsulları birbaşa sifariş edin, torpaq sağlamlığını bərpa edin və qlobal qida nəqliyyatı emissiyalarını azaldın."),
        farmerSectionTag: e("Our Directory", "Kataloqumuz"),
        farmerSectionTitle: e("Meet Our Local Farmers", "Yerli Fermerlərimizlə Tanış Olun"),
        missionSectionTag: e("Our Pillars", "Sütunlarımız"),
        missionSectionTitle: e("Connecting Consumers with Regenerative Systems", "İstehlakçıları Regenerativ Sistemlərlə Birləşdirmək"),
        missionSectionSub: e("We operate in support of local biological systems, providing a direct connection to farm stewards whose techniques actively combat climate degradation.", "Biz yerli bioloji sistemləri dəstəkləmək üçün fəaliyyət göstəririk, texnikaları iqlim deqradasiyası ilə fəal mübarizə aparan fermer idarəçiləri ilə birbaşa əlaqə təmin edirik."),
        missionCards: [
          { title: e("Sustainable Agriculture", "Davamlı Kənd Təsərrüfatı"), description: e("Supporting crops grown without synthetic chemical fertilizers or oil-based pesticides. Local organic farming reduces ecosystem pollution and chemical runoffs.", "Sintetik kimyəvi gübrələr və ya neft əsaslı pestisidlər olmadan yetişdirilən məhsulları dəstəkləyirik. Yerli üzvi əkinçilik ekosistem çirklənməsini və kimyəvi axıntıları azaldır.") },
          { title: e("Local Food Systems", "Yerli Qida Sistemləri"), description: e("By requesting products locally, we bypass carbon-heavy transcontinental shipping, cold chain cargo flights, and excessive plastic packaging.", "Məhsulları yerli sifariş etməklə, karbon ağırlıqlı transkontinental daşımaları, soyuq zəncir yük uçuşlarını və həddindən artıq plastik qablaşdırmanı keçirik.") },
          { title: e("Healthy Soils", "Sağlam Torpaqlar"), description: e("Living organic soil serves as a massive carbon sink. Active crop-rotation, cover crops, and compost feeding secure rich soil ecosystems that capture CO2.", "Canlı üzvi torpaq böyük bir karbon uducusu kimi xidmət edir. Aktiv məhsul dövriyyəsi, örtük bitkiləri və kompost qidalanması CO2 tutan zəngin torpaq ekosistemlərini təmin edir.") },
          { title: e("Biodiversity Protection", "Bioloji Müxtəlifliyin Qorunması"), description: e("Sustainable farms prevent monoculture stagnation. Planting diverse crops, flower strips, and hedges protects birds, bees, and essential wild pollinators.", "Davamlı təsərrüfatlar monokultura durğunluğunun qarşısını alır. Müxtəlif bitkilər, çiçək zolaqları və çəpərlər əkmək quşları, arıları və vacib vəhşi tozlayıcıları qoruyur.") },
          { title: e("Climate Resilience", "İqlim Dayanıqlılığı"), description: e("Ecosystem-driven farms hold 20% more moisture, preventing drought damage and erosion. This protects local food security as weather patterns shift.", "Ekosistem əsaslı təsərrüfatlar 20% daha çox nəm saxlayaraq quraqlıq zərərini və eroziyanı qarşısını alır. Bu, hava nümunələri dəyişdikcə yerli qida təhlükəsizliyini qoruyur.") },
          { title: e("Climate Metrics", "İqlim Metrikaları"), description: e("Every purchase request updates carbon reduction logs and supporter levels. Discover complete details in our analytics room.", "Hər bir satınalma sorğusu karbon azalması qeydlərini və dəstəkçi səviyyələrini yeniləyir. Analitika otağımızda tam təfərrüatları kəşf edin.") }
        ],
        howItWorksTag: e("Sourcing Cycle", "Təchizat Dövrü"),
        howItWorksTitle: e("Direct Request, Zero Waste Lifecycle", "Birbaşa Sifariş, Sıfır Tullantı Həyat Dövrü"),
        howItWorksSub: e("Understand our request-based loop. By cutting out standard commercial store packaging, middlemen logistics, and storage, we minimize agricultural waste.", "Sorğu əsaslı dövrümüzü anlayın. Standart kommersiya mağaza qablaşdırmasını, vasitəçi logistikasını və anbarı aradan qaldıraraq kənd təsərrüfatı tullantılarını minimuma endiririk."),
        steps: [
          { title: e("Submit Request", "Sorğu Göndərin"), description: e("Select a local farmer below and request specific products. No payment or cart is involved.", "Aşağıdan bir yerli fermer seçin və xüsusi məhsullar sifariş edin. Heç bir ödəniş və ya səbət daxil deyil.") },
          { title: e("Farmer Receives Request", "Fermer Sorğunu Alır"), description: e("The farmer receives your request directly and contacts you to organize logistics.", "Fermer sorğunuzu birbaşa alır və logistikanı təşkil etmək üçün sizinlə əlaqə saxlayır.") },
          { title: e("Local Agriculture Supported", "Yerli Kənd Təsərrüfatı Dəstəklənir"), description: e("By purchasing directly, farmers earn fair wages without paying retail distribution fees.", "Birbaşa satın almaqla, fermerlər pərakəndə distribusiya haqları ödəmədən ədalətli əmək haqqı qazanırlar.") },
          { title: e("Climate Impact Increases", "İqlim Təsiri Artır"), description: e("Your request earns impact points, increases your supporter level, and slashes global food miles.", "Sorğunuz təsir xalları qazandırır, dəstəkçi səviyyənizi artırır və qlobal qida millərini azaldır.") }
        ]
      })
    },
    {
      key: "dashboard_page",
      content: JSON.stringify({
        headerTag: e("Live Climate Room", "Canlı İqlim Otağı"),
        headerTitle: e("Climate Impact Dashboard", "İqlim Təsir Paneli"),
        headerSub: e("Support a local farmer and increase your impact score.", "Yerli bir fermeri dəstəkləyin və təsir balınızı artırın."),
        levels: [
          { name: e("Seed Supporter", "Toxum Dəstəkçisi"), points: 0, emoji: "🌱", desc: e("You have started planting the seeds of change by requesting local crops.", "Yerli məhsullar sifariş edərək dəyişiklik toxumlarını əkməyə başlamısınız.") },
          { name: e("Green Supporter", "Yaşıl Dəstəkçi"), points: 50, emoji: "🌿", desc: e("Active soil supporter. You help farmers restore chemical-free organic land.", "Aktiv torpaq dəstəkçisi. Fermerlərin kimyəvisiz üzvi torpağı bərpa etməsinə kömək edirsiniz.") },
          { name: e("Climate Friend", "İqlim Dostu"), points: 150, emoji: "🌎", desc: e("Your choices have slashed significant global transport carbon emissions.", "Seçimləriniz əhəmiyyətli qlobal nəqliyyat karbon emissiyalarını azaldıb.") },
          { name: e("Climate Champion", "İqlim Çempionu"), points: 350, emoji: "🏆", desc: e("Regenerative champion! Your consistent direct requests protect local biodiversity.", "Regenerativ çempion! Ardıcıl birbaşa sorğularınız yerli biomüxtəlifliyi qoruyur.") },
          { name: e("Earth Guardian", "Yer Qoruyucusu"), points: 600, emoji: "🌳", desc: e("True environmental guardian. You lead the transition to localized agricultural resilience.", "Həqiqi ətraf mühit qoruyucusu. Yerli kənd təsərrüfatı dayanıqlılığına keçidə rəhbərlik edirsiniz.") }
        ],
        supporterStatusLabel: e("Your Supporter Status", "Dəstəkçi Statusunuz"),
        progressLabel: e("Progress to", "İrəliləmə"),
        productsRequestedLabel: e("Products Requested", "Sifariş Edilən Məhsullar"),
        farmersSupportedLabel: e("Farmers Supported", "Dəstəklənən Fermerlər"),
        carbonSavedLabel: e("Carbon Saved", "Qənaət Edilən Karbon"),
        maxLevelLabel: e("Max level achieved", "Maksimum səviyyə əldə edildi"),
        pointsLabel: e("Points", "Xallar"),
        unlockLabel: e("Request more local products to unlock", "Açmaq üçün daha çox yerli məhsul sifariş edin"),
        eachItemLabel: e("Each item earns points!", "Hər maddə xal qazandırır!"),
        supporterTierLabel: e("Supporter Tiers", "Dəstəkçi Səviyyələri"),
        ptsSuffix: e("+ pts", "+ xal"),
        activeStatusLabel: e("Active Status", "Aktiv Status"),
        topProductsTitle: e("Top Sourced Products", "Ən Çox Təchiz Edilən Məhsullar"),
        topProductsSub: e("Quantity of requests by item type", "Maddə növünə görə sorğu miqdarı"),
        impactFormulaTitle: e("Estimated Carbon Reduction Metric", "Təxmini Karbon Azaltma Metriki"),
        impactFormulaText: e("Each food request localizes supply chains. We assume each impact point averages 0.002 tonnes (or 2 kg) of greenhouse gas emissions avoided by bypassing shipping imports and refrigeration chains.", "Hər bir qida sorğusu təchizat zəncirlərini lokallaşdırır. Hər bir təsir nöqtəsinin daşınma idxalı və soyuducu zəncirləri keçməklə qarşısı alınan orta hesabla 0.002 ton (və ya 2 kq) istixana qazı emissiyası olduğunu qəbul edirik."),
        calculatedOffsetLabel: e("Calculated Offset", "Hesablanmış Kompensasiya"),
        totalSavingsLabel: e("Total Greenhouse Savings", "Ümumi İstixana Qənaəti"),
        tonnesLabel: e("Tonnes CO2", "Ton CO2"),
        treesMatchLabel: e("mature trees absorbing carbon for a year", "bir il ərzində karbon udan yetkin ağaclar"),
        researchLinkTitle: e("Research & Insights", "Araşdırma və Məlumatlar"),
        researchLinkSub: e("Explore published datasets, charts, and climate analytics tracking our environmental impact and regenerative agriculture metrics.", "Ətraf mühit təsirimizi və regenerativ kənd təsərrüfatı göstəricilərimizi izləyən nəşr olunmuş məlumat dəstlərini, qrafikləri və iqlim analitikasını kəşf edin."),
        impactPointsLabel: e("Impact Points", "Təsir Xalları"),
        requestsSavedLabel: e("Requests Saved", "Qeydə Alınan Sorğular"),
        activeFarmersLabel: e("Active Farmers", "Aktiv Fermerlər"),
        co2ReducedLabel: e("Est. CO2 Reduced", "Təx. CO2 Azaldılması")
      })
    }
  ];

  for (const page of pages) {
    await prisma.pageContent.create({ data: page });
  }

  // Default settings
  const defaultSettings = [
    { key: "total_impact_points", value: "0" },
    { key: "farmers_featured", value: "0" },
    { key: "purchase_requests", value: "0" },
    { key: "estimated_climate_impact", value: "0.0" },
    { key: "survey_link", value: "" }
  ];

  for (const s of defaultSettings) {
    await prisma.setting.create({ data: s });
  }

  // Default impact maps
  const defaultImpactMaps = [
    { product: "Honey", points: 15 },
    { product: "Eggs", points: 10 },
    { product: "Tomatoes", points: 8 },
    { product: "Potatoes", points: 5 },
    { product: "Apples", points: 8 },
    { product: "Milk", points: 8 },
    { product: "Cheese", points: 12 },
    { product: "Chicken", points: 6 }
  ];

  for (const m of defaultImpactMaps) {
    await prisma.impactMap.create({ data: m });
  }

  console.log("Database seeded successfully.");
}

seedIfEmpty().catch(err => {
  console.error("Seed failed:", err);
});

export const db = {
  farmer: {
    findMany: (args) => prisma.farmer.findMany({ ...args, orderBy: { createdAt: 'desc' } }),
    findUnique: (args) => prisma.farmer.findUnique(args),
    create: (args) => prisma.farmer.create(args),
    update: (args) => prisma.farmer.update(args),
    delete: (args) => prisma.farmer.delete(args)
  },
  request: {
    findMany: () => prisma.request.findMany({ orderBy: { createdAt: 'desc' } }),
    create: (args) => prisma.request.create(args),
    update: (args) => prisma.request.update(args),
    delete: (args) => prisma.request.delete(args)
  },
  setting: {
    findMany: () => prisma.setting.findMany(),
    findUnique: (args) => prisma.setting.findUnique(args),
    upsert: (args) => prisma.setting.upsert(args)
  },
  impactMap: {
    findMany: () => prisma.impactMap.findMany(),
    findUnique: (args) => prisma.impactMap.findUnique(args),
    upsert: (args) => prisma.impactMap.upsert(args),
    delete: (args) => prisma.impactMap.delete(args)
  },
  article: {
    findMany: () => prisma.article.findMany({ orderBy: { createdAt: 'desc' } }),
    findUnique: (args) => prisma.article.findUnique(args),
    create: (args) => prisma.article.create(args),
    update: (args) => prisma.article.update(args),
    delete: (args) => prisma.article.delete(args)
  },
  pageContent: {
    findMany: () => prisma.pageContent.findMany(),
    findUnique: (args) => prisma.pageContent.findUnique(args),
    upsert: (args) => prisma.pageContent.upsert(args)
  },
  listing: {
    findMany: (args) => prisma.listing.findMany({ ...args, orderBy: { createdAt: 'desc' } }),
    findUnique: (args) => prisma.listing.findUnique(args),
    create: (args) => prisma.listing.create(args),
    update: (args) => prisma.listing.update(args),
    delete: (args) => prisma.listing.delete(args)
  },
  user: {
    findMany: () => prisma.user.findMany(),
    findUnique: (args) => prisma.user.findUnique(args),
    create: (args) => prisma.user.create(args),
    update: (args) => prisma.user.update(args)
  },
  dataset: {
    findMany: (args) => prisma.dataset.findMany({ ...args, orderBy: { createdAt: 'desc' } }),
    findUnique: (args) => prisma.dataset.findUnique(args),
    create: (args) => prisma.dataset.create(args),
    update: (args) => prisma.dataset.update(args),
    delete: (args) => prisma.dataset.delete(args)
  },
  savedListing: {
    findMany: (args) => prisma.savedListing.findMany(args),
    create: (args) => prisma.savedListing.create(args),
    delete: (args) => prisma.savedListing.delete(args),
    deleteMany: (args) => prisma.savedListing.deleteMany(args)
  },
  admin: {
    findUnique: (args) => prisma.admin.findUnique(args),
    findMany: () => prisma.admin.findMany(),
    create: (args) => prisma.admin.create(args),
    update: (args) => prisma.admin.update(args)
  },
  credit: {
    findMany: () => prisma.credit.findMany({ orderBy: { createdAt: 'desc' } }),
    create: (args) => prisma.credit.create(args),
    update: (args) => prisma.credit.update(args),
    delete: (args) => prisma.credit.delete(args)
  },
  listingAnswer: {
    findMany: (args) => prisma.listingAnswer.findMany(args),
    findUnique: (args) => prisma.listingAnswer.findUnique(args),
    create: (args) => prisma.listingAnswer.create(args),
    deleteMany: (args) => prisma.listingAnswer.deleteMany(args)
  },
  faqCategory: {
    findMany: (args) => prisma.faqCategory.findMany({ ...args, orderBy: { order: 'asc' } }),
    create: (args) => prisma.faqCategory.create(args),
    update: (args) => prisma.faqCategory.update(args),
    delete: (args) => prisma.faqCategory.delete(args)
  },
  faqQuestion: {
    findMany: (args) => prisma.faqQuestion.findMany({ ...args, orderBy: { order: 'asc' } }),
    create: (args) => prisma.faqQuestion.create(args),
    update: (args) => prisma.faqQuestion.update(args),
    delete: (args) => prisma.faqQuestion.delete(args),
    deleteMany: (args) => prisma.faqQuestion.deleteMany(args)
  },
  review: {
    findMany: (args) => prisma.review.findMany({ ...args, orderBy: { createdAt: 'desc' } }),
    findUnique: (args) => prisma.review.findUnique(args),
    create: (args) => prisma.review.create(args),
    update: (args) => prisma.review.update(args),
    delete: (args) => prisma.review.delete(args),
    count: (args) => prisma.review.count(args)
  }
};
