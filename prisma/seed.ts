import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────

const rnd   = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick  = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const maybe = (prob: number) => Math.random() < prob;

// loremflickr.com serves real Flickr photos by keyword; lock= makes it deterministic
function carImages(brand: string, idx: number): string {
  const kw = brand.toLowerCase().replace(/[^a-z0-9]/g, "");
  const count = 2 + (idx % 3); // 2, 3, or 4 images
  return JSON.stringify(
    Array.from({ length: count }, (_, i) =>
      `https://loremflickr.com/800/600/automobile,${kw}?lock=${idx * 10 + i + 1}`
    )
  );
}

// ─── data tables ─────────────────────────────────────────────────────────────

const CITIES = [
  "Toshkent", "Toshkent", "Toshkent", "Toshkent", // 4x weight — capital dominates
  "Samarqand", "Namangan", "Andijon", "Farg'ona",
  "Qarshi",   "Buxoro",    "Nukus",    "Termiz",
  "Jizzax",   "Urganch",  "Qo'qon",  "Navoiy",
  "Guliston", "Chirchiq",
];

const COLORS = [
  "Oq","Oq","Oq",        // white is most popular
  "Kumush","Kumush",      // silver
  "Qora","Qora",          // black
  "Kulrang",              // grey
  "Qizil",               // red
  "Ko'k",                // blue
  "Yashil",              // green
  "Sariq",               // yellow
  "To'q sariq",          // orange
  "Jigarrang",           // brown
];

const SELLER_NAMES = [
  "Akbar Toshmatov","Dilnoza Yusupova","Jasur Rahimov","Nodir Karimov","Sarvar Mirzaev",
  "Ulugbek Nazarov","Behruz Islamov","Firdavs Tursunov","Sherzod Abdullayev","Timur Xolmatov",
  "Aziz Makhmudov","Hamid Sotvoldiyev","Rustam Qodirov","Bobur Ergashev","Sanjar Yusupov",
  "Dilshod Sobirov","Mahmud Bekmurodov","Kamol Hasanov","Eldor Tojiboyev","Jahongir Nazarov",
  "Otabek Xasanov","Zafar Rahmatullayev","Mirzo Kalandarov","Alisher Sultonov","Bahodir Ortiqov",
  "Laziz Ismoilov","Mansur Xo'jayev","Xusan Tojiyev","Doniyor Alimov","Farrux Qosimov",
  "Shohruh Raximov","Bekzod Yo'ldoshev","Jamshid Ibragimov","Ulmas Nishonov","Qodir Ergashev",
  "Ibrohim Sobirov","Nurbek Tursunov","Husan Nazarov","Anvar Holiqov","Tohir Norqo'ziyev",
  "Saidakbar Mirzayev","Muzaffar Hamidov","Ilhom Tashmatov","Ravshan Abduraxmonov","Komiljon Umarov",
  "Lochinbek Qoraboyev","Asliddin Sulaymonov","Temur Ibragimov","Muhammadali Xoliqov","Sarvinoz Yunusova",
];

// ─── car catalogue ────────────────────────────────────────────────────────────

