import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────

const rnd   = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick  = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const maybe = (prob: number) => Math.random() < prob;

function carImages(brand: string, model: string, idx: number): string {
  const slug = `${brand}-${model}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const count = 2 + (idx % 3); // 2, 3, or 4 images per listing
  return JSON.stringify(
    Array.from({ length: count }, (_, i) =>
      `https://picsum.photos/seed/${slug}-${idx}-${i}/800/600`
    )
  );
}

// ─── data tables ─────────────────────────────────────────────────────────────

const CITIES = [
  "Toshkent", "Samarqand", "Namangan", "Andijon", "Farg'ona",
  "Qarshi",   "Buxoro",    "Nukus",    "Termiz",  "Jizzax",
  "Urganch",  "Qo'qon",    "Navoiy",   "Guliston","Chirchiq",
];

const COLORS = ["Oq","Qora","Kumush","Kulrang","Qizil","Ko'k","Yashil","Sariq","To'q sariq","Jigarrang"];
const TRANSMISSIONS = ["Mexanik","Avtomat","Robot","Variator"];
const FUEL_TYPES    = ["Benzin","Dizel","Gaz","Elektr","Gibrid"];

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

  // Porsche / Jaguar / Range Rover (luxury)
  { brand:"Land Rover",model:"Range Rover",basePrice:1_800_000_000,bodyType:"SUV",    engines:[3.0,4.4,5.0],   drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2013,2022], priceVar:0.2  },
  { brand:"Land Rover",model:"Discovery", basePrice:900_000_000, bodyType:"SUV",      engines:[2.0,3.0],       drive:["4x4"],        fuels:["Benzin","Dizel"],    txs:["Avtomat"],           yearRange:[2015,2022], priceVar:0.2  },
];

// ─── description templates ────────────────────────────────────────────────────

const DESC_TEMPLATES_RU = [
  (b: string, m: string, y: number) => `${b} ${m} ${y} года выпуска. Машина в отличном состоянии, один владелец. Все техническое обслуживание пройдено вовремя. Торг уместен.`,
  (b: string, m: string, y: number) => `Продаётся ${b} ${m} ${y} г. Состояние хорошее, не битая, не крашеная. Срочная продажа в связи с переездом.`,
  (b: string, m: string, y: number) => `${b} ${m} ${y}. Куплена в салоне, все документы в наличии. Регулярное ТО у официального дилера.`,
  (b: string, m: string, y: number) => `Продаю ${b} ${m} ${y} года. Машина на ходу, салон в хорошем состоянии. Без ДТП. Возможен торг при осмотре.`,
  (b: string, m: string, y: number) => `${b} ${m} ${y}. Полный привод, отличная проходимость. Зимой и летом не подведёт. Звоните, не пожалеете.`,
  (b: string, m: string, y: number) => `Продаю своего любимца ${b} ${m}. Год: ${y}. Очень аккуратный хозяин, в гараже хранилась. Свежий техосмотр.`,
  (b: string, m: string, y: number) => `${b} ${m} ${y} г/в. Полный комплект: кожаный салон, камера заднего вида, парктроник. Не требует вложений.`,
  (b: string, m: string, y: number) => `Автомобиль ${b} ${m} ${y} в идеальном состоянии. Сигнализация, тонировка. Резина летняя и зимняя в комплекте.`,
  (b: string, m: string, y: number) => `${b} ${m} ${y}. Двигатель работает как часы, масло менял регулярно. Кузов без вмятин. Продаю в связи с покупкой нового авто.`,
  (b: string, m: string, y: number) => `Хороший вариант — ${b} ${m} ${y}. Ухоженный, не гнилой. Пробег реальный, можно проверить у дилера.`,
];

// ─── seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database...");

  // Keep admin users if they exist, otherwise recreate
  const adminExists = await prisma.adminUser.findFirst({ where: { email: "admin@mashina.uz" } });
  if (!adminExists) {
    const adminPassword = await bcrypt.hash("admin123", 12);
    const modPassword   = await bcrypt.hash("mod123",   12);
    await prisma.adminUser.create({ data: { email: "admin@mashina.uz", password: adminPassword, name: "Главный администратор", role: "admin" } });
    await prisma.adminUser.create({ data: { email: "mod@mashina.uz",   password: modPassword,   name: "Модератор",             role: "moderator" } });
    console.log("Created admin users.");
  }

  // Clear only listings (keep users & admin)
  await prisma.listingReport.deleteMany();
  await prisma.viewHistory.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.listing.deleteMany();

  const TARGET = 800;
  let created = 0;

  // Distribute across car models proportionally
  const weights = CARS.map((c) => {
    // Chevrolet and popular budget brands get more listings
    if (["Chevrolet","Daewoo","Ravon","Lada"].includes(c.brand)) return 3;
    if (["Toyota","Hyundai","Kia","Nissan"].includes(c.brand))   return 2;
    return 1;
  });
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  const batch: Parameters<typeof prisma.listing.create>[0]["data"][] = [];

  while (created < TARGET) {
    // Pick weighted random car
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

    // Mileage: newer car = less km, condition affects it
    const age = 2025 - year;
    const baseMileage = age * rnd(8000, 20000);
    const mileage = maybe(0.1) ? rnd(0, 5000)            // "almost new"
                  : maybe(0.15) ? rnd(200000, 400000)    // high mileage
                  : Math.max(0, baseMileage + rnd(-15000, 15000));
    const mileageRounded = Math.round(mileage / 1000) * 1000;

    const condition = year >= 2024 ? "new" : maybe(0.08) ? "new" : "used";
    const engine    = pick(car.engines);
    const drive     = pick(car.drive);
    const fuel      = engine === 0.0 ? "Elektr" : (car.fuels.includes("Gaz") && maybe(0.35)) ? "Gaz" : pick(car.fuels.filter(f => f !== "Gaz" || car.fuels.length === 1));
    const tx        = pick(car.txs);
    const color     = pick(COLORS);
    const city      = pick(CITIES);
    const seller    = pick(SELLER_NAMES);
    const phone     = `+998 ${pick(["90","91","93","94","95","97","98","99"])} ${rnd(100,999)} ${rnd(10,99)} ${rnd(10,99)}`;
    const isVerified = maybe(0.2);
    const status    = maybe(0.05) ? "pending" : "active";
    const views     = rnd(0, 800);

    const descFn = pick(DESC_TEMPLATES_RU);
    const description = descFn(car.brand, car.model, year);

    // Some listings get a price drop (simulate price history)
    let priceHistory = "[]";
    if (maybe(0.15) && condition === "used") {
      const oldPrice = Math.round(price * (1 + rnd(5, 20) / 100) / 1_000_000) * 1_000_000;
      const histEntry = { price: oldPrice, date: new Date(Date.now() - rnd(30, 120) * 86400000).toISOString() };
      priceHistory = JSON.stringify([histEntry]);
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
      images:       carImages(car.brand, car.model, created),
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

  // Insert in chunks of 100
  for (let i = 0; i < batch.length; i += 100) {
    const chunk = batch.slice(i, i + 100);
    await Promise.all(chunk.map((data) => prisma.listing.create({ data })));
    process.stdout.write(`\r  inserted ${Math.min(i + 100, batch.length)}/${TARGET}`);
  }

  console.log(`\nDone! Created ${TARGET} listings.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
