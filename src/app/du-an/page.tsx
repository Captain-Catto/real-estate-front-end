"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectPage } from "@/components/project/ProjectPage";

function DuAnPageInternal() {
  const searchParams = useSearchParams();

  // Sử dụng slug thay vì code
  const province = searchParams.get("province") || undefined;
  const ward = searchParams.get("ward") || undefined;
  const category = searchParams.get("category") || undefined;
  const priceRange = searchParams.get("price") || undefined;
  const areaRange = searchParams.get("area") || undefined;
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

export default function DuAnPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <DuAnPageInternal />
    </Suspense>
  );
}
