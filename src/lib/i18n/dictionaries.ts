import type { Locale } from "@/lib/i18n/locale";

const en = {
  metaTitle: "Sarf — Libyan dinar rates",
  metaDescription:
    "A bilingual desk for the Libyan dinar: licensed official reference rates beside a clearly labeled parallel-market sample.",
  kicker: "Tripoli desk",
  nav: { rates: "Rates", method: "Method", api: "API", admin: "Entry" },
  languageLabel: "Language",
  heroEyebrow: "Official reference",
  parallelEyebrow: "Parallel illustration",
  sampleStamp: "Sample",
  perUnit: "LYD per 1",
  perLyd: "1 LYD buys",
  premium: "Parallel premium",
  asOf: "As of",
  derived: "Crossed from the publisher’s own file",
  direct: "Published figure",
  missingOfficial: "No official row for this currency in the selected source.",
  missingParallel: "No parallel row for this currency in the selected source.",
  ranges: { "1y": "1 year", "2y": "2 years", all: "All" },
  series: { official: "Official reference", parallel: "Parallel" },
  chartTitle: "Official reference against the parallel series",
  chartCaption: "Time runs left to right. The table below has the same figures.",
  table: { date: "Date", official: "Official", parallel: "Parallel", gap: "Gap (LYD)", premium: "Premium" },
  switches: { official: "Official source", parallel: "Parallel source" },
  providers: {
    hmrc: "HMRC monthly",
    treasury: "US Treasury",
    manual: "Manual entry",
    "cbl-feed": "CBL feed",
    sample: "Sample",
  },
  emptyTitle: "No rates in the database yet",
  emptyBody: "Start Postgres, then run npm run setup. Demo mode needs no API keys.",
  offlineTitle: "The database is not reachable",
  offlineBody: "Check DATABASE_URL and that PostgreSQL is running.",
  runs: "Recent ingestion",
  footerCredit: "Built by Maeen Alganimi in Tripoli.",
  footerOgl: "Contains public sector information licensed under the Open Government Licence v3.0.",
  footerTreasury: "U.S. Treasury reporting rates are free to copy, adapt, and redistribute.",
  footerSample: "Parallel rows marked Sample are synthetic. They are not a market quotation.",
  footerCbl: "The Central Bank of Libya publishes the domestic fixing. Sarf does not scrape that page.",
  methodTitle: "How the two lines are made",
  methodLede:
    "Libya’s domestic fixing and the street rate are different numbers. This desk refuses to pretend a scraped page or an unlabeled seed is either of them.",
  docsTitle: "Rates API",
  docsLede: "Public JSON for the latest fixing, history, and the official-versus-parallel premium. Quotes are dinars per 1 unit of foreign currency.",
  docsSpec: "OpenAPI document",
  adminTitle: "Record a rate",
  adminLede:
    "Type a figure you are allowed to keep: a Central Bank of Libya fixing you read yourself, or a parallel quote from a source whose terms permit it. Manual rows never replace the sample series; choose Manual on the chart to see them.",
  adminDemo: "Demo mode accepts the bearer token demo-admin until you set ADMIN_TOKEN and turn DEMO_MODE off.",
  adminToken: "Bearer token",
  adminCurrency: "Currency",
  adminDate: "Date",
  adminKind: "Kind",
  adminKindOfficial: "Official",
  adminKindParallel: "Parallel",
  adminRate: "LYD per 1 unit",
  adminNote: "Note",
  adminSubmit: "Save rate",
  adminSaving: "Saving",
  adminSaved: "Saved.",
  adminRecent: "Recent manual rows",
  adminNone: "No manual rows yet.",
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  method: [
    {
      title: "What the chart compares",
      body: [
        "The green line is an official reference: a rate published by a public body whose licence allows this reuse. The copper line is the parallel series. In the demo that line is a sample, stamped as such on the page, in the API (isSample: true), and in the database.",
        "A higher number means a weaker dinar: more dinars for one dollar. The premium is (parallel − official) / official.",
      ],
    },
    {
      title: "Why this is not a scrape of the Central Bank of Libya",
      body: [
        "The Central Bank of Libya publishes buy, sell, and average rates on cbl.gov.ly. That page is the right place to read the domestic fixing. The bank’s developer portal documents payment systems for licensed institutions, not a public exchange-rate API. No reuse licence is published for the rate table. A coverage audit of the Frankfurter project marks Libya as restricted. robots.txt does not disallow the page, and that is not permission to copy it.",
        "Sarf therefore does not fetch cbl.gov.ly. An operator can type a fixing into Entry, or point CBL_FEED_URL at a JSON feed they are allowed to store. Those rows are labeled manual or cbl-feed, never inferred.",
      ],
    },
    {
      title: "HMRC, under the Open Government Licence",
      body: [
        "The primary series is HM Revenue & Customs’ monthly exchange rates, retrieved as XML from the UK Trade Tariff service. The Open Government Licence v3.0 allows copying, adaptation, and commercial use with attribution.",
        "HMRC quotes foreign currency per 1 pound sterling. Sterling against the dinar is stored as published. Every other currency is crossed inside this app: LYD per 1 unit = (LYD per GBP) / (units of that currency per GBP), using only the two figures in the same monthly file. Derived rows are flagged isDerived.",
      ],
    },
    {
      title: "U.S. Treasury, unrestricted",
      body: [
        "The quarterly corroborating series comes from the Treasury Fiscal Data API, endpoint rates_of_exchange. The Bureau of the Fiscal Service offers that data free, without restriction, to copy, adapt, and redistribute for any purpose.",
        "Libya-Dinar is already dinars per dollar. The other five currencies are crossed from the same quarter’s reporting rates and flagged as derived. Switch the official source to US Treasury to plot it. It will not match HMRC on the same day, because one is a monthly customs rate and the other is a quarterly reporting rate.",
      ],
    },
    {
      title: "The parallel sample",
      body: [
        "No parallel-market publisher was found whose terms allow redistribution. Sarf does not scrape street-rate sites. The demo series is generated by applying a repeating monthly premium to the HMRC rate for that month, then rounding half up to 4 decimal places. The premium depends only on the calendar month:",
      ],
    },
    {
      title: "Sources that were read and not ingested",
      body: [
        "Frankfurter redistributes many central banks and is free to call, but its blended LYD rate is Frankfurter’s own calculation, and some banks it carries forbid republication. The Central Bank of Kuwait’s disclaimer limits reuse to personal use and requires written permission for anything public. It is not used.",
        "The IMF’s statistical licence allows reuse with attribution, including derivatives that are disclosed. Its current API expects an account, and the Frankfurter IMF provider did not return LYD on the day this was checked, so IMF data is not in the pipeline. The European Commission’s InforEuro rates are under CC BY 4.0 and were left out to avoid a third monthly series that duplicates HMRC. The exchange-api dataset is published under CC0 and does include LYD, but it is an aggregated feed rather than a primary official publication, so it is not stored as the official line and it is not a parallel quote.",
      ],
    },
  ],
};

