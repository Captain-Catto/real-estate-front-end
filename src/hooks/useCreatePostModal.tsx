import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  // Basic Info
  type: "ban" | "cho-thue";
  category: string;
  address: string;
  area: string;
  price: string;
  currency: string;
  legalDocs: string;
  furniture: string;
  bedrooms: number;
  bathrooms: number;
  contactName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
}

export function useCreatePostModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    type: "ban",
    category: "Nhà riêng",
    address: "",
    area: "",
    price: "",
    currency: "VND",
    legalDocs: "Sổ đỏ/ Sổ hồng",
    furniture: "Đầy đủ",
    bedrooms: 0,
    bathrooms: 0,
    contactName: "",
    email: "",
    phone: "",
    title: "",
    description: "",
  });

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
        category: "Nhà riêng",
        address: "",
        area: "",
        price: "",
        currency: "VND",
        legalDocs: "Sổ đỏ/ Sổ hồng",
        furniture: "Đầy đủ",
        bedrooms: 0,
        bathrooms: 0,
        contactName: "",
        email: "",
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

  const handleSubmit = async () => {
    try {
      console.log("Submitting post data:", {
        formData,
        selectedImages,
        selectedPackage,
      });

      // TODO: Call API to create post
      // const response = await createPost({
      //   ...formData,
      //   images: selectedImages,
      //   package: selectedPackage,
      // });

      // Show success message
      alert("Đăng tin thành công!");

      // Close modal and redirect
      closeModal();
      router.push("/nguoi-dung/quan-ly-tin-rao-ban-cho-thue");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Có lỗi xảy ra khi đăng tin!");
    }
  };

  return {
    isOpen,
    currentStep,
    formData,
    selectedImages,
    selectedPackage,
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
