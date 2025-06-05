import React from "react";
import { PropertyDetail } from "@/components/property-detail/PropertyDetail";
import { notFound } from "next/navigation";
import imgTest from "@/assets/images/card-img.jpg";
import imgTest2 from "@/assets/images/logo-white1.svg";

// Mock data - trong thực tế sẽ fetch từ API
const mockProperty = {
  id: "43170490",
  title:
    "Giá rẻ nhất thị trường! Cần bán căn hộ 85m2 3N 2W tại Anland Premium full nội thất, sẵn sổ, có TL",
  price: "Thỏa thuận",
  location: "Hà Đông, Hà Nội",
  fullLocation:
    "Dự án Anland Premium, Đường Tố Hữu, Phường La Khê, Hà Đông, Hà Nội",
  images: [imgTest, imgTest2, imgTest],
  slug: "gia-re-nhat-thi-truong-ban-85m2-3n2w-tai-full-noi-that-san-so-co-tl",
  area: "85 m²",
  bedrooms: 3,
  bathrooms: 2,
  propertyType: "Căn hộ chung cư",
  direction: "Tây - Bắc",
  legalStatus: "Sổ đỏ/ Sổ hồng",
  furniture: "Đầy đủ",
  floor: 15,
  yearBuilt: 2020,
  description: `Căn hộ Anland Premium nằm tại Tố Hữu, La Khê, Hà Đông, Hà Nội, là một lựa chọn lý tưởng cho những ai tìm kiếm không gian sống hiện đại và tiện nghi. Với diện tích 85m², căn hộ này được thiết kế tối ưu với 3 phòng ngủ và 2 phòng tắm, phù hợp cho gia đình.

- Diện tích: 85m².
- Phòng ngủ: 3PN.
- Phòng tắm: 2WC.
- Hướng cửa chính: Tây Bắc.
- Hướng ban công: Đông Nam.
- Nội thất: Đầy đủ với điều hòa, giường, tủ lạnh...
- Pháp lý: Sổ đỏ/ Sổ hồng.
- Giá: Giá thỏa thuận.

Điểm đặc biệt: Căn hộ có phong thủy tốt với hướng cửa chính Tây Bắc và ban công Đông Nam, mang lại không gian sống thoải mái và dễ chịu.`,
  postedDate: "05/06/2025",
  expiredDate: "15/06/2025",
  postType: "Tin thường",
  code: "43170490",
  latitude: 20.977093188994164,
  longitude: 105.76226999361447,
  agent: {
    id: "agent1",
    name: "Hiếu Đỗ",
    avatar: "/images/agent-avatar.jpg",
    phone: "0386789123",
    email: "dhth1905@gmail.com",
    totalListings: 26,
  },
  project: {
    id: "anland-premium",
    name: "Anland Premium",
    image: imgTest,
    developer: "Công ty CP Tập đoàn Nam Cường Hà Nội",
    totalUnits: 575,
    status: "Bàn giao tháng 10/2020",
  },
};

interface PropertyDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  // In real app, fetch property data here
  const property = mockProperty; // This would be fetched based on params.slug

  return {
    title: `${property.title} | Real Estate`,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: [property.images[0]],
    },
  };
}

export default function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  // In real app, you would fetch the property data based on the slug
  // const property = await getPropertyBySlug(params.slug);

  const property = mockProperty;

  if (!property) {
    notFound();
  }

  return <PropertyDetail property={property} />;
}
