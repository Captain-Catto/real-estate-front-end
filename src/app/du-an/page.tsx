"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { ProjectPage } from "@/components/project/ProjectPage";

export default function DuAnPage() {
  const searchParams = useSearchParams();

  // Sử dụng slug thay vì code
  const province = searchParams.get("province") || undefined;
  const ward = searchParams.get("ward") || undefined;
  const category = searchParams.get("category") || undefined;
  const priceRange = searchParams.get("priceRange") || undefined;
  const areaRange = searchParams.get("areaRange") || undefined;
  const status = searchParams.get("status") || undefined;
  const sortBy = searchParams.get("sortBy") || undefined;
  const search = searchParams.get("search") || undefined;
  const developerId = searchParams.get("developerId") || undefined;

  return (
    <ProjectPage
      title="Dự án toàn quốc"
      search={search}
      province={province}
      ward={ward}
      category={category}
      priceRange={priceRange}
      areaRange={areaRange}
      status={status}
      sortBy={sortBy}
      developerId={developerId}
    />
  );
}
