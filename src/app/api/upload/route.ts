import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";

const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    return NextResponse.json({ error: "Только JPG, PNG, WEBP" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Файл больше 10 МБ" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Production: Cloudinary
  if (useCloudinary) {
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: "mashina_uz",
      transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
    });
    return NextResponse.json({ url: result.secure_url });
  }

  // Development: local filesystem
  const filename = `${randomUUID()}${ext}`;
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