const CARS: {
  brand: string; model: string; basePrice: number;
  bodyType: string; engines: number[];
  drive: string[]; fuels: string[]; txs: string[];
  yearRange: [number, number]; priceVar: number;
}[] = [
  // Chevrolet (most popular in UZ)
  { brand:"Chevrolet", model:"Cobalt",    basePrice:135_000_000, bodyType:"Sedan",    engines:[1.5],           drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Avtomat"], yearRange:[2016,2024], priceVar:0.25 },
  { brand:"Chevrolet", model:"Spark",     basePrice:95_000_000,  bodyType:"Hatchback",engines:[1.0],           drive:["Old"],        fuels:["Benzin"],            txs:["Mexanik"],           yearRange:[2015,2024], priceVar:0.25 },
  { brand:"Chevrolet", model:"Nexia 3",   basePrice:115_000_000, bodyType:"Sedan",    engines:[1.5],           drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Avtomat"], yearRange:[2016,2023], priceVar:0.2  },
  { brand:"Chevrolet", model:"Lacetti",   basePrice:80_000_000,  bodyType:"Sedan",    engines:[1.6],           drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik"],           yearRange:[2007,2015], priceVar:0.3  },
  { brand:"Chevrolet", model:"Malibu",    basePrice:185_000_000, bodyType:"Sedan",    engines:[1.5,2.0],       drive:["Old"],        fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2015,2023], priceVar:0.2  },
  { brand:"Chevrolet", model:"Captiva",   basePrice:280_000_000, bodyType:"SUV",      engines:[2.0,2.4],       drive:["4x4","Old"],  fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2015,2022], priceVar:0.2  },
  { brand:"Chevrolet", model:"Tracker",   basePrice:310_000_000, bodyType:"SUV",      engines:[1.2,1.5],       drive:["Old"],        fuels:["Benzin"],            txs:["Avtomat","Robot"],   yearRange:[2020,2024], priceVar:0.15 },
  { brand:"Chevrolet", model:"Equinox",   basePrice:350_000_000, bodyType:"SUV",      engines:[1.5,2.0],       drive:["Old","4x4"],  fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2018,2024], priceVar:0.18 },
  { brand:"Chevrolet", model:"Onix",      basePrice:160_000_000, bodyType:"Sedan",    engines:[1.2],           drive:["Old"],        fuels:["Benzin"],            txs:["Mexanik","Avtomat"], yearRange:[2022,2024], priceVar:0.12 },

  // Daewoo
  { brand:"Daewoo",    model:"Nexia",     basePrice:55_000_000,  bodyType:"Sedan",    engines:[1.5],           drive:["Old"],        fuels:["Gaz","Benzin"],      txs:["Mexanik"],           yearRange:[2008,2016], priceVar:0.3  },
  { brand:"Daewoo",    model:"Matiz",     basePrice:42_000_000,  bodyType:"Hatchback",engines:[0.8,1.0],       drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik"],           yearRange:[2006,2015], priceVar:0.35 },

  // Ravon
  { brand:"Ravon",     model:"R4",        basePrice:105_000_000, bodyType:"Sedan",    engines:[1.5],           drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Avtomat"], yearRange:[2016,2020], priceVar:0.2  },
  { brand:"Ravon",     model:"Nexia R3",  basePrice:98_000_000,  bodyType:"Sedan",    engines:[1.5],           drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik"],           yearRange:[2016,2020], priceVar:0.2  },

  // Toyota
  { brand:"Toyota",    model:"Camry",     basePrice:385_000_000, bodyType:"Sedan",    engines:[2.0,2.5,3.0,3.5],drive:["Old"],       fuels:["Benzin","Gibrid"],   txs:["Avtomat","Variator"],yearRange:[2015,2024], priceVar:0.25 },
  { brand:"Toyota",    model:"Corolla",   basePrice:265_000_000, bodyType:"Sedan",    engines:[1.6,1.8,2.0],   drive:["Old"],        fuels:["Benzin","Gibrid"],   txs:["Mexanik","Avtomat","Variator"],yearRange:[2014,2024], priceVar:0.22 },
  { brand:"Toyota",    model:"Land Cruiser",basePrice:900_000_000,bodyType:"SUV",     engines:[4.0,4.5],       drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2012,2022], priceVar:0.2  },
  { brand:"Toyota",    model:"Prado",     basePrice:640_000_000, bodyType:"SUV",      engines:[2.7,3.0,4.0],   drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2010,2023], priceVar:0.2  },
  { brand:"Toyota",    model:"RAV4",      basePrice:360_000_000, bodyType:"SUV",      engines:[2.0,2.5],       drive:["Old","4x4"],  fuels:["Benzin","Gibrid"],   txs:["Avtomat","Variator"],yearRange:[2015,2024], priceVar:0.2  },
  { brand:"Toyota",    model:"Yaris",     basePrice:195_000_000, bodyType:"Hatchback",engines:[1.3,1.5],       drive:["Old"],        fuels:["Benzin"],            txs:["Mexanik","Avtomat"], yearRange:[2015,2023], priceVar:0.2  },
  { brand:"Toyota",    model:"Fortuner",  basePrice:580_000_000, bodyType:"SUV",      engines:[2.7,2.8],       drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2016,2024], priceVar:0.15 },

  // Hyundai
  { brand:"Hyundai",   model:"Accent",    basePrice:140_000_000, bodyType:"Sedan",    engines:[1.4,1.6],       drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Avtomat"], yearRange:[2014,2023], priceVar:0.22 },
  { brand:"Hyundai",   model:"Elantra",   basePrice:215_000_000, bodyType:"Sedan",    engines:[1.6,2.0],       drive:["Old"],        fuels:["Benzin"],            txs:["Mexanik","Avtomat"], yearRange:[2016,2024], priceVar:0.2  },
  { brand:"Hyundai",   model:"Tucson",    basePrice:355_000_000, bodyType:"SUV",      engines:[1.6,2.0,2.5],   drive:["Old","4x4"],  fuels:["Benzin","Dizel"],    txs:["Mexanik","Avtomat"], yearRange:[2016,2024], priceVar:0.2  },
  { brand:"Hyundai",   model:"Santa Fe",  basePrice:450_000_000, bodyType:"SUV",      engines:[2.0,2.2,2.5],   drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2015,2024], priceVar:0.2  },
  { brand:"Hyundai",   model:"Creta",     basePrice:260_000_000, bodyType:"SUV",      engines:[1.6,2.0],       drive:["Old","4x4"],  fuels:["Benzin"],            txs:["Mexanik","Avtomat"], yearRange:[2018,2024], priceVar:0.18 },
  { brand:"Hyundai",   model:"Sonata",    basePrice:280_000_000, bodyType:"Sedan",    engines:[2.0,2.4],       drive:["Old"],        fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2015,2023], priceVar:0.2  },

  // Kia
  { brand:"Kia",       model:"Rio",       basePrice:175_000_000, bodyType:"Sedan",    engines:[1.4,1.6],       drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Avtomat"], yearRange:[2015,2024], priceVar:0.22 },
  { brand:"Kia",       model:"Cerato",    basePrice:235_000_000, bodyType:"Sedan",    engines:[1.6,2.0],       drive:["Old"],        fuels:["Benzin"],            txs:["Mexanik","Avtomat"], yearRange:[2016,2024], priceVar:0.2  },
  { brand:"Kia",       model:"Sportage",  basePrice:335_000_000, bodyType:"SUV",      engines:[1.6,2.0,2.4],   drive:["Old","4x4"],  fuels:["Benzin","Dizel"],    txs:["Mexanik","Avtomat"], yearRange:[2015,2024], priceVar:0.2  },
  { brand:"Kia",       model:"Sorento",   basePrice:420_000_000, bodyType:"SUV",      engines:[2.0,2.2,2.5],   drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2015,2024], priceVar:0.2  },
  { brand:"Kia",       model:"K5",        basePrice:315_000_000, bodyType:"Sedan",    engines:[1.6,2.0],       drive:["Old"],        fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2020,2024], priceVar:0.15 },
  { brand:"Kia",       model:"Stinger",   basePrice:480_000_000, bodyType:"Sedan",    engines:[2.0,3.3],       drive:["Orqa","4x4"], fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2018,2023], priceVar:0.2  },

  // Nissan
  { brand:"Nissan",    model:"Sentra",    basePrice:195_000_000, bodyType:"Sedan",    engines:[1.6,1.8],       drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Avtomat"], yearRange:[2014,2022], priceVar:0.2  },
  { brand:"Nissan",    model:"X-Trail",   basePrice:360_000_000, bodyType:"SUV",      engines:[1.6,2.0,2.5],   drive:["Old","4x4"],  fuels:["Benzin","Dizel"],    txs:["Mexanik","Avtomat","Variator"],yearRange:[2015,2023], priceVar:0.2  },
  { brand:"Nissan",    model:"Pathfinder",basePrice:520_000_000, bodyType:"SUV",      engines:[3.5],           drive:["4x4"],        fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2015,2022], priceVar:0.18 },
  { brand:"Nissan",    model:"Almera",    basePrice:145_000_000, bodyType:"Sedan",    engines:[1.6],           drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Avtomat"], yearRange:[2012,2019], priceVar:0.25 },
  { brand:"Nissan",    model:"Qashqai",   basePrice:310_000_000, bodyType:"SUV",      engines:[1.2,1.6,2.0],   drive:["Old","4x4"],  fuels:["Benzin","Dizel"],    txs:["Mexanik","Avtomat","Variator"],yearRange:[2015,2023], priceVar:0.2  },

  // BMW
  { brand:"BMW",       model:"3-Series",  basePrice:380_000_000, bodyType:"Sedan",    engines:[1.6,2.0,3.0],   drive:["Orqa","4x4"], fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2015,2023], priceVar:0.25 },
  { brand:"BMW",       model:"5-Series",  basePrice:480_000_000, bodyType:"Sedan",    engines:[2.0,3.0],       drive:["Orqa","4x4"], fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2014,2023], priceVar:0.25 },
  { brand:"BMW",       model:"X5",        basePrice:750_000_000, bodyType:"SUV",      engines:[2.0,3.0],       drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2014,2023], priceVar:0.22 },
  { brand:"BMW",       model:"X6",        basePrice:820_000_000, bodyType:"SUV",      engines:[3.0],           drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2015,2022], priceVar:0.22 },
  { brand:"BMW",       model:"7-Series",  basePrice:900_000_000, bodyType:"Sedan",    engines:[3.0,4.4],       drive:["Orqa","4x4"], fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2013,2022], priceVar:0.25 },
  { brand:"BMW",       model:"X3",        basePrice:540_000_000, bodyType:"SUV",      engines:[2.0,3.0],       drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2015,2023], priceVar:0.2  },

  // Mercedes-Benz
  { brand:"Mercedes-Benz", model:"C-Class",  basePrice:420_000_000, bodyType:"Sedan", engines:[1.5,1.8,2.0,3.0], drive:["Orqa","4x4"], fuels:["Benzin","Dizel"], txs:["Avtomat"],         yearRange:[2014,2023], priceVar:0.25 },
  { brand:"Mercedes-Benz", model:"E-Class",  basePrice:530_000_000, bodyType:"Sedan", engines:[2.0,2.2,3.0],  drive:["Orqa","4x4"],    fuels:["Benzin","Dizel"], txs:["Avtomat"],         yearRange:[2014,2023], priceVar:0.25 },
  { brand:"Mercedes-Benz", model:"GLE",      basePrice:850_000_000, bodyType:"SUV",   engines:[2.0,3.0],       drive:["4x4"],           fuels:["Benzin","Dizel"], txs:["Avtomat"],         yearRange:[2015,2023], priceVar:0.22 },
  { brand:"Mercedes-Benz", model:"GLC",      basePrice:620_000_000, bodyType:"SUV",   engines:[1.5,2.0],       drive:["4x4"],           fuels:["Benzin","Dizel"], txs:["Avtomat"],         yearRange:[2016,2023], priceVar:0.2  },
  { brand:"Mercedes-Benz", model:"S-Class",  basePrice:1_200_000_000,bodyType:"Sedan",engines:[3.0,4.0],       drive:["Orqa","4x4"],    fuels:["Benzin"],         txs:["Avtomat"],         yearRange:[2014,2022], priceVar:0.2  },
  { brand:"Mercedes-Benz", model:"GLS",      basePrice:1_100_000_000,bodyType:"SUV",  engines:[3.0,4.0],       drive:["4x4"],           fuels:["Benzin","Dizel"], txs:["Avtomat"],         yearRange:[2015,2022], priceVar:0.2  },

  // Audi
  { brand:"Audi",      model:"A4",        basePrice:420_000_000, bodyType:"Sedan",    engines:[1.4,1.8,2.0],   drive:["Old","4x4"],  fuels:["Benzin","Dizel"],    txs:["Mexanik","Avtomat","Robot"],yearRange:[2014,2023], priceVar:0.22 },
  { brand:"Audi",      model:"A6",        basePrice:560_000_000, bodyType:"Sedan",    engines:[1.8,2.0,3.0],   drive:["Old","4x4"],  fuels:["Benzin","Dizel"],    txs:["Avtomat","Robot"], yearRange:[2014,2022], priceVar:0.22 },
  { brand:"Audi",      model:"Q5",        basePrice:650_000_000, bodyType:"SUV",      engines:[2.0,3.0],       drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat","Robot"], yearRange:[2015,2023], priceVar:0.2  },
  { brand:"Audi",      model:"Q7",        basePrice:850_000_000, bodyType:"SUV",      engines:[2.0,3.0],       drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],         yearRange:[2015,2022], priceVar:0.2  },
  { brand:"Audi",      model:"A3",        basePrice:300_000_000, bodyType:"Sedan",    engines:[1.2,1.4,1.8],   drive:["Old","4x4"],  fuels:["Benzin"],            txs:["Mexanik","Robot"], yearRange:[2015,2023], priceVar:0.2  },

  // Volkswagen
  { brand:"Volkswagen",model:"Polo",      basePrice:185_000_000, bodyType:"Sedan",    engines:[1.4,1.6],       drive:["Old"],        fuels:["Benzin"],            txs:["Mexanik","Avtomat","Robot"],yearRange:[2015,2023], priceVar:0.2  },
  { brand:"Volkswagen",model:"Jetta",     basePrice:245_000_000, bodyType:"Sedan",    engines:[1.4,1.6,2.0],   drive:["Old"],        fuels:["Benzin"],            txs:["Mexanik","Avtomat","Robot"],yearRange:[2014,2022], priceVar:0.2  },
  { brand:"Volkswagen",model:"Passat",    basePrice:340_000_000, bodyType:"Sedan",    engines:[1.4,1.8,2.0],   drive:["Old","4x4"],  fuels:["Benzin","Dizel"],    txs:["Avtomat","Robot"], yearRange:[2014,2022], priceVar:0.2  },
  { brand:"Volkswagen",model:"Tiguan",    basePrice:380_000_000, bodyType:"SUV",      engines:[1.4,2.0],       drive:["Old","4x4"],  fuels:["Benzin","Dizel"],    txs:["Avtomat","Robot"], yearRange:[2015,2023], priceVar:0.2  },

  // Honda
  { brand:"Honda",     model:"Accord",    basePrice:350_000_000, bodyType:"Sedan",    engines:[1.5,2.0,2.4],   drive:["Old"],        fuels:["Benzin"],            txs:["Avtomat","Robot"], yearRange:[2014,2023], priceVar:0.2  },
  { brand:"Honda",     model:"Civic",     basePrice:250_000_000, bodyType:"Sedan",    engines:[1.0,1.5,1.8],   drive:["Old"],        fuels:["Benzin"],            txs:["Mexanik","Avtomat","Robot"],yearRange:[2015,2024], priceVar:0.2  },
  { brand:"Honda",     model:"CR-V",      basePrice:380_000_000, bodyType:"SUV",      engines:[1.5,2.0,2.4],   drive:["Old","4x4"],  fuels:["Benzin","Gibrid"],   txs:["Avtomat","Variator"],yearRange:[2015,2023], priceVar:0.2  },

  // Lada
  { brand:"Lada",      model:"Vesta",     basePrice:95_000_000,  bodyType:"Sedan",    engines:[1.6,1.8],       drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Avtomat","Robot"],yearRange:[2016,2024], priceVar:0.2  },
  { brand:"Lada",      model:"Niva",      basePrice:80_000_000,  bodyType:"SUV",      engines:[1.7],           drive:["4x4"],        fuels:["Benzin"],            txs:["Mexanik"],           yearRange:[2015,2023], priceVar:0.2  },
  { brand:"Lada",      model:"Granta",    basePrice:72_000_000,  bodyType:"Sedan",    engines:[1.6],           drive:["Old"],        fuels:["Benzin","Gaz"],      txs:["Mexanik","Robot"],   yearRange:[2015,2022], priceVar:0.2  },

  // Haval
  { brand:"Haval",     model:"Jolion",    basePrice:285_000_000, bodyType:"SUV",      engines:[1.5],           drive:["Old","4x4"],  fuels:["Benzin"],            txs:["Mexanik","Robot"],   yearRange:[2021,2024], priceVar:0.12 },
  { brand:"Haval",     model:"H9",        basePrice:750_000_000, bodyType:"SUV",      engines:[2.0,3.0],       drive:["4x4"],        fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2017,2022], priceVar:0.15 },
  { brand:"Haval",     model:"F7",        basePrice:340_000_000, bodyType:"SUV",      engines:[1.5,2.0],       drive:["Old","4x4"],  fuels:["Benzin"],            txs:["Robot"],             yearRange:[2019,2023], priceVar:0.15 },

  // Geely
  { brand:"Geely",     model:"Coolray",   basePrice:255_000_000, bodyType:"SUV",      engines:[1.5],           drive:["Old"],        fuels:["Benzin"],            txs:["Robot"],             yearRange:[2019,2024], priceVar:0.15 },
  { brand:"Geely",     model:"Atlas Pro", basePrice:320_000_000, bodyType:"SUV",      engines:[1.5,2.0],       drive:["Old","4x4"],  fuels:["Benzin"],            txs:["Robot"],             yearRange:[2021,2024], priceVar:0.12 },

  // BYD
  { brand:"BYD",       model:"Atto 3",    basePrice:490_000_000, bodyType:"SUV",      engines:[0.0],           drive:["Old"],        fuels:["Elektr"],            txs:["Avtomat"],           yearRange:[2022,2024], priceVar:0.1  },
  { brand:"BYD",       model:"Han",       basePrice:620_000_000, bodyType:"Sedan",    engines:[0.0],           drive:["Old","4x4"],  fuels:["Elektr"],            txs:["Avtomat"],           yearRange:[2022,2024], priceVar:0.1  },
  { brand:"BYD",       model:"Seal",      basePrice:540_000_000, bodyType:"Sedan",    engines:[0.0],           drive:["Old"],        fuels:["Elektr"],            txs:["Avtomat"],           yearRange:[2023,2024], priceVar:0.08 },

  // Chery
  { brand:"Chery",     model:"Tiggo 4",   basePrice:210_000_000, bodyType:"SUV",      engines:[1.5],           drive:["Old"],        fuels:["Benzin"],            txs:["Robot"],             yearRange:[2019,2024], priceVar:0.15 },
  { brand:"Chery",     model:"Tiggo 7",   basePrice:285_000_000, bodyType:"SUV",      engines:[1.5,2.0],       drive:["Old","4x4"],  fuels:["Benzin"],            txs:["Robot"],             yearRange:[2018,2024], priceVar:0.15 },
  { brand:"Chery",     model:"Arrizo 8",  basePrice:290_000_000, bodyType:"Sedan",    engines:[1.6,2.0],       drive:["Old"],        fuels:["Benzin"],            txs:["Avtomat","Robot"],   yearRange:[2022,2024], priceVar:0.12 },

  // Lexus
  { brand:"Lexus",     model:"ES",        basePrice:620_000_000, bodyType:"Sedan",    engines:[2.5],           drive:["Old"],        fuels:["Benzin","Gibrid"],   txs:["Avtomat"],           yearRange:[2015,2023], priceVar:0.2  },
  { brand:"Lexus",     model:"RX",        basePrice:780_000_000, bodyType:"SUV",      engines:[2.0,3.5],       drive:["4x4"],        fuels:["Benzin","Gibrid"],   txs:["Avtomat"],           yearRange:[2015,2023], priceVar:0.2  },
  { brand:"Lexus",     model:"LX",        basePrice:1_300_000_000,bodyType:"SUV",     engines:[4.7,5.7],       drive:["4x4"],        fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2010,2022], priceVar:0.2  },
  { brand:"Lexus",     model:"GX",        basePrice:880_000_000, bodyType:"SUV",      engines:[4.0,4.6],       drive:["4x4"],        fuels:["Benzin"],            txs:["Avtomat"],           yearRange:[2010,2022], priceVar:0.2  },

  // Land Rover
  { brand:"Land Rover",model:"Range Rover",basePrice:1_800_000_000,bodyType:"SUV",    engines:[3.0,4.4,5.0],   drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2013,2022], priceVar:0.2  },
  { brand:"Land Rover",model:"Discovery", basePrice:900_000_000, bodyType:"SUV",      engines:[2.0,3.0],       drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2015,2022], priceVar:0.2  },
];

