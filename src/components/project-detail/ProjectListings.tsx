"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatArea } from "@/utils/format";

interface Listing {
  id: string;
  type: "sale" | "rent";
  title: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  direction?: string;
  images: string[];
  postedDate: string;
  agent: {
    name: string;
    phone: string;
    avatar?: string;
  };
  slug: string;
}

interface ProjectListingsProps {
  projectId: string;
  projectName: string;
}

export function ProjectListings({
  projectId,
  projectName,
}: ProjectListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "sale" | "rent">("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // Mock data - replace with real API call
        const mockListings: Listing[] = [
          {
            id: "1",
            type: "sale",
            title: "Căn hộ 2PN, view sông, nội thất đầy đủ",
            price: 3200000000,
            area: 78,
            bedrooms: 2,
            bathrooms: 2,
            floor: 15,
            direction: "Đông Nam",
            images: ["/images/apartment-1.jpg", "/images/apartment-2.jpg"],
            postedDate: "2024-01-15",
            agent: {
              name: "Nguyễn Văn A",
              phone: "0901234567",
              avatar: "/images/agent-1.jpg",
            },
            slug: "can-ho-2pn-view-song-noi-that-day-du",
          },
          {
            id: "2",
            type: "rent",
            title: "Cho thuê căn hộ 3PN, full nội thất cao cấp",
            price: 25000000,
            area: 95,
            bedrooms: 3,
            bathrooms: 2,
            floor: 20,
            direction: "Nam",
            images: ["/images/apartment-3.jpg", "/images/apartment-4.jpg"],
            postedDate: "2024-01-10",
            agent: {
              name: "Trần Thị B",
              phone: "0907654321",
              avatar: "/images/agent-2.jpg",
            },
            slug: "cho-thue-can-ho-3pn-full-noi-that-cao-cap",
          },
        ];

        setTimeout(() => {
          setListings(mockListings);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setLoading(false);
      }
    };

    fetchListings();
  }, [projectId]);

  const filteredListings = listings.filter((listing) => {
    if (activeTab === "all") return true;
    return listing.type === activeTab;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "area-asc":
        return a.area - b.area;
      case "area-desc":
        return b.area - a.area;
      case "newest":
      default:
        return (
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
    }
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-32 h-24 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Tin rao tại {projectName} ({filteredListings.length})
        </h2>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="area-asc">Diện tích nhỏ đến lớn</option>
            <option value="area-desc">Diện tích lớn đến nhỏ</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: "all", label: "Tất cả", count: listings.length },
          {
            key: "sale",
            label: "Bán",
            count: listings.filter((l) => l.type === "sale").length,
          },
          {
            key: "rent",
            label: "Cho thuê",
            count: listings.filter((l) => l.type === "rent").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Listings */}
      {sortedListings.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-home text-gray-300 text-4xl mb-4"></i>
          <p className="text-gray-500">Chưa có tin rao nào cho dự án này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedListings.map((listing) => (
            <div
              key={listing.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex space-x-4">
                {/* Image */}
                <div className="relative w-32 h-24 flex-shrink-0">
                  <Image
                    src={listing.images[0] || "/images/default-apartment.jpg"}
                    alt={listing.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        listing.type === "sale"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {listing.type === "sale" ? "Bán" : "Cho thuê"}
                    </span>
                  </div>
                  {listing.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      +{listing.images.length - 1}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <Link
                    href={`/tin-rao/${listing.slug}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                  >
                    {listing.title}
                  </Link>

                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>
                      <i className="fas fa-bed mr-1"></i>
                      {listing.bedrooms} PN
                    </span>
                    <span>
                      <i className="fas fa-bath mr-1"></i>
                      {listing.bathrooms} WC
                    </span>
                    <span>
                      <i className="fas fa-expand-arrows-alt mr-1"></i>
                      {formatArea(listing.area)}
                    </span>
                    {listing.floor && (
                      <span>
                        <i className="fas fa-building mr-1"></i>
                        Tầng {listing.floor}
                      </span>
                    )}
                    {listing.direction && (
                      <span>
                        <i className="fas fa-compass mr-1"></i>
                        {listing.direction}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xl font-bold text-red-600">
                      {formatPrice(listing.price)}
                      {listing.type === "rent" && (
                        <span className="text-sm font-normal">/tháng</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {listing.agent.avatar && (
                          <Image
                            src={listing.agent.avatar}
                            alt={listing.agent.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        )}
                        <span>{listing.agent.name}</span>
                      </div>

                      <a
                        href={`tel:${listing.agent.phone}`}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <i className="fas fa-phone mr-1"></i>
                        Gọi
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {sortedListings.length > 0 && (
        <div className="text-center mt-6">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Xem thêm tin rao
          </button>
        </div>
      )}
    </div>
  );
}
