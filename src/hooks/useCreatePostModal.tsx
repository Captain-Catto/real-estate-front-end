import { useState } from "react";
import { useRouter } from "next/navigation";
import { postService, CreatePostData } from "@/services/postsService";
import { useAuth } from "@/store/hooks";

interface FormData {
  // Basic Info
  type: "ban" | "cho-thue";
  category: string;
  location: {
    province: string;
    district: string;
    ward: string;
    street?: string;
  };
  area: string;
  price: string;
  currency: string;
  legalDocs: string;
  furniture: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  houseDirection: string;
  balconyDirection: string;
  roadWidth: string;
  frontWidth: string;
  contactName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
}

export function useCreatePostModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state với thông tin user thật
  const [formData, setFormData] = useState<FormData>({
    type: "ban",
    category: "Nhà riêng",
    location: {
      province: "",
      district: "",
      ward: "",
      street: "",
    },
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
    contactName: user?.username || "",
    email: user?.email || "",
    phone: "", // Có thể lấy từ user profile nếu có
    title: "",
    description: "",
  });

  const openModal = () => {
    // Reset form với thông tin user hiện tại
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contactName: user.username || "",
        email: user.email || "",
      }));
    }
    setIsOpen(true);
    setCurrentStep(1);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Reset form when closing
    setTimeout(() => {
      setCurrentStep(1);
      setSelectedImages([]);
      setSelectedPackage(null);
      setFormData({
        type: "ban",
        category: "Nhà riêng",
        location: {
          province: "",
          district: "",
          ward: "",
          street: "",
        },
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
        contactName: user?.username || "",
        email: user?.email || "",
        phone: "",
        title: "",
        description: "",
      });
    }, 300);
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

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Map category Vietnamese -> English
  const mapCategoryToEnglish = (category: string) => {
    switch (category) {
      case "Nhà riêng":
        return "house";
      case "Chung cư":
        return "apartment";
      case "Nhà mặt phố":
        return "townhouse";
      case "Biệt thự":
        return "villa";
      case "Đất":
        return "land";
      case "Căn hộ dịch vụ":
        return "serviced-apartment";
      // Thêm các trường hợp khác nếu cần
      default:
        return category;
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.price || !formData.area) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
      }

      if (selectedImages.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một hình ảnh");
      }

      if (!selectedPackage) {
        throw new Error("Vui lòng chọn gói đăng tin");
      }

      // Map category sang tiếng Anh
      const mappedCategory = mapCategoryToEnglish(formData.category);

      // Chuẩn bị dữ liệu bài viết
      const postData: CreatePostData = {
        ...formData,
        category: mappedCategory,
        packageId: selectedPackage.id,
        packageDuration: selectedPackage.duration,
        location: {
          province: formData.location?.province || "",
          district: formData.location?.district || "",
          ward: formData.location?.ward || "",
          street: formData.location?.street || "",
          // Có thể thêm project nếu backend có
        },
        type: formData.type,
      };
      console.log("Post data to be sent:", postData);
      // Gửi request, selectedImages là File[]
      const result = await postService.createPost(postData, selectedImages);

      if (result && result.success) {
        alert("Đăng tin thành công! Tin đăng của bạn đang chờ duyệt.");
        closeModal();
        router.push("/nguoi-dung/quan-ly-tin-rao-ban-cho-thue");
      } else {
        throw new Error(result?.message || "Có lỗi xảy ra khi đăng tin");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(error.message || "Có lỗi xảy ra khi đăng tin!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    currentStep,
    formData,
    selectedImages,
    selectedPackage,
    isSubmitting,
    openModal,
    closeModal,
    nextStep,
    prevStep,
    updateFormData,
    setSelectedImages,
    setSelectedPackage,
    handleSubmit,
  };
}
