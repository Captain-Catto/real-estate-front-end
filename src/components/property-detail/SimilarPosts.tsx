"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { postService } from "@/services/postsService";

interface SimilarPost {
  _id: string;
  title: string;
  price: number;
  currency: string;
  area: number;
  location: {
    province: string;
    district: string;
    ward: string;
    street?: string;
  };
  images: string[];
  type: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  project?: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface SimilarPostsProps {
  postId: string;
  limit?: number;
}

const SimilarPosts: React.FC<SimilarPostsProps> = ({ postId, limit = 6 }) => {
  const [similarPosts, setSimilarPosts] = useState<SimilarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<any>(null);

  useEffect(() => {
    const fetchSimilarPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await postService.getSimilarPosts(postId, limit);
        setSimilarPosts(response.posts || []);
        setCriteria(response.criteria || null);
        
        console.log("🔍 Similar posts loaded:", response);
      } catch (err) {
        console.error("Error fetching similar posts:", err);
        setError("Không thể tải tin đăng tương tự");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchSimilarPosts();
    }
  }, [postId, limit]);

  const formatPrice = (price: number, currency: string = "VND") => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ ${currency}`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu ${currency}`;
    } else {
      return `${price.toLocaleString()} ${currency}`;
    }
  };

  const formatArea = (area: number) => {
    return `${area} m²`;
  };

  const getTypeLabel = (type: string) => {
    return type === "ban" ? "Bán" : "Cho thuê";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Tin đăng tương tự</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Tin đăng tương tự</h3>
        <div className="text-center py-8">
          <i className="fas fa-exclamation-triangle text-3xl text-gray-400 mb-3"></i>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (similarPosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4">Tin đăng tương tự</h3>
        <div className="text-center py-8">
          <i className="fas fa-search text-3xl text-gray-400 mb-3"></i>
          <p className="text-gray-500">Không tìm thấy tin đăng tương tự</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Tin đăng tương tự</h3>
        <span className="text-sm text-gray-500">
          {similarPosts.length} tin đăng
        </span>
      </div>

      {/* Search criteria info */}
      {criteria && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-sm text-blue-700">
            <i className="fas fa-info-circle mr-2"></i>
            <span>
              Tìm kiếm dựa trên: {" "}
              {criteria.hasProject && "cùng dự án, "}
              {criteria.ward && "cùng phường/xã, "}
              {criteria.district && "cùng quận/huyện, "}
              cùng loại hình
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarPosts.map((post) => (
          <Link
            key={post._id}
            href={`/chi-tiet-tin-dang/${post._id}`}
            className="block group hover:shadow-lg transition-shadow duration-200"
          >
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {post.images && post.images.length > 0 ? (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-image text-3xl text-gray-400"></i>
                  </div>
                )}
                
                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    post.type === "ban" 
                      ? "bg-red-500 text-white" 
                      : "bg-green-500 text-white"
                  }`}>
                    {getTypeLabel(post.type)}
                  </span>
                </div>

                {/* Project badge */}
                {post.project && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
                      Dự án
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h4>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-600">
                      {formatPrice(post.price, post.currency)}
                    </span>
                    <span>{formatArea(post.area)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fas fa-map-marker-alt mr-1 text-gray-400"></i>
                    <span className="line-clamp-1">
                      {post.location.street && `${post.location.street}, `}
                      {post.location.ward}, {post.location.district}
                    </span>
                  </div>

                  {post.project && (
                    <div className="flex items-center">
                      <i className="fas fa-building mr-1 text-gray-400"></i>
                      <span className="line-clamp-1">{post.project.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{post.category.name}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarPosts;
