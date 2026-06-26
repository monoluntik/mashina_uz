"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  brand: string;
  model: string;
}

export default function ImageGallery({
  images,
  alt,
  brand,
  model,
}: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);

  const allImages =
    images.length > 0
      ? images
      : [
          `https://placehold.co/800x500/e2e8f0/64748b?text=${encodeURIComponent(brand + " " + model)}`,
        ];

  const prev = useCallback(() => setCurrent((c) => (c - 1 + allImages.length) % allImages.length), [allImages.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % allImages.length), [allImages.length]);

  useEffect(() => {
    if (allImages.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, allImages.length]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main image */}
      <div className="relative h-80 sm:h-96 bg-gray-100">
        <img
          src={allImages[current]}
          alt={`${alt} — фото ${current + 1}`}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {current + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === current ? "border-blue-500" : "border-transparent"
              }`}
            >
              <img
                src={img}
                alt={`${alt} — миниатюра ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
