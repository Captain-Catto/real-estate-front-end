import React from "react";
import { useLocationName } from "@/hooks/useLocationName";

interface LocationDisplayProps {
  provinceCode?: string;
  wardCode?: string;
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  provinceCode,
  wardCode,
  className = "",
}) => {
  const { locationName, loading } = useLocationName(provinceCode, wardCode);

  if (loading) {
    return <span className={className}>Đang tải...</span>;
  }

  if (!locationName) {
    return null;
  }

  return <span className={className}>{locationName}</span>;
};

export default LocationDisplay;
