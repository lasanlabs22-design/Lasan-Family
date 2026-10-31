import { BedDouble, ChefHat, CookingPot, Salad, Shirt, Sparkles, SprayCan, type LucideIcon } from "lucide-react";

export const unsplash = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=80`;

export const CITY = { name: "Tirupati", state: "Andhra Pradesh" } as const;

// Localities we currently serve. Anything outside goes to the waitlist.
export const AREAS = [
  "Balaji Colony",
  "Korlagunta",
  "Tiruchanur",
  "Alipiri",
  "Bhavani Nagar",
  "KT Road",
  "Tilak Road",
  "MR Palli",
  "Akkarampalli",
  "SV University area",
  "Gandhi Road",
  "Air Bypass Road",
  "Srinivasapuram",
  "Leela Mahal Circle",
  "Renigunta Road",
];

export const IMG = {
  elder: "1560885673-4e2f056f6e2a",
  elderYellow: "1774437790863-88a80bca5b29",
  elderLaugh: "1580471260026-2a8acbc7c7a7",
  elderReading: "1641749631692-44ad83f07ced",
  maidAtWork: "1722176413519-7bbf587f9ea9",
  laundry: "1722176413255-537269cf2ba8",
  livingRoom: "1787390629829-abb32b3025c5",
  liveIn: "1463335361701-e90f4c5045d0",
  rotiOnStove: "1786640442878-0c216561af21",
  chapati: "1600935926387-12d9b03066f0",
  idli: "1589301760014-d929f3979dbc",
  dosa: "1668236543090-82eba5ee5976",
  bananaLeafMeal: "1625398407796-82650a8c135f",
  thali: "1742281257687-092746ad6021",
  tirupatiCity: "1623039003809-6ecabd1e2b1c",
  tirumalaTemple: "1741003412854-bd4b264c4af3",
} as const;

export type Category = "maid" | "cook";
export type Need = Category | "both";

export const NEEDS: { id: Need; label: string; short: string; blurb: string; image: string; tint: string }[] = [
  {
    id: "maid",
    label: "Home help",
    short: "Maids",
    blurb: "A spotless home without lifting a finger: sweeping, mopping, vessels, laundry and a fresh bed, done the way Amma likes it.",
    image: IMG.maidAtWork,
    tint: "from-lilac-100 to-blush-50",
  },
  {
    id: "cook",
    label: "Home cooking",
    short: "Cooks",
    blurb: "Fresh Andhra-style meals in her own kitchen, from pappu and rasam to soft chapatis, made to her taste and her diet.",
    image: IMG.rotiOnStove,
    tint: "from-peach-100 to-blush-50",
  },
  {
    id: "both",
    label: "Both together",
    short: "Help + cooking",
    blurb: "One trusted pair who know her home and her routine: a maid and a cook working together every day.",
    image: IMG.elderYellow,
    tint: "from-sage-100 to-cream",
  },
];

export type Service = {
  id: string;
  name: string;
  short: string;
  description: string;
  category: Category;
  icon: LucideIcon;
  price: number;
  unit: string;
  image: string;
  includes: string[];
};

export const SERVICES: Service[] = [
  {
    id: "daily-maid",
    name: "Daily maid",
    short: "Sweeping, mopping, dusting, vessels and a made bed, every day.",
    description:
      "The same verified helper arrives at the same time every day to sweep, mop, dust, wash the vessels and tidy up. She learns how the home works, so she never needs reminding.",
    category: "maid",
    icon: Sparkles,
    price: 199,
    unit: "visit",
    image: IMG.maidAtWork,
    includes: ["Sweep & mop", "Dusting & tidying", "Vessels & kitchen wipe", "Bed making"],
  },
  {
    id: "daily-cook",
    name: "Daily home cook",
    short: "Fresh lunch and dinner cooked at home, to her taste.",
    description:
      "A home cook prepares fresh lunch and dinner in her kitchen, from pappu, rasam and curd rice to soft chapatis and her favourite curry. The menu is planned together each week.",
    category: "cook",
    icon: ChefHat,
    price: 299,
    unit: "day",
    image: IMG.rotiOnStove,
    includes: ["Lunch & dinner", "Weekly menu plan", "Andhra & South Indian", "Kitchen left clean"],
  },
  {
    id: "laundry",
    name: "Laundry & ironing",
    short: "Washed, dried, folded and ironed, then put away.",
    description:
      "Clothes, bedsheets and towels are washed, dried, ironed and put back where they belong. Silk and cotton sarees are washed gently by hand.",
    category: "maid",
    icon: Shirt,
    price: 149,
    unit: "visit",
    image: IMG.laundry,
    includes: ["Machine or hand wash", "Drying & folding", "Ironing", "Saree care"],
  },
  {
    id: "diet-cook",
    name: "Diet-specific meals",
    short: "Diabetic-friendly, low-salt, soft-food or no onion-garlic cooking.",
    description:
      "Cooks trained in diet-aware cooking make meals that follow her doctor's advice and still taste like home: ragi sangati, millet rotis, low-salt pappu and soft idlis.",
    category: "cook",
    icon: Salad,
    price: 349,
    unit: "day",
    image: IMG.idli,
    includes: ["Diabetic-friendly", "Low salt & oil", "Soft-food options", "No onion-garlic"],
  },
  {
    id: "deep-cleaning",
    name: "Deep cleaning",
    short: "Top-to-bottom clean of kitchen, bathrooms and every corner.",
    description:
      "A two-person team scrubs the kitchen, bathrooms, fans, windows and pooja room. Perfect before Sankranti, Ugadi or when family visits.",
    category: "maid",
    icon: SprayCan,
    price: 1499,
    unit: "home",
    image: IMG.livingRoom,
    includes: ["Kitchen degreasing", "Bathroom scrub", "Fans & windows", "Pooja room care"],
  },
  {
    id: "occasion-cook",
    name: "Festive & guest cooking",
    short: "A cook for festivals, poojas, birthdays and family visits.",
    description:
      "When the family comes home, she shouldn't be in the kitchen. Book a cook for a festival feast on banana leaf, pooja prasadam or a big Sunday lunch.",
    category: "cook",
    icon: CookingPot,
    price: 999,
    unit: "occasion",
    image: IMG.bananaLeafMeal,
    includes: ["Festive menus", "Up to 15 guests", "Prasadam & sweets", "Serving help"],
  },
  {
    id: "live-in-maid",
    name: "Live-in maid",
    short: "Full-time help who stays at home and keeps her company.",
    description:
      "A live-in helper takes care of the whole house and is around through the day and night. Replacement cover is included for her days off.",
    category: "maid",
    icon: BedDouble,
    price: 12999,
    unit: "month",
    image: IMG.liveIn,
    includes: ["All household chores", "Day & night presence", "Days-off cover", "Monthly review"],
  },
];

export type Caregiver = {
  id: string;
  name: string;
  role: string;
  serviceId: string;
  category: Category;
  years: number;
  rating: number;
  reviews: number;
  languages: string[];
  image: string;
  rate: number;
  unit: string;
  bio: string;
};

export const CAREGIVERS: Caregiver[] = [
  {
    id: "lakshmi",
    name: "Lakshmi K.",
    role: "Home cook · Andhra meals",
    serviceId: "daily-cook",
    category: "cook",
    years: 12,
    rating: 4.9,
    reviews: 214,
    languages: ["Telugu", "Tamil"],
    image: "1622461828382-57a6f4590e0f",
    rate: 329,
    unit: "day",
    bio: "Her pesarattu and tomato pappu are loved by every family she cooks for. Knows low-salt cooking well.",
  },
  {
    id: "padma",
    name: "Padma R.",
    role: "Daily maid",
    serviceId: "daily-maid",
    category: "maid",
    years: 8,
    rating: 4.9,
    reviews: 186,
    languages: ["Telugu", "Hindi"],
    image: "1533128361669-69c065857a13",
    rate: 219,
    unit: "visit",
    bio: "Punctual to the minute and very thorough. Elderly clients in Balaji Colony love her warmth.",
  },
  {
    id: "saraswathi",
    name: "Saraswathi M.",
    role: "Live-in maid",
    serviceId: "live-in-maid",
    category: "maid",
    years: 6,
    rating: 4.9,
    reviews: 97,
    languages: ["Telugu", "Kannada"],
    image: "1463335361701-e90f4c5045d0",
    rate: 13499,
    unit: "month",
    bio: "Calm and caring. Runs the whole house and sends the family a short note every evening.",
  },
  {
    id: "kalyani",
    name: "Kalyani S.",
    role: "Home cook · Diabetic-friendly",
    serviceId: "diet-cook",
    category: "cook",
    years: 9,
    rating: 5.0,
    reviews: 132,
    languages: ["Telugu", "English"],
    image: "1596522868222-0df01d62b628",
    rate: 379,
    unit: "day",
    bio: "Trained in diabetic cooking. Her ragi sangati and millet rotis turn diet charts into meals people enjoy.",
  },
  {
    id: "sujatha",
    name: "Sujatha V.",
    role: "Deep-cleaning specialist",
    serviceId: "deep-cleaning",
    category: "maid",
    years: 7,
    rating: 4.8,
    reviews: 118,
    languages: ["Telugu", "Tamil"],
    image: "1777726168469-6050899044ba",
    rate: 1599,
    unit: "home",
    bio: "Leads a two-person team and always uses gentle, odour-free products that are safe for elders.",
  },
  {
    id: "annapurna",
    name: "Annapurna D.",
    role: "Home cook · Festive specialist",
    serviceId: "occasion-cook",
    category: "cook",
    years: 10,
    rating: 4.9,
    reviews: 89,
    languages: ["Telugu", "Hindi"],
    image: "1614642648978-f7324098b223",
    rate: 1099,
    unit: "occasion",
    bio: "Pulihora, chakkera pongali and a perfect banana-leaf meal. The cook families call for every festival.",
  },
  {
    id: "bhavani",
    name: "Bhavani N.",
    role: "Laundry & home help",
    serviceId: "laundry",
    category: "maid",
    years: 5,
    rating: 4.7,
    reviews: 143,
    languages: ["Telugu"],
    image: "1722176413255-537269cf2ba8",
    rate: 169,
    unit: "visit",
    bio: "Careful with silk and cotton sarees. Folds and stacks everything back exactly where it belongs.",
  },
];

export const TESTIMONIALS = [
  {
    quote: "Amma lives alone near Tiruchanur. Lakshmi cooks her lunch and dinner and stays to chat. Amma says it's the best part of her day.",
    name: "Srinivas Reddy",
    context: "Son in Bengaluru · Home cooking plan",
  },
  {
    quote: "I'm 76 and my knees don't allow me to mop anymore. Padma comes at 8 sharp every day, and my home in Balaji Colony has never looked better.",
    name: "Saroja Devi",
    context: "Balaji Colony · Daily maid",
  },
  {
    quote: "Every meal is planned around my mother's diabetes. Her sugar readings have been steady for three months now.",
    name: "Lavanya Naidu",
    context: "Daughter in Hyderabad · Diet-specific meals",
  },
  {
    quote: "I live in Dallas. The check-in and meal photos every day mean I finally sleep without worrying about Amma in Korlagunta.",
    name: "Venkat Rao",
    context: "Son in the US · Complete plan",
  },
  {
    quote: "They deep-cleaned the whole house before Sankranti in one day. Amma didn't have to climb a single stool.",
    name: "Kavitha Chowdary",
    context: "Daughter · Deep cleaning",
  },
  {
    quote: "During Brahmotsavam all our relatives came home. Annapurna cooked a full banana-leaf meal and Amma just enjoyed her family.",
    name: "Ramesh Babu",
    context: "Son · Festive cooking",
  },
];

export const PLANS = [
  {
    id: "tidy",
    name: "Tidy",
    tag: "Home help",
    price: 4999,
    period: "month",
    tagline: "A clean, calm home every day.",
    features: ["Daily maid, 6 days a week", "Laundry & ironing, 2× a week", "Monthly deep clean of kitchen", "Same helper every day", "Replacement within 24 hrs"],
    featured: false,
  },
  {
    id: "complete",
    name: "Complete",
    tag: "Help + cooking",
    price: 11999,
    period: "month",
    tagline: "Everything at home, taken care of.",
    features: [
      "Daily maid, 6 days a week",
      "Home cook for lunch & dinner",
      "Diet-aware weekly menus",
      "Laundry & ironing, 2× a week",
      "Family app with meal photos",
      "Dedicated care manager",
    ],
    featured: true,
  },
  {
    id: "nourish",
    name: "Nourish",
    tag: "Home cooking",
    price: 7999,
    period: "month",
    tagline: "Fresh home-cooked meals, daily.",
    features: ["Cook for lunch & dinner", "Weekly menu, planned together", "Diabetic & low-salt options", "Grocery list every week", "Kitchen left spotless"],
    featured: false,
  },
];

export const DAY = [
  { when: "7:30 AM", title: "Morning tidy", text: "The house is swept and mopped, the muggu drawn and the bed made before her coffee gets cold.", category: "maid" },
  { when: "8:30 AM", title: "Warm breakfast", text: "Idli, pesarattu or upma, made fresh and served hot with her medicines laid out beside the plate.", category: "cook" },
  { when: "10:30 AM", title: "Laundry day", text: "Clothes washed and dried, sarees hand-rinsed, and yesterday's ironing put neatly away.", category: "maid" },
  { when: "12:30 PM", title: "Home-style lunch", text: "Pappu, rasam, a seasonal curry and curd rice, light on salt and oil and heavy on taste.", category: "cook" },
  { when: "2:00 PM", title: "Kitchen reset", text: "Vessels washed, counters wiped and the fridge sorted, so the kitchen is ready for the evening.", category: "maid" },
  { when: "7:00 PM", title: "Dinner & goodnight", text: "Soft chapatis or ragi sangati, a quick check that doors and the gas are off, and a note to the family.", category: "cook" },
];

export const FAQS = [
  {
    q: "Which areas do you serve?",
    a: `We currently serve ${CITY.name} only, including Balaji Colony, Korlagunta, Tiruchanur, Alipiri, KT Road, MR Palli, Akkarampalli and nearby localities. Outside these areas, join the waitlist and we'll tell you when we reach you.`,
  },
  {
    q: "How do you verify maids and cooks?",
    a: "Every helper goes through Aadhaar and police verification, reference calls, an in-person interview and a hands-on trial. Cooks also pass a cooking and hygiene test. Fewer than 1 in 8 applicants make it through.",
  },
  {
    q: "Are all helpers women?",
    a: "Yes. Nestly is built for elderly women, so every maid and cook on the platform is a woman, and most speak Telugu.",
  },
  {
    q: "Can the cook follow a medical diet?",
    a: "Yes. Share the doctor's diet advice when you book. Our diet-trained cooks handle diabetic-friendly, low-salt, low-oil, soft-food and no onion-garlic cooking, and plan the weekly menu with you.",
  },
  {
    q: "Can I book for my mother from another city or country?",
    a: `Absolutely. Many of our families live in Hyderabad, Bengaluru, Chennai or abroad while Amma lives in ${CITY.name}. You book and pay online, and you'll see check-ins, meal photos and notes on the family app.`,
  },
  {
    q: "How does payment work?",
    a: "Pay per visit via UPI or card, or save with a monthly plan. You're only charged after each visit is checked out, and plans can be paused or cancelled anytime.",
  },
];

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
