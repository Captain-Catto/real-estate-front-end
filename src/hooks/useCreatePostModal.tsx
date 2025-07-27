import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { postService, CreatePostData } from "@/services/postsService";
import { useAuth } from "@/store/hooks";
import { useWallet } from "./useWallet";
import { paymentService } from "@/services/paymentService";
import { categoryService, Category } from "@/services/categoryService";
import { toast } from "sonner";

interface FormData {
  // Basic Info
  type: "ban" | "cho-thue";
  category: string;
  location: {
    province: string;
    district?: string; // Optional for backend compatibility
    ward: string;
    street?: string;
    project?: string;
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
  title: string;
  description: string;
}

export function useCreatePostModal() {
  const router = useRouter();
  const { user } = useAuth();

  // EMERGENCY FIX: Disable useWallet in modals to prevent multiple instances causing infinite loops
  // const { balance, formattedBalance, refresh: refreshWallet } = useWallet();
  // For now, we'll handle wallet balance checking differently or skip it in modals
  const balance = 0; // Placeholder - will get actual balance when needed
  const formattedBalance = "0₫"; // Placeholder
  const refreshWallet = () => Promise.resolve(); // No-op function

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string>("");

  // Form data state với thông tin user thật
  const [formData, setFormData] = useState<FormData>({
    type: "ban",
    category: "", // Will be set from API
    location: {
      province: "",
      ward: "",
      street: "",
      project: "",
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
    title: "",
    description: "",
  });

  // Update contact info when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
      }));
    }
  }, [user]);

  // Load default category from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await categoryService.getCategories();
        const activeCategories = result.filter(
          (cat: Category) => cat.isProject === false && cat.isActive !== false
        );
        setCategories(activeCategories);

        // Set first category as default
        if (activeCategories.length > 0) {
          const firstCategory = activeCategories[0];
          setDefaultCategory(firstCategory.id);
          setFormData((prev) => ({
            ...prev,
            category: firstCategory.id,
          }));
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  const openModal = () => {
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
        category: defaultCategory, // Use default category from API
        location: {
          province: "",
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
    if (isSubmitting) return;

    setIsSubmitting(true);
    setPaymentError(null);

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

      // Refresh wallet balance first to get the most up-to-date balance
      console.log("Refreshing wallet balance before checking...");
      await refreshWallet();

      // Check if user has enough balance to pay for the package
      if (balance < selectedPackage.price) {
        // Show more detailed error message with option to add funds
        toast.error(
          <div className="flex flex-col gap-2">
            <p>Số dư ví không đủ để thanh toán</p>
            <p className="text-sm">
              Số dư hiện tại: {formattedBalance}
              <br />
              Cần thêm:{" "}
              {(selectedPackage.price - balance).toLocaleString("vi-VN")}đ
            </p>
            <a
              href="/nguoi-dung/vi-tien"
              className="text-blue-600 hover:underline font-medium mt-1"
            >
              Nạp tiền vào ví
            </a>
          </div>,
          {
            duration: 6000,
          }
        );
        throw new Error(
          `Số dư ví không đủ để thanh toán. Số dư hiện tại: ${formattedBalance}. Vui lòng nạp thêm tiền vào ví.`
        );
      }

      // Chuẩn bị dữ liệu bài viết
      const postData: CreatePostData = {
        ...formData,
        category: formData.category, // Use category directly from form (already from API)
        packageId: selectedPackage.id,
        packageDuration: selectedPackage.duration,
        package: mapPackageIdToPackage(selectedPackage.id), // Add package field
        location: {
          province: formData.location?.province || "",
          district: "", // Thêm district rỗng cho backend compatibility
          ward: formData.location?.ward || "",
          street: formData.location?.street || "",
        },
        project: formData.location?.project || "", // Extract project to top level
        type: formData.type,
        // Xử lý direction fields để tránh empty string
        houseDirection: formData.houseDirection || undefined,
        balconyDirection: formData.balconyDirection || undefined,
      };

      // Step 2: Create the post
      const result = await postService.createPost(postData, selectedImages);

      if (result && result.success) {
        // Skip payment for free package
        if (selectedPackage.price === 0 || selectedPackage.id === "free") {
          toast.success(
            <div>
              <p className="font-medium">Đăng tin thành công!</p>
              <p className="mt-1">Tin đăng của bạn đang chờ duyệt.</p>
              <p className="mt-1 text-sm">
                Gói: {selectedPackage.name} - {selectedPackage.duration} ngày
                <br />
                Miễn phí
              </p>
            </div>,
            { duration: 5000 }
          );
          closeModal();
          router.push("/nguoi-dung/quan-ly-tin-rao-ban-cho-thue");
          return;
        }

        // If post creation is successful and not free, deduct money from wallet
        try {
          const paymentResult = await paymentService.deductForPost({
            amount: selectedPackage.price,
            postId: result.data.post._id,
            packageId: selectedPackage.id,
            description: `Thanh toán đăng tin: ${formData.title}`,
          });

          if (paymentResult && paymentResult.success) {
            // Step 4: Refresh wallet balance after payment
            await refreshWallet();

            // Step 5: Show success message with package details
            toast.success(
              <div>
                <p className="font-medium">Đăng tin thành công!</p>
                <p className="mt-1">
                  Tin đăng của bạn đã được thanh toán và đang chờ duyệt.
                </p>
                <p className="mt-1 text-sm">
                  Gói: {selectedPackage.name} - {selectedPackage.duration} ngày
                  <br />
                  Đã thanh toán: {selectedPackage.price.toLocaleString("vi-VN")}
                  đ
                </p>
              </div>,
              { duration: 5000 }
            );

            closeModal();
            router.push("/nguoi-dung/quan-ly-tin-rao-ban-cho-thue");
          } else {
            // Handle payment failure more gracefully
            setPaymentError(
              paymentResult?.message ||
                "Thanh toán không thành công, vui lòng thử lại"
            );
            toast.error(
              <div>
                <p className="font-medium">Thanh toán không thành công</p>
                <p className="mt-1">
                  Tin đăng đã được tạo nhưng chưa được thanh toán. Vui lòng
                  thanh toán trong mục quản lý tin.
                </p>
              </div>,
              { duration: 6000 }
            );

            // Still redirect user to manage their posts
            closeModal();
            router.push("/nguoi-dung/quan-ly-tin-rao-ban-cho-thue");
          }
        } catch (error) {
          console.error("Error processing payment:", error);
          toast.error("Có lỗi xảy ra khi thanh toán, vui lòng thử lại");
          setPaymentError("Có lỗi xảy ra khi thanh toán, vui lòng thử lại");

          // Still redirect user to manage their posts where they can try payment again
          closeModal();
          router.push("/nguoi-dung/quan-ly-tin-rao-ban-cho-thue");
        }
      } else {
        throw new Error(result?.message || "Có lỗi xảy ra khi đăng tin");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      // Handle the error depending on its type
      if (error instanceof Error) {
        toast.error(error.message || "Có lỗi xảy ra khi đăng tin!");
      } else {
        toast.error("Có lỗi xảy ra khi đăng tin!");
      }
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
    paymentError,
    categories,
    defaultCategory,
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
