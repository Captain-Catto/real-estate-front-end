"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { ProjectPage } from "@/components/project/ProjectPage";

export default function DuAnPage() {
  const searchParams = useSearchParams();
  const provinceCode = searchParams.get("provinceCode") || undefined;
  const districtCode = searchParams.get("districtCode") || undefined;
  const wardCode = searchParams.get("wardCode") || undefined;

  return (
    <ProjectPage
      title="Dự án toàn quốc"
      provinceCode={provinceCode}
      districtCode={districtCode}
      wardCode={wardCode}
    />
  );
}
