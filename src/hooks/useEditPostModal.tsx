import { useState } from "react";
import { Post, EditPostForm, Package } from "@/types/Post";
import { useRouter } from "next/navigation";
import { postService } from "@/services/postsService";
import { paymentService } from "@/services/paymentService";
import { useWallet } from "./useWallet";
import { toast } from "sonner";

export const useEditPostModal = () => {
  const router = useRouter();
  const { balance, formattedBalance, refresh: refreshWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EditPostForm>({
    type: "ban",
    category: "Nhà riêng",
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
  });

  const openModal = (post: Post) => {
    setEditingPost(post);
    // Populate form với data hiện tại
    setFormData({
      type: post.type,
      category: post.category || "Nhà riêng",
      area: post.area ? post.area.replace("m²", "") : "",
      price: post.price ? post.price.replace(/[^\d]/g, "") : "",
      currency: "VND",
      legalDocs: post.legalDocs || "Sổ đỏ/ Sổ hồng",
      furniture: post.furniture || "Đầy đủ",
      bedrooms: post.bedrooms || 0,
      bathrooms: post.bathrooms || 0,
      floors: post.floors || 0,
      houseDirection: post.houseDirection || "",
      balconyDirection: post.balconyDirection || "",
      roadWidth: post.roadWidth || "",
      frontWidth: post.frontWidth || "",
      contactName: post.contactName || "",
      email: post.email || "",
      phone: post.phone || "",
      title: post.title || "",
      description: post.description || "",
      address: post.address || "",
    });
    setCurrentStep(1);
    setIsOpen(true);
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
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Helper function to map Vietnamese category names to English
  const mapCategoryToEnglish = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      "Nhà riêng": "House",
      "Căn hộ/Chung cư": "Apartment",
      "Đất nền": "Land",
      "Biệt thự": "Villa",
      "Nhà mặt phố": "Townhouse",
      "Văn phòng": "Office",
      "Mặt bằng kinh doanh": "Commercial Space",
      "Nhà trọ/Phòng trọ": "Room",
    };

    return categoryMap[category] || category;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setPaymentError(null);

      if (!editingPost || !editingPost.id) {
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
        const mappedCategory = mapCategoryToEnglish(formData.category);

        // Prepare post data
        const postData = {
          ...formData,
          category: mappedCategory,
          packageId: selectedPackage.id,
          packageDuration: selectedPackage.duration,
        };

        // Update the post
        const result = await postService.updatePost(
          editingPost.id,
          postData,
          selectedImages
        );

        if (result && result.success) {
          // If post update is successful, deduct money from wallet
          try {
            const paymentResult = await paymentService.deductForPost({
              amount: selectedPackage.price,
              postId: editingPost.id,
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
              router.push("/nguoi-dung/quan-ly-tin-rao-ban-cho-thue");
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
        const result = await postService.updatePost(
          editingPost.id,
          formData,
          selectedImages
        );

        if (result && result.success) {
          toast.success("Cập nhật tin thành công!");
          closeModal();
          router.push("/nguoi-dung/quan-ly-tin-rao-ban-cho-thue");
        } else {
          toast.error("Cập nhật tin không thành công");
        }
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật tin");
      setPaymentError(error.message || "Có lỗi xảy ra khi cập nhật tin");
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
