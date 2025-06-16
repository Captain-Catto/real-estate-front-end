"use client";
import React from "react";

interface ProjectMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export default function ProjectMap({
  latitude,
  longitude,
  title,
}: ProjectMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=17`
    : "";

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border">
      {apiKey ? (
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Bản đồ vị trí dự án ${title}`}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-red-500">
          Thiếu Google Maps API key
        </div>
      )}
    </div>
  );
}
