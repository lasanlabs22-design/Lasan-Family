export const STATES = [
  { code: "AP", name: "Andhra Pradesh" },
  { code: "TG", name: "Telangana" },
] as const;

export type StateCode = (typeof STATES)[number]["code"];
export type CityStatus = "live" | "waitlist" | "paused";

export type City = {
  slug: string;
  name: string;
  state: StateCode;
  status: CityStatus;
  localities: string[];
};

/**
 * Launch geography. This is the seed for the database; at runtime the API is the source of truth
 * (admins can switch a city between live / waitlist / paused and add localities).
 */
export const CITIES: City[] = [
  // Telangana
  {
    slug: "hyderabad",
    name: "Hyderabad",
    state: "TG",
    status: "live",
    localities: [
      "Banjara Hills",
      "Jubilee Hills",
      "Madhapur",
      "Gachibowli",
      "Kondapur",
      "Kukatpally",
      "Miyapur",
      "Ameerpet",
      "Begumpet",
      "Secunderabad",
      "Himayatnagar",
      "Tarnaka",
      "Uppal",
      "Dilsukhnagar",
      "LB Nagar",
      "Mehdipatnam",
      "Manikonda",
      "Kompally",
    ],
  },
  {
    slug: "warangal",
    name: "Warangal",
    state: "TG",
    status: "live",
    localities: ["Hanamkonda", "Kazipet", "Subedari", "Naimnagar", "Hunter Road", "Balasamudram", "Kishanpura", "Waddepally"],
  },
  { slug: "karimnagar", name: "Karimnagar", state: "TG", status: "waitlist", localities: [] },
  { slug: "khammam", name: "Khammam", state: "TG", status: "waitlist", localities: [] },
  { slug: "nizamabad", name: "Nizamabad", state: "TG", status: "waitlist", localities: [] },

  // Andhra Pradesh
  {
    slug: "tirupati",
    name: "Tirupati",
    state: "AP",
    status: "live",
    localities: [
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
    ],
  },
  {
    slug: "vijayawada",
    name: "Vijayawada",
    state: "AP",
    status: "live",
    localities: [
      "Benz Circle",
      "Labbipet",
      "Moghalrajpuram",
      "Governorpet",
      "Patamata",
      "Gunadala",
      "Bhavanipuram",
      "Satyanarayanapuram",
      "Krishna Lanka",
      "Poranki",
      "Kanuru",
      "Gollapudi",
    ],
  },
  {
    slug: "visakhapatnam",
    name: "Visakhapatnam",
    state: "AP",
    status: "live",
    localities: [
      "MVP Colony",
      "Seethammadhara",
      "Dwaraka Nagar",
      "Siripuram",
      "Lawsons Bay Colony",
      "Akkayyapalem",
      "Asilmetta",
      "Maharanipeta",
      "Madhurawada",
      "Rushikonda",
      "Gajuwaka",
      "Pendurthi",
    ],
  },
  {
    slug: "guntur",
    name: "Guntur",
    state: "AP",
    status: "live",
    localities: ["Brodipet", "Arundelpet", "Lakshmipuram", "Kothapet", "Nallapadu", "Pattabhipuram", "Vidya Nagar", "Gorantla", "Amaravati Road"],
  },
  { slug: "nellore", name: "Nellore", state: "AP", status: "waitlist", localities: [] },
  { slug: "kurnool", name: "Kurnool", state: "AP", status: "waitlist", localities: [] },
  { slug: "rajahmundry", name: "Rajahmundry", state: "AP", status: "waitlist", localities: [] },
  { slug: "kakinada", name: "Kakinada", state: "AP", status: "waitlist", localities: [] },
];

export const stateName = (code: StateCode) => STATES.find((s) => s.code === code)?.name ?? code;
export const LIVE_CITIES = CITIES.filter((c) => c.status === "live");
