import { BedDouble, ChefHat, CookingPot, Salad, Shirt, Sparkles, SprayCan, type LucideIcon } from "lucide-react";
import { CITIES, LIVE_CITIES, PLANS as BASE_PLANS, SERVICES as BASE_SERVICES, type IconName } from "@lasan/shared";

export {
  BRAND,
  CITIES,
  DIETS,
  FOOD,
  FOR_WHOM,
  IMG,
  LANGUAGES,
  LIVE_CITIES,
  NEEDS,
  SLOTS,
  STATES,
  FREQUENCIES,
  formatINR,
  quote,
  stateName,
  unsplash,
  type Category,
  type City,
  type CityDTO,
  type Need,
  type ProviderDTO,
} from "@lasan/shared";

export const ICONS: Record<IconName, LucideIcon> = {
  sparkles: Sparkles,
  "chef-hat": ChefHat,
  shirt: Shirt,
  salad: Salad,
  "spray-can": SprayCan,
  "cooking-pot": CookingPot,
  "bed-double": BedDouble,
};

export const SERVICES = BASE_SERVICES.map((s) => ({ ...s, id: s.slug, icon: ICONS[s.icon] }));
export type Service = (typeof SERVICES)[number];

export const PLANS = BASE_PLANS.map((p) => ({ ...p, id: p.slug }));

/** Decorative helper portraits for hero and careers imagery (real profiles come from the API). */
export const FACES = [
  "1533128361669-69c065857a13",
  "1622461828382-57a6f4590e0f",
  "1596522868222-0df01d62b628",
  "1614642648978-f7324098b223",
  "1777726168469-6050899044ba",
  "1463335361701-e90f4c5045d0",
];

const liveNames = LIVE_CITIES.map((c) => c.name);
const soonNames = CITIES.filter((c) => c.status === "waitlist").map((c) => c.name);
const list = (xs: string[]) => `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;

export const TESTIMONIALS = [
  {
    quote: "I work ten-hour days in Gachibowli. Coming home to a clean flat and Manjula's high-protein dinners has genuinely changed how my week feels.",
    name: "Priya Sharma",
    context: "Hyderabad · Diet-specific meals",
  },
  {
    quote: "Amma lives alone in Tirupati. Lakshmi cooks her lunch and dinner and stays to chat. Amma says it's the best part of her day.",
    name: "Srinivas Reddy",
    context: "Son in Bengaluru · Home cooking",
  },
  {
    quote: "After my delivery I couldn't manage the house at all. Gowri kept everything spotless for three months so I could rest.",
    name: "Deepika Varma",
    context: "Visakhapatnam · Daily maid",
  },
  {
    quote: "Every meal is planned around my mother's diabetes. Her sugar readings have been steady for three months now.",
    name: "Lavanya Naidu",
    context: "Daughter in Hyderabad · Vijayawada",
  },
  {
    quote: "Fatima aapa cooks exactly the way my nani did. Khatti dal on Fridays is non-negotiable in our house now.",
    name: "Ayesha Siddiqui",
    context: "Mehdipatnam, Hyderabad · Home cook",
  },
  {
    quote: "They deep-cleaned the whole house before Bathukamma in a single day. I didn't have to climb a single stool.",
    name: "Harika Goud",
    context: "Warangal · Deep cleaning",
  },
];

export const DAY = [
  { when: "7:30 AM", title: "Morning tidy", text: "The house is swept and mopped, the muggu drawn and the bed made before the coffee gets cold.", category: "maid" },
  { when: "8:30 AM", title: "Warm breakfast", text: "Idli, pesarattu or upma, made fresh and served hot, with tiffin packed if she's heading out.", category: "cook" },
  { when: "10:30 AM", title: "Laundry day", text: "Clothes washed and dried, sarees hand-rinsed, and yesterday's ironing put neatly away.", category: "maid" },
  { when: "12:30 PM", title: "Home-style lunch", text: "Pappu, rasam, a seasonal curry and curd rice, light on oil and generous on taste.", category: "cook" },
  { when: "2:00 PM", title: "Kitchen reset", text: "Vessels washed, counters wiped and the fridge sorted, so the kitchen is ready for the evening.", category: "maid" },
  { when: "7:00 PM", title: "Dinner, sorted", text: "Soft chapatis or jonna rotte, the gas checked off, and a short note in the Lasan Family app.", category: "cook" },
];

export const FAQS = [
  {
    q: "Which cities do you serve?",
    a: `We're live in ${list(liveNames)}. ${list(soonNames)} are next: join the waitlist and we'll tell you the day we launch near you.`,
  },
  {
    q: "Who is Lasan Family for?",
    a: "Any woman who wants help at home: working women, new mothers, women living on their own, and elderly mothers whose children book for them from another city. We focus on two things only, housework and cooking. We don't provide childcare or nursing.",
  },
  {
    q: "How do you verify maids and cooks?",
    a: "Every helper goes through Aadhaar and police verification, reference calls, an in-person interview and a paid trial. Cooks also pass a cooking and hygiene assessment. Only a small share of applicants are accepted.",
  },
  {
    q: "Are all helpers women?",
    a: "Yes. Every maid and cook on Lasan Family is a woman. Most speak Telugu, and many also speak Hindi, Urdu or English.",
  },
  {
    q: "Can the cook follow a specific diet?",
    a: "Yes. Share your doctor's or nutritionist's advice when you book. Our diet-trained cooks handle diabetic-friendly, low-salt, low-oil, high-protein, Jain and no onion-garlic cooking, and plan the weekly menu with you.",
  },
  {
    q: "Can I book for my mother from another city or country?",
    a: "Absolutely. Book and pay online, then follow every visit in the Lasan Family app: check-ins, meal photos and a note from the helper after each visit.",
  },
  {
    q: "How does payment work?",
    a: "Pay per visit via UPI or card, or save with a monthly plan. You're charged only after the first visit is complete, and plans can be paused or cancelled anytime.",
  },
];
