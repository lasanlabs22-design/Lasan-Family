export type Category = "maid" | "cook";
export type Need = Category | "both";

/** Icon names map to lucide icons on web (lucide-react) and mobile (lucide-react-native). */
export type IconName = "sparkles" | "chef-hat" | "shirt" | "salad" | "spray-can" | "cooking-pot" | "bed-double";

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

export type Unit = "visit" | "day" | "home" | "occasion" | "month";

export type Service = {
  slug: string;
  name: string;
  short: string;
  description: string;
  category: Category;
  icon: IconName;
  price: number;
  unit: Unit;
  image: string;
  includes: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "daily-maid",
    name: "Daily maid",
    short: "Sweeping, mopping, dusting, vessels and a made bed, every day.",
    description:
      "The same verified helper arrives at the same time every day to sweep, mop, dust, wash the vessels and tidy up. She learns how your home works, so she never needs reminding.",
    category: "maid",
    icon: "sparkles",
    price: 199,
    unit: "visit",
    image: IMG.maidAtWork,
    includes: ["Sweep & mop", "Dusting & tidying", "Vessels & kitchen wipe", "Bed making"],
  },
  {
    slug: "daily-cook",
    name: "Daily home cook",
    short: "Fresh lunch and dinner cooked at home, to your taste.",
    description:
      "A home cook prepares fresh lunch and dinner in your kitchen, from pappu, rasam and curd rice to soft chapatis and your favourite curry. The menu is planned together each week.",
    category: "cook",
    icon: "chef-hat",
    price: 299,
    unit: "day",
    image: IMG.rotiOnStove,
    includes: ["Lunch & dinner", "Weekly menu plan", "Andhra & Telangana style", "Kitchen left clean"],
  },
  {
    slug: "laundry",
    name: "Laundry & ironing",
    short: "Washed, dried, folded and ironed, then put away.",
    description: "Clothes, bedsheets and towels are washed, dried, ironed and put back where they belong. Silk and cotton sarees are washed gently by hand.",
    category: "maid",
    icon: "shirt",
    price: 149,
    unit: "visit",
    image: IMG.laundry,
    includes: ["Machine or hand wash", "Drying & folding", "Ironing", "Saree care"],
  },
  {
    slug: "diet-cook",
    name: "Diet-specific meals",
    short: "Diabetic-friendly, low-salt, high-protein or no onion-garlic cooking.",
    description:
      "Cooks trained in diet-aware cooking make meals that follow your doctor's or nutritionist's advice and still taste like home: ragi sangati, millet rotis, low-salt pappu and protein-rich tiffins.",
    category: "cook",
    icon: "salad",
    price: 349,
    unit: "day",
    image: IMG.idli,
    includes: ["Diabetic-friendly", "Low salt & oil", "High-protein options", "No onion-garlic"],
  },
  {
    slug: "deep-cleaning",
    name: "Deep cleaning",
    short: "Top-to-bottom clean of kitchen, bathrooms and every corner.",
    description:
      "A two-person team scrubs the kitchen, bathrooms, fans, windows and pooja room. Perfect before Sankranti, Ugadi, Bathukamma or when family visits.",
    category: "maid",
    icon: "spray-can",
    price: 1499,
    unit: "home",
    image: IMG.livingRoom,
    includes: ["Kitchen degreasing", "Bathroom scrub", "Fans & windows", "Pooja room care"],
  },
  {
    slug: "occasion-cook",
    name: "Festive & guest cooking",
    short: "A cook for festivals, poojas, birthdays and family visits.",
    description:
      "When the family comes home, you shouldn't be stuck in the kitchen. Book a cook for a festival feast on banana leaf, pooja prasadam or a big Sunday lunch.",
    category: "cook",
    icon: "cooking-pot",
    price: 999,
    unit: "occasion",
    image: IMG.bananaLeafMeal,
    includes: ["Festive menus", "Up to 15 guests", "Prasadam & sweets", "Serving help"],
  },
  {
    slug: "live-in-maid",
    name: "Live-in maid",
    short: "Full-time help who stays at home and runs the house.",
    description: "A live-in helper takes care of the whole house and is around through the day and night. Replacement cover is included for her days off.",
    category: "maid",
    icon: "bed-double",
    price: 12999,
    unit: "month",
    image: IMG.liveIn,
    includes: ["All household chores", "Day & night presence", "Days-off cover", "Monthly review"],
  },
];

export const NEEDS: { id: Need; label: string; short: string; blurb: string; image: string; tint: string }[] = [
  {
    id: "maid",
    label: "Home help",
    short: "Maids",
    blurb: "A spotless home without lifting a finger: sweeping, mopping, vessels, laundry and a fresh bed, done the way you like it.",
    image: IMG.maidAtWork,
    tint: "from-lilac-100 to-blush-50",
  },
  {
    id: "cook",
    label: "Home cooking",
    short: "Cooks",
    blurb: "Fresh Andhra and Telangana-style meals in your own kitchen, from pappu and rasam to soft chapatis, made to your taste and diet.",
    image: IMG.rotiOnStove,
    tint: "from-peach-100 to-blush-50",
  },
  {
    id: "both",
    label: "Both together",
    short: "Help + cooking",
    blurb: "One trusted pair who know your home and your routine: a maid and a cook working together every day.",
    image: IMG.elderYellow,
    tint: "from-sage-100 to-cream",
  },
];

export type PlanSlug = "tidy" | "complete" | "nourish";

export const PLANS: { slug: PlanSlug; name: string; tag: string; need: Need; price: number; period: "month"; tagline: string; features: string[]; featured: boolean }[] = [
  {
    slug: "tidy",
    name: "Tidy",
    tag: "Home help",
    need: "maid",
    price: 4999,
    period: "month",
    tagline: "A clean, calm home every day.",
    features: ["Daily maid, 6 days a week", "Laundry & ironing, 2× a week", "Monthly deep clean of kitchen", "Same helper every day", "Replacement within 24 hrs"],
    featured: false,
  },
  {
    slug: "complete",
    name: "Complete",
    tag: "Help + cooking",
    need: "both",
    price: 11999,
    period: "month",
    tagline: "Everything at home, taken care of.",
    features: ["Daily maid, 6 days a week", "Home cook for lunch & dinner", "Diet-aware weekly menus", "Laundry & ironing, 2× a week", "Family app with meal photos", "Dedicated care manager"],
    featured: true,
  },
  {
    slug: "nourish",
    name: "Nourish",
    tag: "Home cooking",
    need: "cook",
    price: 7999,
    period: "month",
    tagline: "Fresh home-cooked meals, daily.",
    features: ["Cook for lunch & dinner", "Weekly menu, planned together", "Diabetic & low-salt options", "Grocery list every week", "Kitchen left spotless"],
    featured: false,
  },
];

export const LANGUAGES = ["Telugu", "Hindi", "Urdu", "English", "Tamil", "Kannada", "Odia"] as const;
export const FOR_WHOM = ["Myself", "My mother", "Mother-in-law", "Grandmother", "Another relative"] as const;
export const FOOD = ["Vegetarian", "Eggetarian", "Non-vegetarian"] as const;
export const DIETS = ["Diabetic-friendly", "Low salt", "Low oil", "High protein", "Soft food", "Jain", "No onion-garlic"] as const;

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const planBySlug = (slug: string) => PLANS.find((p) => p.slug === slug);