// ─── description templates ────────────────────────────────────────────────────

const DESC_TEMPLATES: ((b: string, m: string, y: number) => string)[] = [
  (b,m,y) => `${b} ${m} ${y} года выпуска. Машина в отличном состоянии, один хозяин. Всё техническое обслуживание пройдено вовремя по регламенту. Не бита, не крашена. Торг уместен при встрече.`,
  (b,m,y) => `Продаётся ${b} ${m} ${y} г. Состояние хорошее, ухоженная. Кузов без вмятин и царапин, салон чистый. Срочная продажа — переезд. Торг при осмотре.`,
  (b,m,y) => `${b} ${m} ${y}. Куплена в официальном салоне, все документы оригинальные. ТО только у дилера. Полный привод, отличная управляемость в городе и на трассе. Не торгуюсь по звонку.`,
  (b,m,y) => `Продаю ${b} ${m} ${y} года. Автомобиль на ходу, двигатель работает ровно, без стуков и дыма. Кожаный салон, подогрев сидений, камера заднего вида. Без ДТП.`,
  (b,m,y) => `${b} ${m} ${y}. Полный фарш: панорамная крыша, климат-контроль, парктроники спереди и сзади, камера 360°, подогрев руля. Состояние — 9 из 10. Серьёзным покупателям скидка.`,
  (b,m,y) => `Продаю своего любимца ${b} ${m} ${y} г. Аккуратный хозяин, хранился в гараже. Свежий техосмотр. Зимняя и летняя резина в комплекте. Цена окончательная.`,
  (b,m,y) => `${b} ${m} ${y} г/в. Машина в хорошем состоянии: двигатель тянет хорошо, тормоза в норме, подвеска не гремит. Вложений не требует. Готова к долгой эксплуатации.`,
  (b,m,y) => `Автомобиль ${b} ${m} ${y} — отличный вариант для семьи. Просторный салон, большой багажник. Сигнализация с автозапуском, тонировка. Пробег реальный, не скрученный.`,
  (b,m,y) => `${b} ${m} ${y}. Двигатель работает как часы — масло менял по регламенту каждые 7–8 тыс. км. Кузов ровный, без коррозии. Продаю в связи с покупкой нового авто.`,
  (b,m,y) => `Хороший вариант — ${b} ${m} ${y}. Ухоженный, не гнилой, без скрытых дефектов. Пробег подтверждён сервисной книжкой. Показываю в любое удобное время.`,
  (b,m,y) => `${b} ${m} ${y} года. Второй хозяин. Взял с пробегом 45 000 км, доехал до ${Math.round(45 + (2025-y)*12)} тыс. Ни разу не попадал в ДТП. Обслуживание в фирменном сервисе. Продаю честно.`,
  (b,m,y) => `Срочно продаю ${b} ${m} ${y} — нужны деньги на другой проект. Цена ниже рынка. Машина отличная: ничего не стучит, не течёт, климатик дует хорошо. Осмотр в любое время.`,
  (b,m,y) => `${b} ${m} ${y}. Брали как семейный автомобиль — возим детей, ездим на дачу. Всё исправно: ходовая, тормоза, подвеска. Летняя и зимняя резина. Отдам в хорошие руки.`,
  (b,m,y) => `Продаётся ${b} ${m} ${y} г. Богатая комплектация: велюровый салон, навигация, мультируль, круиз-контроль. Масло и фильтры менял 3 месяца назад. Готов к торгу.`,
  (b,m,y) => `${b} ${m} ${y}, один хозяин с нового. Никогда не красился — проверяйте толщиномером. Все четыре диска родные, ни одного вмятка. Документы в порядке, чистая история.`,
  (b,m,y) => `${b} ${m} ${y}. Приобретался для деловых поездок. Пробег в основном трасса — двигатель не уставший. Кожаный салон в отличном состоянии. Реальным покупателям — скидка.`,
  (b,m,y) => `Продаю ${b} ${m} ${y}. Машина ухоженная: мойка раз в неделю, антикор делал каждый год. Зимой не эксплуатировал — стояла в тёплом гараже. Цена честная, торг 3–5%.`,
  (b,m,y) => `${b} ${m} ${y} — надёжный, экономичный. Расход по городу ${Math.round(7 + Math.random()*3)} л/100 км, по трассе ещё меньше. Без нареканий за всё время владения. Продаю только потому что взял новый.`,
  (b,m,y) => `${b} ${m} ${y}. Не курили в машине, животных не перевозили. Салон как новый. Подогрев передних и задних сидений, электропривод зеркал, электростёкла. Всё работает.`,
  (b,m,y) => `Продаётся ${b} ${m} ${y} года. Несрочно, цену не сбрасываю — знаю сколько стоит. Машина честная, можно проверить у любого мастера. Выезд на осмотр бесплатно.`,
];