const ar = {
  metaTitle: "صرف — أسعار الدينار الليبي",
  metaDescription: "مكتب ثنائي اللغة للدينار الليبي: أسعار مرجعية رسمية بترخيص واضح، وإلى جانبها عينة معلّمة لسعر السوق الموازية.",
  kicker: "مكتب طرابلس",
  nav: { rates: "الأسعار", method: "المنهج", api: "الواجهة", admin: "الإدخال" },
  languageLabel: "اللغة",
  heroEyebrow: "مرجع رسمي",
  parallelEyebrow: "رسم للسوق الموازية",
  sampleStamp: "عينة",
  perUnit: "دينار مقابل 1",
  perLyd: "الدينار الواحد يشتري",
  premium: "علاوة السوق الموازية",
  asOf: "بتاريخ",
  derived: "محسوب من ملف الناشر نفسه",
  direct: "رقم منشور",
  missingOfficial: "لا يوجد سعر رسمي لهذه العملة في المصدر المختار.",
  missingParallel: "لا يوجد سعر موازٍ لهذه العملة في المصدر المختار.",
  ranges: { "1y": "سنة", "2y": "سنتان", all: "الكل" },
  series: { official: "المرجع الرسمي", parallel: "الموازي" },
  chartTitle: "المرجع الرسمي مقابل السلسلة الموازية",
  chartCaption: "الزمن يسير من اليسار إلى اليمين. الجدول أسفل الرسم يحمل الأرقام نفسها.",
  table: { date: "التاريخ", official: "الرسمي", parallel: "الموازي", gap: "الفرق (دينار)", premium: "العلاوة" },
  switches: { official: "المصدر الرسمي", parallel: "المصدر الموازي" },
  providers: {
    hmrc: "شهري — الهيئة البريطانية",
    treasury: "الخزانة الأمريكية",
    manual: "إدخال يدوي",
    "cbl-feed": "تغذية المصرف",
    sample: "عينة",
  },
  emptyTitle: "لا توجد أسعار في قاعدة البيانات بعد",
  emptyBody: "شغّل Postgres ثم npm run setup. وضع التجربة لا يحتاج مفاتيح.",
  offlineTitle: "تعذّر الاتصال بقاعدة البيانات",
  offlineBody: "تحقق من DATABASE_URL ومن أن PostgreSQL يعمل.",
  runs: "آخر عمليات الجلب",
  footerCredit: "بناه معين الغنيمي في طرابلس.",
  footerOgl: "يتضمن معلومات من القطاع العام البريطاني بترخيص الحكومة المفتوحة الإصدار 3.0.",
  footerTreasury: "أسعار الإبلاغ لوزارة الخزانة الأمريكية متاحة للنسخ والتعديل وإعادة النشر.",
  footerSample: "الصفوف الموازية المعلّمة «عينة» تركيبية. ليست تسعير سوق.",
  footerCbl: "ينشر مصرف ليبيا المركزي التثبيت المحلي. صرف لا يجمع بيانات تلك الصفحة.",
  methodTitle: "كيف تُصنع الخطوط",
  methodLede: "تثبيت المصرف المركزي وسعر الشارع رقمان مختلفان. هذا المكتب لا يقدّم صفحة مُجمَّعة أو بذرة بلا وسم على أنهما أحدهما.",
  docsTitle: "واجهة الأسعار",
  docsLede: "JSON عام لآخر سعر، وللسجل، ولعلاوة الرسمي مقابل الموازي. التسعير بالدينار مقابل وحدة واحدة من العملة الأجنبية.",
  docsSpec: "وثيقة OpenAPI",
  adminTitle: "تسجيل سعر",
  adminLede:
    "اكتب رقمًا يحق لك الاحتفاظ به: تثبيتًا قرأته بنفسك من مصرف ليبيا المركزي، أو سعرًا موازيًا يسمح مصدره بذلك. الإدخال اليدوي لا يستبدل سلسلة العينة؛ اختر «إدخال يدوي» في الرسم لرؤيته.",
  adminDemo: "وضع التجربة يقبل الرمز demo-admin إلى أن تضبط ADMIN_TOKEN وتوقف DEMO_MODE.",
  adminToken: "رمز الدخول",
  adminCurrency: "العملة",
  adminDate: "التاريخ",
  adminKind: "النوع",
  adminKindOfficial: "رسمي",
  adminKindParallel: "موازي",
  adminRate: "دينار مقابل وحدة واحدة",
  adminNote: "ملاحظة",
  adminSubmit: "حفظ السعر",
  adminSaving: "جارٍ الحفظ",
  adminSaved: "حُفظ.",
  adminRecent: "آخر الإدخالات اليدوية",
  adminNone: "لا توجد إدخالات يدوية بعد.",
  months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  method: [
    {
      title: "ماذا يقارن الرسم",
      body: [
        "الخط الأخضر مرجع رسمي: سعر نشرته جهة عامة يسمح ترخيصها بهذا الاستعمال. الخط النحاسي هو السلسلة الموازية. في التجربة هذه السلسلة عينة، ومختومة بذلك في الصفحة وفي الواجهة (isSample: true) وفي قاعدة البيانات.",
        "الرقم الأعلى يعني دينارًا أضعف: دنانير أكثر مقابل دولار واحد. العلاوة هي (الموازي − الرسمي) / الرسمي.",
      ],
    },
    {
      title: "لماذا لا نجمع صفحة مصرف ليبيا المركزي",
      body: [
        "ينشر مصرف ليبيا المركزي أسعار الشراء والبيع والمتوسط على موقعه. تلك الصفحة هي المكان الصحيح لقراءة التثبيت المحلي. بوابة المطوّرين توثّق أنظمة دفع للمؤسسات المرخّصة، لا واجهة عامة لأسعار الصرف. لا يوجد ترخيص إعادة استخدام منشور لجدول الأسعار. وتشير مراجعة تغطية مشروع Frankfurter إلى أن ليبيا مقيّدة. ملف robots.txt لا يمنع الصفحة، وهذا ليس إذنًا بنسخها.",
        "لذلك لا يطلب صرف صفحة cbl.gov.ly. يستطيع المشغّل كتابة التثبيت في صفحة الإدخال، أو توجيه CBL_FEED_URL إلى تغذية JSON يحق له تخزينها. تُوسَم تلك الصفوف manual أو cbl-feed، ولا تُستنتج.",
      ],
    },
    {
      title: "هيئة الإيرادات البريطانية وترخيص الحكومة المفتوحة",
      body: [
        "السلسلة الأساسية هي أسعار الصرف الشهرية لهيئة الإيرادات والجمارك البريطانية، بصيغة XML من خدمة التعرفة التجارية البريطانية. ترخيص الحكومة المفتوحة الإصدار 3.0 يسمح بالنسخ والتعديل والاستعمال التجاري مع الإسناد.",
        "الهيئة تسعر العملة الأجنبية مقابل جنيه إسترليني واحد. يُحفظ سعر الدينار مقابل الإسترليني كما نُشر. وتُحسب بقية العملات داخل التطبيق: الدينار مقابل وحدة واحدة = (الدينار مقابل الإسترليني) / (وحدات تلك العملة مقابل الإسترليني)، من الرقمين في الملف الشهري نفسه. الصفوف المحسوبة تحمل العلامة isDerived.",
      ],
    },
    {
      title: "الخزانة الأمريكية بلا قيد",
      body: [
        "السلسلة الفصلية المساندة تأتي من واجهة بيانات المالية العامة للخزانة، المسار rates_of_exchange. المكتب المالي يتيح هذه البيانات مجانًا وبلا قيد للنسخ والتعديل وإعادة النشر لأي غرض.",
        "«Libya-Dinar» هو أصلًا دنانير مقابل دولار. والعملات الخمس الأخرى تُحسب من أسعار الإبلاغ للربع نفسه وتُعلَّم بأنها مشتقة. بدّل المصدر الرسمي إلى الخزانة الأمريكية لرسمها. لن تطابق سلسلة الهيئة في اليوم نفسه، لأن إحداهما سعر جمركي شهري والأخرى سعر إبلاغ فصلي.",
      ],
    },
    {
      title: "عينة السوق الموازية",
      body: [
        "لم يُعثر على ناشر لسعر السوق الموازية يسمح ترخيصه بإعادة النشر. صرف لا يجمع مواقع أسعار الشارع. سلسلة التجربة تُولَّد بتطبيق علاوة شهرية متكررة على سعر الهيئة لذلك الشهر، ثم التقريب إلى أربع خانات. العلاوة تعتمد على شهر التقويم فقط:",
      ],
    },
    {
      title: "مصادر قُرئت ولم تُدخَل",
      body: [
        "يعيد Frankfurter نشر أسعار مصارف مركزية كثيرة ويمكن طلبه مجانًا، لكن سعره الممزوج للدينار حساب خاص به، وبعض المصارف التي يحملها تمنع إعادة النشر. إخلاء مسؤولية بنك الكويت المركزي يقصر الاستعمال على الاستخدام الشخصي ويشترط إذنًا كتابيًا لأي استعمال عام. لم يُستخدم.",
        "ترخيص إحصاءات صندوق النقد يسمح بإعادة الاستعمال مع الإسناد، بما في ذلك المشتقات إذا أُفصِح عنها. واجهته الحالية تتوقع حسابًا، ومزوّد الصندوق لدى Frankfurter لم يُرجع الدينار في يوم الفحص، لذا بيانات الصندوق ليست في المسار. أسعار InforEuro للمفوضية الأوروبية تحت رخصة CC BY 4.0 وتُركت لتفادي سلسلة شهرية ثالثة تكرر الهيئة البريطانية. مجموعة exchange-api منشورة تحت CC0 وتتضمن الدينار، لكنها تغذية مجمّعة لا نشرة رسمية أولية، فلا تُحفظ كخط رسمي وليست سعرًا موازيًا.",
      ],
    },
  ],
};

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
