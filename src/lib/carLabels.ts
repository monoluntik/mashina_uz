const FUEL_RU: Record<string, string> = {
  Benzin: "Бензин", Dizel: "Дизель", Gaz: "Газ", Elektr: "Электро", Gibrid: "Гибрид",
};
const TRANSMISSION_RU: Record<string, string> = {
  Mexanik: "Механика", Avtomat: "Автомат", Robot: "Робот", Variator: "Вариатор",
};
const BODY_RU: Record<string, string> = {
  Sedan: "Седан", Hatchback: "Хэтчбек", SUV: "Кроссовер", Universal: "Универсал",
  Minivan: "Минивэн", Coupe: "Купе", Pickup: "Пикап", Convertible: "Кабриолет",
};
const DRIVE_RU: Record<string, string> = {
  Old: "Передний", Orqa: "Задний", "4x4": "Полный",
};
const COLOR_RU: Record<string, string> = {
  "Oq": "Белый", "Qora": "Чёрный", "Kumush": "Серебристый", "Kulrang": "Серый",
  "Qizil": "Красный", "Ko'k": "Синий", "Yashil": "Зелёный", "Sariq": "Жёлтый",
  "To'q sariq": "Оранжевый", "Jigarrang": "Коричневый",
};

export function labelFuel(val: string, locale: string)        { return locale === "ru" ? (FUEL_RU[val] ?? val)         : val; }
export function labelTransmission(val: string, locale: string){ return locale === "ru" ? (TRANSMISSION_RU[val] ?? val)  : val; }
export function labelBody(val: string, locale: string)        { return locale === "ru" ? (BODY_RU[val] ?? val)          : val; }
export function labelDrive(val: string, locale: string)       { return locale === "ru" ? (DRIVE_RU[val] ?? val)         : val; }
export function labelColor(val: string, locale: string)       { return locale === "ru" ? (COLOR_RU[val] ?? val)         : val; }
