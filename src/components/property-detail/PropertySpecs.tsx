import React from "react";

interface PropertySpecsProps {
  property: {
    price: string;
    area: string;
    bedrooms: number;
    bathrooms: number;
    houseDirection: string;
    legalDocs: string;
    furniture: string;
    floor?: number;
    yearBuilt?: number;
    propertyType: string;
    balconyDirection?: string;
    frontage?: string;
    roadWidth?: string;
  };
}

export function PropertySpecs({ property }: PropertySpecsProps) {
  const specs = [
    {
      icon: "fas fa-dollar-sign",
      label: "Mức giá",
      value: property.price,
    },
    {
      icon: "fas fa-ruler-combined",
      label: "Diện tích",
      value: property.area,
    },
    {
      icon: "fas fa-bed",
      label: "Số phòng ngủ",
      value: `${property.bedrooms} phòng`,
    },
    {
      icon: "fas fa-bath",
      label: "Số phòng tắm, vệ sinh",
      value: `${property.bathrooms} phòng`,
    },
    {
      icon: "fas fa-compass",
      label: "Hướng nhà",
      value: property.houseDirection,
    },
    {
      icon: "fas fa-file-contract",
      label: "Pháp lý",
      value: property.legalDocs,
    },
    {
      icon: "fas fa-couch",
      label: "Nội thất",
      value: property.furniture,
    },
  ];

  // Conditional specs - chỉ thêm khi có dữ liệu
  if (property.floor) {
    specs.push({
      icon: "fas fa-building",
      label: "Số tầng",
      value: `${property.floor} tầng`,
    });
  }

  if (property.balconyDirection) {
    specs.push({
      icon: "fas fa-building",
      label: "Hướng ban công",
      value: property.balconyDirection,
    });
  }

  if (property.frontage) {
    specs.push({
      icon: "fas fa-home",
      label: "Mặt tiền",
      value: property.frontage,
    });
  }

  if (property.roadWidth) {
    specs.push({
      icon: "fas fa-road",
      label: "Đường vào",
      value: property.roadWidth,
    });
  }

  if (property.yearBuilt) {
    specs.push({
      icon: "fas fa-calendar",
      label: "Năm xây dựng",
      value: property.yearBuilt.toString(),
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-md mt-6">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Đặc điểm bất động sản</h3>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map((spec, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className={`${spec.icon} text-blue-600 text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-600 mb-1">{spec.label}</div>
                <div className="font-semibold text-gray-900 break-words">
                  {spec.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
