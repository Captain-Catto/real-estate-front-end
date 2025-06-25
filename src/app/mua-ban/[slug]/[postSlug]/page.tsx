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

    // Transform the post data to match the PropertyDetail component's expected format
    const propertyData = {
      id: post.id,
      title: post.title,
      price: post.price || "Thỏa thuận",
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
      images: post.images || [],
      slug: post.slug || "",
      area: post.area ? `${post.area} m²` : "",
      bedrooms: post.bedrooms,
      bathrooms: post.bathrooms,
      propertyType: post.category || "Chưa xác định",
      description: post.description || "",
      author: {
        username: post.author.username || "Không rõ",
        phone: post.author.phoneNumber || "Không rõ",
        email: post.author.email || "Không rõ",
        avatar: post.author.avatar || "/default-avatar.png",
      },
      // Add other properties as needed
    };

    return <PropertyDetail property={propertyData} />;
  } catch (error) {
    console.error("Error fetching post:", error);
    return notFound();
  }
}
