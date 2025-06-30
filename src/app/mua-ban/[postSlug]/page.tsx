import React from "react";
import { PropertyDetail } from "@/components/property-detail/PropertyDetail";
import { notFound } from "next/navigation";
import { postService } from "@/services/postsService";

interface PostPageProps {
  params: {
    slug: string;
    postSlug: string; // This will be the post ID
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { postSlug: postId } = params;

  try {
    // Fetch the post data using the postId
    const post = await postService.getPostById(postId);

    if (!post) {
      return notFound();
    }
    console.log("Fetched post data:", post);
    // Transform the post data to match the PropertyDetail component's expected format
    const propertyData = {
      id: post._id,
      title: post.title,
      price: post.price || "Thỏa thuận",
      currency: post.currency || "VND",
      location: post.location?.district
        ? `${post.location.district}, ${post.location.province}`
        : post.location?.province || "",
      fullLocation: [
        post.location?.street,
        post.location?.ward,
        post.location?.district,
        post.location?.province,
      ]
        .filter(Boolean)
        .join(", "),
      locationCode: post.location, // giữ lại object code nếu cần tra cứu tên ở FE
      images: post.images || [],
      slug: post.slug || "",
      area: post.area ? `${post.area} m²` : "",
      bedrooms: post.bedrooms,
      bathrooms: post.bathrooms,
      floors: post.floors,
      propertyType: post.category || "Chưa xác định",
      legalDocs: post.legalDocs || "",
      furniture: post.furniture || "",
      houseDirection: post.houseDirection || "",
      balconyDirection: post.balconyDirection || "",
      roadWidth: post.roadWidth || "",
      frontWidth: post.frontWidth || "",
      description: post.description || "",
      author: {
        username: post.contactName || post.author?.username || "Không rõ",
        phone: post.phone || post.author?.phoneNumber || "Không rõ",
        email: post.email || post.author?.email || "Không rõ",
        avatar: post.author?.avatar || "/default-avatar.png",
      },
      postedDate: post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("vi-VN")
        : "Chưa xác định",
      postType: post.packageId || "Chưa xác định",
      // Thêm các trường khác nếu cần
    };

    return <PropertyDetail property={propertyData} />;
  } catch (error) {
    console.error("Error fetching post:", error);
    return notFound();
  }
}