// ─── inspection helpers ───────────────────────────────────────────────────────

const INSPECTOR_NAMES = [
  "Акбар Усмонов","Дониёр Маматов","Умид Рашидов","Фаррух Холиқов","Санжар Мусаев",
];

function randInspectionScore(): number {
  // Weighted: mostly 3-5
  const scores = [3,3,4,4,4,5,5];
  return pick(scores);
}

function inspectorNotes(b: string, m: string): string {
  const notes = [
    `${b} ${m} в хорошем техническом состоянии. Следов ДТП не обнаружено. ЛКП оригинальное на всех панелях. Рекомендуется замена воздушного фильтра.`,
    `Автомобиль прошёл полную диагностику. Двигатель и коробка передач в норме. Незначительный износ тормозных колодок — рекомендуется замена в ближайшие 10 000 км.`,
    `Кузов ровный, окрас равномерный. Подвеска в удовлетворительном состоянии, люфтов нет. Масло чистое, уровень в норме. Авто готово к эксплуатации.`,
    `Проверка показала хорошее общее состояние. Небольшие царапины на переднем бампере — кузов не красился. Подкрыльники целые. Рекомендуем к покупке.`,
    `Все системы исправны. Аккумулятор новый (менялся 6 месяцев назад). Шины в норме, протектор 6–7 мм. Документы и VIN совпадают.`,
  ];
  return pick(notes);
}

