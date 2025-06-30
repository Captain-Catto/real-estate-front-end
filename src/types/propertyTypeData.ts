// Định nghĩa các loại bất động sản theo từng nhóm: mua bán, cho thuê, dự án

export const propertyTypeData = {
  // Loại BĐS mua bán
  sell: [
    { value: "1", name: "Nhà riêng", slug: "nha-rieng", icon: "home" },
    {
      value: "2",
      name: "Căn hộ chung cư",
      slug: "can-ho-chung-cu",
      icon: "apartment",
    },
    { value: "3", name: "Đất nền", slug: "dat-nen", icon: "land" },
    {
      value: "4",
      name: "Đất nền dự án",
      slug: "dat-nen-du-an",
      icon: "land-project",
    },
    {
      value: "5",
      name: "Trang trại, khu nghỉ dưỡng",
      slug: "trang-trai-khu-nghi-duong",
      icon: "villa",
    },
    { value: "6", name: "Nhà xưởng", slug: "nha-xuong", icon: "factory" },
    { value: "7", name: "Văn phòng", slug: "van-phong", icon: "office" },
    {
      value: "8",
      name: "Mặt bằng kinh doanh",
      slug: "mat-bang-kinh-doanh",
      icon: "shop",
    },
  ],

  // Loại BĐS cho thuê
  rent: [
    {
      value: "10",
      name: "Nhà riêng",
      slug: "nha-rieng-cho-thue",
      icon: "home",
    },
    {
      value: "11",
      name: "Căn hộ chung cư",
      slug: "can-ho-chung-cu-cho-thue",
      icon: "apartment",
    },
    {
      value: "12",
      name: "Văn phòng",
      slug: "van-phong-cho-thue",
      icon: "office",
    },
    {
      value: "13",
      name: "Mặt bằng kinh doanh",
      slug: "mat-bang-kinh-doanh-cho-thue",
      icon: "shop",
    },
    {
      value: "14",
      name: "Phòng trọ",
      slug: "phong-tro-cho-thue",
      icon: "room",
    },
    {
      value: "15",
      name: "Kho, xưởng",
      slug: "kho-xuong-cho-thue",
      icon: "warehouse",
    },
    {
      value: "16",
      name: "Nhà trọ, phòng trọ",
      slug: "nha-tro-phong-tro",
      icon: "hostel",
    },
    { value: "17", name: "Kho, bãi", slug: "kho-bai", icon: "storage" },
  ],

  // Loại BĐS dự án
  project: [
    {
      value: "20",
      name: "Căn hộ chung cư",
      slug: "du-an-can-ho-chung-cu",
      icon: "apartment-project",
    },
    {
      value: "21",
      name: "Cao ốc văn phòng",
      slug: "du-an-cao-oc-van-phong",
      icon: "office-building",
    },
    {
      value: "22",
      name: "Trung tâm thương mại",
      slug: "du-an-trung-tam-thuong-mai",
      icon: "mall",
    },
    {
      value: "23",
      name: "Khu đô thị mới",
      slug: "du-an-khu-do-thi-moi",
      icon: "urban-area",
    },
    {
      value: "24",
      name: "Khu phức hợp",
      slug: "du-an-khu-phuc-hop",
      icon: "complex",
    },
    {
      value: "25",
      name: "Nhà ở xã hội",
      slug: "du-an-nha-o-xa-hoi",
      icon: "social-housing",
    },
    {
      value: "26",
      name: "Khu nghỉ dưỡng, Sinh thái",
      slug: "du-an-khu-nghi-duong",
      icon: "resort",
    },
    {
      value: "27",
      name: "Khu công nghiệp",
      slug: "du-an-khu-cong-nghiep",
      icon: "industrial",
    },
  ],
};

// Các khoảng giá phổ biến
export const priceRanges = {
  sell: [
    { value: "0-500", label: "< 500 triệu", slug: "duoi-500-trieu" },
    { value: "500-1000", label: "500 - 1 tỷ", slug: "500-trieu-1-ty" },
    { value: "1000-3000", label: "1 - 3 tỷ", slug: "1-3-ty" },
    { value: "3000-5000", label: "3 - 5 tỷ", slug: "3-5-ty" },
    { value: "5000-10000", label: "5 - 10 tỷ", slug: "5-10-ty" },
    { value: "10000-15000", label: "10 - 15 tỷ", slug: "10-15-ty" },
    { value: "15000-20000", label: "15 - 20 tỷ", slug: "15-20-ty" },
    { value: "20000-100000", label: "20 - 100 tỷ", slug: "20-100-ty" },
    { value: "100000-1000000", label: "> 100 tỷ", slug: "tren-100-ty" },
  ],
  rent: [
    { value: "0-3", label: "< 3 triệu", slug: "duoi-3-trieu" },
    { value: "3-5", label: "3 - 5 triệu", slug: "3-5-trieu" },
    { value: "5-10", label: "5 - 10 triệu", slug: "5-10-trieu" },
    { value: "10-20", label: "10 - 20 triệu", slug: "10-20-trieu" },
    { value: "20-50", label: "20 - 50 triệu", slug: "20-50-trieu" },
    { value: "50-100", label: "50 - 100 triệu", slug: "50-100-trieu" },
    { value: "100-1000", label: "> 100 triệu", slug: "tren-100-trieu" },
  ],
};

// Các khoảng diện tích phổ biến
export const areaRanges = [
  { value: "0-30", label: "< 30 m²", slug: "duoi-30-m" },
  { value: "30-50", label: "30 - 50 m²", slug: "30-50-m" },
  { value: "50-80", label: "50 - 80 m²", slug: "50-80-m" },
  { value: "80-100", label: "80 - 100 m²", slug: "80-100-m" },
  { value: "100-150", label: "100 - 150 m²", slug: "100-150-m" },
  { value: "150-200", label: "150 - 200 m²", slug: "150-200-m" },
  { value: "200-500", label: "200 - 500 m²", slug: "200-500-m" },
  { value: "500-10000", label: "> 500 m²", slug: "tren-500-m" },
];

// Hướng nhà
export const houseDirections = [
  { value: "dong", label: "Đông" },
  { value: "tay", label: "Tây" },
  { value: "nam", label: "Nam" },
  { value: "bac", label: "Bắc" },
  { value: "dong-bac", label: "Đông Bắc" },
  { value: "dong-nam", label: "Đông Nam" },
  { value: "tay-bac", label: "Tây Bắc" },
  { value: "tay-nam", label: "Tây Nam" },
];

// Hàm hỗ trợ để tìm loại BĐS theo slug
export const getPropertyTypeBySlug = (slug: string) => {
  // Tìm trong tất cả các loại BĐS
  const allPropertyTypes = [
    ...propertyTypeData.sell,
    ...propertyTypeData.rent,
    ...propertyTypeData.project,
  ];

  return allPropertyTypes.find((type) => type.slug === slug);
};

// Hàm hỗ trợ để tìm loại BĐS theo giá trị
export const getPropertyTypeByValue = (value: string) => {
  const allPropertyTypes = [
    ...propertyTypeData.sell,
    ...propertyTypeData.rent,
    ...propertyTypeData.project,
  ];

  return allPropertyTypes.find((type) => type.value === value);
};
