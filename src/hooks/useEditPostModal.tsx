import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/services/postsService";
import { EditPostForm } from "@/types/editPost";
import { postService } from "@/services/postsService";
import { paymentService } from "@/services/paymentService";
import { locationService } from "@/services/locationService";
import { useWallet } from "./useWallet";
import { toast } from "sonner";

// Define the Package interface if it doesn't exist elsewhere
interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

// Define the Package interface if it doesn't exist elsewhere
interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export const useEditPostModal = (onSuccess?: () => void) => {
  const router = useRouter();
  const { balance, formattedBalance, refresh: refreshWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Location data state
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState<EditPostForm>({
    type: "ban",
    category: "",
    area: "",
    price: "",
    currency: "VND",
    legalDocs: "Sổ đỏ/ Sổ hồng",
    furniture: "Đầy đủ",
    bedrooms: 0,
    bathrooms: 0,
    floors: 0,
    houseDirection: "",
    balconyDirection: "",
    roadWidth: "",
    frontWidth: "",
    contactName: "",
    email: "",
    phone: "",
    title: "",
    description: "",
    address: "",
    location: {
      province: "",
      district: "",
      ward: "",
      street: "",
    },
    packageId: "free",
    packageDuration: 7,
    images: [],
  });

  // Location data fetching functions
  const fetchProvinces = async () => {
    setLocationLoading(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      setProvinces([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchDistricts = async (provinceCode: string) => {
    setLocationLoading(true);
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchWards = async (provinceCode: string, districtCode: string) => {
    setLocationLoading(true);
    try {
      const data = await locationService.getWards(provinceCode, districtCode);
      setWards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWards([]);
    } finally {
      setLocationLoading(false);
    }
  };
  const openModal = async (post: Post | Record<string, any>) => {
    setEditingPost(post);

    // Reset location data arrays
    setProvinces([]);
    setDistricts([]);
    setWards([]);

    // Log post data for debugging
    console.log("Opening modal with post:", post);
    console.log("Post images:", post.images);

    // Reset selected images (we're going to use the existing images from the post)
    setSelectedImages([]);

    // Reset location loading state
    setLocationLoading(true);

    try {
      // Step 1: Load all provinces
      const provincesData = await locationService.getProvinces();
      setProvinces(Array.isArray(provincesData) ? provincesData : []);

      // Initialize location codes
      let provinceCode = "";
      let districtCode = "";
      let wardCode = "";

      // Step 2: Find matching province by name and get its code
      if (post.location?.province && Array.isArray(provincesData)) {
        const matchedProvince = provincesData.find(
          (p) =>
            p.name === post.location.province ||
            p.code === post.location.province
        );

        if (matchedProvince) {
          provinceCode = matchedProvince.code;

          // Step 3: Load districts for this province
          const districtsData = await locationService.getDistricts(
            provinceCode
          );
          setDistricts(Array.isArray(districtsData) ? districtsData : []);

          // Step 4: Find matching district by name and get its code
          if (post.location?.district && Array.isArray(districtsData)) {
            const matchedDistrict = districtsData.find(
              (d) =>
                d.name === post.location.district ||
                d.code === post.location.district
            );

            if (matchedDistrict) {
              districtCode = matchedDistrict.code;

              // Step 5: Load wards for this district
              const wardsData = await locationService.getWards(
                provinceCode,
                districtCode
              );
              setWards(Array.isArray(wardsData) ? wardsData : []);

              // Step 6: Find matching ward by name and get its code
              if (post.location?.ward && Array.isArray(wardsData)) {
                const matchedWard = wardsData.find(
                  (w) =>
                    w.name === post.location.ward ||
                    w.code === post.location.ward
                );

                if (matchedWard) {
                  wardCode = matchedWard.code;
                }
              }
            }
          }
        }
      }

      // Populate form với data hiện tại và location codes
      setFormData({
        type: post.type,
        category: post.category || "",
        area:
          post.area !== undefined ? String(post.area).replace("m²", "") : "",
        price:
          post.price !== undefined
            ? typeof post.price === "string"
              ? post.price.replace(/[^\d]/g, "")
              : String(post.price)
            : "",
        currency: post.currency || "VND",
        legalDocs: post.legalDocs || "Sổ đỏ/ Sổ hồng",
        furniture: post.furniture || "Đầy đủ",
        bedrooms: post.bedrooms || 0,
        bathrooms: post.bathrooms || 0,
        floors: post.floors || 0,
        houseDirection: post.houseDirection || "",
        balconyDirection: post.balconyDirection || "",
        roadWidth: post.roadWidth || "",
        frontWidth: post.frontWidth || "",
        contactName: post.author?.username || "",
        email: post.author?.email || "",
        phone: post.phone || "",
        title: post.title || "",
        description: post.description || "",
        address: post.address || "",
        // Use codes instead of names for location
        location: {
          province: provinceCode || post.location?.province || "",
          district: districtCode || post.location?.district || "",
          ward: wardCode || post.location?.ward || "",
          street: post.location?.street || "",
        },
        packageId: post.packageId || post.package || "free",
        packageDuration: post.packageDuration || 7,
        images: Array.isArray(post.images)
          ? post.images.filter(
              (img) =>
                typeof img === "string" &&
                (img.startsWith("http") || img.startsWith("/"))
            )
          : [],
      });

      // Log the images being set
      console.log(
        "Setting images in form data:",
        Array.isArray(post.images)
          ? post.images.filter(
              (img) =>
                typeof img === "string" &&
                (img.startsWith("http") || img.startsWith("/"))
            )
          : []
      );
    } catch (error) {
      console.error("Error loading location data:", error);
      // Set default form data even if location loading fails
      setFormData({
        type: post.type,
        category: post.category || "",
        area:
          post.area !== undefined ? String(post.area).replace("m²", "") : "",
        price:
          post.price !== undefined
            ? typeof post.price === "string"
              ? post.price.replace(/[^\d]/g, "")
              : String(post.price)
            : "",
        currency: post.currency || "VND",
        legalDocs: post.legalDocs || "Sổ đỏ/ Sổ hồng",
        furniture: post.furniture || "Đầy đủ",
        bedrooms: post.bedrooms || 0,
        bathrooms: post.bathrooms || 0,
        floors: post.floors || 0,
        houseDirection: post.houseDirection || "",
        balconyDirection: post.balconyDirection || "",
        roadWidth: post.roadWidth || "",
        frontWidth: post.frontWidth || "",
        contactName: post.author?.username || "",
        email: post.author?.email || "",
        phone: post.phone || "",
        title: post.title || "",
        description: post.description || "",
        address: post.address || "",
        location: post.location || {
          province: "",
          district: "",
          ward: "",
          street: "",
        },
        packageId: post.packageId || post.package || "free",
        packageDuration: post.packageDuration || 7,
        images: Array.isArray(post.images)
          ? post.images.filter(
              (img) =>
                typeof img === "string" &&
                (img.startsWith("http") || img.startsWith("/"))
            )
          : [],
      });

      // Log the images being set
      console.log(
        "Setting images in form data:",
        Array.isArray(post.images)
          ? post.images.filter(
              (img) =>
                typeof img === "string" &&
                (img.startsWith("http") || img.startsWith("/"))
            )
          : []
      );
    } finally {
      setLocationLoading(false);
      setCurrentStep(1);
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setEditingPost(null);
    setSelectedImages([]);
    setSelectedPackage(null);
    setPaymentError(null);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<EditPostForm>) => {
    setFormData((prev: EditPostForm) => ({ ...prev, ...updates }));
  };

  // Map packageId to package enum for backend
  const mapPackageIdToPackage = (packageId: string) => {
    switch (packageId) {
      case "free":
        return "free";
      case "basic":
        return "basic";
      case "premium":
        return "premium";
      case "vip":
        return "vip";
      default:
        return "free"; // Default fallback
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setPaymentError(null);

      if (!editingPost || (!editingPost._id && !editingPost.id)) {
        throw new Error("Không tìm thấy thông tin bài đăng");
      }

      // Check if a package is selected and user has enough balance
      if (selectedPackage) {
        // Check wallet balance
        if (balance < selectedPackage.price) {
          throw new Error(
            `Số dư ví không đủ để thanh toán. Số dư hiện tại: ${formattedBalance}. Vui lòng nạp thêm tiền vào ví.`
          );
        }

        // Map category to English if needed
        const mappedCategory = formData.category;

        // Prepare post data
        const postData = {
          ...formData,
          category: mappedCategory,
          packageId: selectedPackage.id,
          packageDuration: selectedPackage.duration,
          package: mapPackageIdToPackage(selectedPackage.id), // Add package field
        };

        // Update the post
        const result = await postService.updatePost(
          editingPost._id || editingPost.id,
          postData,
          editingPost.images // Use existing images
        );

        if (result && result.success) {
          // Skip payment for free package
          if (selectedPackage.price === 0 || selectedPackage.id === "free") {
            toast.success(
              "Cập nhật tin thành công! Tin đăng của bạn đang chờ duyệt."
            );
            closeModal();
            if (onSuccess) {
              onSuccess(); // Gọi callback để refresh data
            }
            return;
          }

          // If post update is successful and not free, deduct money from wallet
          try {
            const paymentResult = await paymentService.deductForPost({
              amount: selectedPackage.price,
              postId: editingPost._id || editingPost.id,
              packageId: selectedPackage.id,
              description: `Thanh toán cập nhật tin: ${formData.title}`,
            });

            if (paymentResult && paymentResult.success) {
              // Refresh wallet balance after payment
              refreshWallet();

              toast.success(
                "Cập nhật tin thành công! Tin đăng của bạn đang chờ duyệt."
              );
              closeModal();
              if (onSuccess) {
                onSuccess(); // Gọi callback để refresh data
              }
            } else {
              setPaymentError(
                paymentResult?.message ||
                  "Thanh toán không thành công, vui lòng thử lại"
              );
              toast.error("Thanh toán không thành công, vui lòng thử lại");
            }
          } catch (paymentError) {
            console.error("Error processing payment:", paymentError);
            toast.error("Có lỗi xảy ra khi thanh toán, vui lòng thử lại");
            setPaymentError("Có lỗi xảy ra khi thanh toán, vui lòng thử lại");
          }
        } else {
          toast.error("Cập nhật tin không thành công");
          setPaymentError("Cập nhật tin không thành công");
        }
      } else {
        // If no package is selected, just update the post without charging
        const postId =
          editingPost?._id || (editingPost as Record<string, any>)?.id;
        console.log("Updating post with ID:", postId);

        if (!postId) {
          throw new Error("Không tìm thấy ID bài đăng để cập nhật");
        }

        // Kiểm tra xem có phải là tin bị từ chối hoặc hết hạn cần resubmit không
        const isRejected = editingPost?.status === "rejected"; // Không duyệt
        const isExpired = editingPost?.status === "expired"; // Hết hạn

        let result;
        if (isRejected || isExpired) {
          // Sử dụng resubmit endpoint để chuyển trạng thái về pending
          result = await postService.resubmitPost(
            postId,
            formData,
            selectedImages.length > 0 ? [] : undefined
          );

          if (result && result.success) {
            toast.success("Gửi lại tin thành công! Tin đăng đang chờ duyệt.");
          }
        } else {
          // Sử dụng update thông thường cho các trường hợp khác
          result = await postService.updatePost(
            postId,
            formData,
            selectedImages.length > 0 ? [] : undefined
          );

          if (result && result.success) {
            // Thông báo khác nhau tùy theo trạng thái tin đăng
            if (
              editingPost?.status === "active" ||
              editingPost?.status === "waiting_display" ||
              editingPost?.status === "waiting_publish" ||
              editingPost?.status === "near_expiry"
            ) {
              toast.success(
                "Cập nhật tin thành công! Tin đăng sẽ được duyệt lại."
              );
            } else {
              toast.success("Cập nhật tin thành công!");
            }
          }
        }

        if (result && result.success) {
          closeModal();
          if (onSuccess) {
            onSuccess(); // Gọi callback để refresh data
          }
        } else {
          toast.error("Cập nhật tin không thành công");
        }
      }
    } catch (error: Error | unknown) {
      console.error("Submit error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật tin";
      toast.error(errorMessage);
      setPaymentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    currentStep,
    editingPost,
    formData,
    selectedImages,
    selectedPackage,
    isSubmitting,
    paymentError,
    provinces,
    districts,
    wards,
    locationLoading,
    openModal,
    closeModal,
    nextStep,
    prevStep,
    updateFormData,
    setSelectedImages,
    setSelectedPackage,
    handleSubmit,
  };
};
