import { useState } from "react";
import { Post, EditPostForm, Package } from "@/types/Post";

export const useEditPostModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

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
      category: "Nhà riêng",
      area: post.area.replace("m²", ""),
      price: post.price.replace(/[^\d]/g, ""),
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
      contactName: "Lê Quang Trí Đạt",
      email: "lequangtridat2000@gmail.com",
      phone: "0362411810",
      title: post.title,
      description: "",
      address: post.location,
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

  const handleSubmit = async () => {
    console.log("Submitting edit:", {
      post: editingPost?.id,
      formData,
      images: selectedImages,
      package: selectedPackage,
    });

    // Call API to update post
    // await updatePost(editingPost.id, formData, selectedImages, selectedPackage);

    closeModal();
  };

  return {
    isOpen,
    currentStep,
    editingPost,
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
};