// ─── seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database...");

  // ── 1. Ensure admin users ──────────────────────────────────────────────────
  const adminExists = await prisma.adminUser.findFirst({ where: { email: "admin@mashina.uz" } });
  if (!adminExists) {
    const adminPassword = await bcrypt.hash("admin123", 12);
    const modPassword   = await bcrypt.hash("mod123",   12);
    await prisma.adminUser.create({ data: { email: "admin@mashina.uz", password: adminPassword, name: "Главный администратор", role: "admin" } });
    await prisma.adminUser.create({ data: { email: "mod@mashina.uz",   password: modPassword,   name: "Модератор",             role: "moderator" } });
    console.log("Created admin users.");
  } else {
    console.log("Admin users already exist — skipping.");
  }

  // ── 2. Full wipe (keep only AdminUser) ────────────────────────────────────
  console.log("Clearing old data...");
  await prisma.inspectionReport.deleteMany();
  await prisma.listingReport.deleteMany();
  await prisma.viewHistory.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.inspectionRequest.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  console.log("Done.");

  // ── 3. Create listings ────────────────────────────────────────────────────
  const TARGET = 800;
  let created = 0;

  const weights = CARS.map((c) => {
    if (["Chevrolet","Daewoo","Ravon","Lada"].includes(c.brand)) return 3;
    if (["Toyota","Hyundai","Kia","Nissan"].includes(c.brand))   return 2;
    return 1;
  });
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  const batch: Parameters<typeof prisma.listing.create>[0]["data"][] = [];

  while (created < TARGET) {
    let rand = Math.random() * totalWeight;
    let carIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { carIdx = i; break; }
    }
    const car = CARS[carIdx];

    const [yearMin, yearMax] = car.yearRange;
    const year = rnd(yearMin, yearMax);
    const yearFactor = 1 + (year - yearMin) / Math.max(yearMax - yearMin, 1) * 0.5;
    const variance = 1 + (Math.random() * 2 - 1) * car.priceVar;
    const price = Math.min(2_000_000_000, Math.round(car.basePrice * yearFactor * variance / 1_000_000) * 1_000_000);

    const age = 2025 - year;
    const baseMileage = age * rnd(8000, 20000);
    const mileage = maybe(0.1) ? rnd(0, 5000)
                  : maybe(0.15) ? rnd(200000, 400000)
                  : Math.max(0, baseMileage + rnd(-15000, 15000));
    const mileageRounded = Math.round(mileage / 1000) * 1000;

    const condition  = year >= 2024 ? "new" : maybe(0.08) ? "new" : "used";
    const engine     = pick(car.engines);
    const drive      = pick(car.drive);
    const fuel       = engine === 0.0 ? "Elektr"
                     : (car.fuels.includes("Gaz") && maybe(0.35)) ? "Gaz"
                     : pick(car.fuels.filter(f => f !== "Gaz" || car.fuels.length === 1));
    const tx         = pick(car.txs);
    const color      = pick(COLORS);
    const city       = pick(CITIES);
    const seller     = pick(SELLER_NAMES);
    const phone      = `+998 ${pick(["90","91","93","94","95","97","98","99"])} ${rnd(100,999)} ${rnd(10,99)} ${rnd(10,99)}`;
    const isVerified = maybe(0.2);
    const status     = maybe(0.04) ? "pending" : "active";
    const views      = rnd(10, 1200);

    const description = pick(DESC_TEMPLATES)(car.brand, car.model, year);

    let priceHistory = "[]";
    if (maybe(0.18) && condition === "used") {
      const oldPrice = Math.round(price * (1 + rnd(5, 22) / 100) / 1_000_000) * 1_000_000;
      priceHistory = JSON.stringify([{
        price: oldPrice,
        date: new Date(Date.now() - rnd(30, 150) * 86400000).toISOString(),
      }]);
    }

    batch.push({
      title:        `${car.brand} ${car.model} ${year}`,
      brand:        car.brand,
      model:        car.model,
      year,
      price,
      priceHistory,
      mileage:      mileageRounded,
      city,
      description,
      images:       carImages(car.brand, created),
      fuelType:     fuel,
      transmission: tx,
      color,
      bodyType:     car.bodyType,
      engineVolume: engine,
      driveType:    drive,
      condition,
      status,
      isVerified,
      sellerName:   seller,
      sellerPhone:  phone,
      isActive:     true,
      views,
    });

    created++;
  }

  console.log("Inserting listings...");
  const createdListings: { id: number; isVerified: boolean }[] = [];
  for (let i = 0; i < batch.length; i += 100) {
    const chunk = batch.slice(i, i + 100);
    const results = await Promise.all(chunk.map((data) => prisma.listing.create({ data, select: { id: true, isVerified: true } })));
    createdListings.push(...results);
    process.stdout.write(`\r  inserted ${Math.min(i + 100, batch.length)}/${TARGET}`);
  }
  console.log("");

  // ── 4. Inspection reports for verified listings ───────────────────────────
  const verifiedIds = createdListings.filter((l) => l.isVerified).map((l) => l.id);
  console.log(`Creating inspection reports for ${verifiedIds.length} verified listings...`);

  for (const listingId of verifiedIds) {
    const car = CARS[Math.floor(Math.random() * CARS.length)];
    await prisma.inspectionReport.create({
      data: {
        listingId,
        engine:          randInspectionScore(),
        transmission:    randInspectionScore(),
        suspension:      randInspectionScore(),
        brakes:          randInspectionScore(),
        electrical:      randInspectionScore(),
        interior:        randInspectionScore(),
        tires:           randInspectionScore(),
        bodyPanels:      JSON.stringify({
          front:  pick(["ok","ok","ok","scratch"]),
          rear:   pick(["ok","ok","ok","scratch"]),
          left:   pick(["ok","ok","ok","dent"]),
          right:  pick(["ok","ok","ok","dent"]),
          roof:   "ok",
          hood:   pick(["ok","ok","ok","repainted"]),
          trunk:  "ok",
        }),
        hasAccident:     maybe(0.12),
        mileageVerified: maybe(0.9),
        inspectorName:   pick(INSPECTOR_NAMES),
        inspectorNotes:  inspectorNotes(car.brand, car.model),
        inspectedAt:     new Date(Date.now() - rnd(1, 60) * 86400000),
      },
    });
  }

  console.log(`\nDone! Created ${TARGET} listings + ${verifiedIds.length} inspection reports.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
