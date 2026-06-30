export interface Listing {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  city: string;
  description: string;
  images: string[];
  fuelType: string;
  transmission: string;
  color: string;
  bodyType: string;
  engineVolume: number;
  driveType: string;
  condition: string;
  status: string;
  isVerified: boolean;
  sellerName: string;
  sellerPhone: string;
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilters {
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  city?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  sort?: "newest" | "priceAsc" | "priceDesc";
  page?: number;
}

export const UZBEKISTAN_CITIES = [
  "Toshkent",
  "Samarqand",
  "Namangan",
  "Andijon",
  "Farg'ona",
  "Qarshi",
  "Buxoro",
  "Nukus",
  "Termiz",
  "Jizzax",
  "Urganch",
  "Qo'qon",
  "Navoiy",
  "Guliston",
  "Chirchiq",
];

export const CAR_BRANDS = [
  "Chevrolet",
  "Daewoo",
  "Nexia",
  "Matiz",
  "Spark",
  "Cobalt",
  "Lacetti",
  "Captiva",
  "Tracker",
  "Toyota",
  "Honda",
  "Hyundai",
  "Kia",
  "Nissan",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Ford",
  "Lada",
  "Ravon",
  "BYD",
  "Chery",
  "Geely",
  "Haval",
];

export const BODY_TYPES = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Universal",
  "Minivan",
  "Coupe",
  "Pickup",
  "Convertible",
];

export const FUEL_TYPES = ["Benzin", "Dizel", "Gaz", "Elektr", "Gibrid"];

export const TRANSMISSIONS = ["Mexanik", "Avtomat", "Robot", "Variator"];

export const DRIVE_TYPES = ["Old", "Orqa", "4x4"];

export const MILEAGE_STEPS = [
  { value: "10000",  ru: "до 10 000 км",  uz: "10 000 kmgacha" },
  { value: "30000",  ru: "до 30 000 км",  uz: "30 000 kmgacha" },
  { value: "50000",  ru: "до 50 000 км",  uz: "50 000 kmgacha" },
  { value: "100000", ru: "до 100 000 км", uz: "100 000 kmgacha" },
  { value: "150000", ru: "до 150 000 км", uz: "150 000 kmgacha" },
  { value: "200000", ru: "до 200 000 км", uz: "200 000 kmgacha" },
  { value: "300000", ru: "до 300 000 км", uz: "300 000 kmgacha" },
];

export const COLORS = [
  "Oq",
  "Qora",
  "Kumush",
  "Kulrang",
  "Qizil",
  "Ko'k",
  "Yashil",
  "Sariq",
  "To'q sariq",
  "Jigarrang",
];
