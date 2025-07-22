import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { postService, CreatePostData } from "@/services/postsService";
import { UploadService } from "@/services/uploadService";
import { useAuth } from "@/store/hooks";
import { useWallet } from "./useWallet";
import { paymentService } from "@/services/paymentService";
import { categoryService, Category } from "@/services/categoryService";
import { ProjectService } from "@/services/projectService";
import { Project, ProjectListItem } from "@/types/project";
import { locationService, Location } from "@/services/locationService";
import { toast } from "sonner";

interface FormData {
  // Basic Info
  type: "ban" | "cho-thue";
  category: string;
  location: {
    province: string;
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
  contactName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
}

interface EditPost {
  _id: string;
  title: string;
  description?: string;
  type: "ban" | "cho-thue";
  status: string; // Thêm trường status
  category:
    | {
        _id: string;
        name: string;
        slug: string;
      }
    | string;
  location: {
    province: string;
    district: string;
    ward: string;
    street?: string;
  };
  area?: number;
  price: string;
  currency: string;
  legalDocs?: string;
  furniture?: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  houseDirection?: string;
  balconyDirection?: string;
  roadWidth?: string;
  frontWidth?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  images?: string[];
  project?: string | Project;
}

interface Package {
  _id: string;
  name: string;
  price: number;
  duration: number;
}

export function useEditPostModal() {
  const router = useRouter();
  const { user } = useAuth();
  const { balance, formattedBalance, refresh: refreshWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [editingPost, setEditingPost] = useState<EditPost | null>(null);

  // Location data state
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Form data state với thông tin từ post cần edit
  const [formData, setFormData] = useState<FormData>({
    type: "ban",
    category: "",
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
    contactName: user?.username || "",
    email: user?.email || "",
    phone: "",
    title: "",
    description: "",
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await categoryService.getByProjectType(false); // Get property categories
        const activeCategories = result.filter((cat) => cat.isActive !== false);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Không thể tải danh sách loại bất động sản");
      }
    };

    loadCategories();
  }, []);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const result = await ProjectService.getProjects();
        setProjects(result || []);
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    };

    loadProjects();
  }, []);

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLocationLoading(true);
        const result = await locationService.getProvinces();
        setProvinces(result || []);
      } catch (error) {
        console.error("Error loading provinces:", error);
        toast.error("Không thể tải danh sách tỉnh thành");
      } finally {
        setLocationLoading(false);
      }
    };

    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      // Skip loading if currently initializing or no province
      if (isInitializing || !formData.location.province) {
        setDistricts([]);
        setWards([]);
        return;
      }

      try {
        setLocationLoading(true);

        // Convert province name to code if needed
        let provinceCode = formData.location.province;

        // Check if it's already a code (numeric) or if it's a name
        if (isNaN(Number(provinceCode)) && provinces.length > 0) {
          const province = provinces.find(
            (p) =>
              p.name === provinceCode ||
              p.name.toLowerCase() === provinceCode.toLowerCase()
          );
          if (province) {
            provinceCode = province.code;
            console.log(
              "Converted province name to code:",
              formData.location.province,
              "->",
              province.code
            );
          } else {
            console.error("Province not found by name:", provinceCode);
            setDistricts([]);
            setWards([]);
            setLocationLoading(false);
            return;
          }
        }

        const result = await locationService.getDistricts(provinceCode);
        setDistricts(result || []);
        setWards([]); // Clear wards when province changes
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
        setWards([]);
      } finally {
        setLocationLoading(false);
      }
    };

    loadDistricts();
  }, [formData.location.province, provinces, isInitializing]);

  // Load wards when district changes
  useEffect(() => {
    const loadWards = async () => {
      // Skip loading if currently initializing or missing province/district
      if (
        isInitializing ||
        !formData.location.province ||
        !formData.location.district
      ) {
        setWards([]);
        return;
      }

      try {
        setLocationLoading(true);

        // Convert province name to code if needed
        let provinceCode = formData.location.province;
        if (isNaN(Number(provinceCode)) && provinces.length > 0) {
          const province = provinces.find(
            (p) =>
              p.name === provinceCode ||
              p.name.toLowerCase() === provinceCode.toLowerCase()
          );
          if (province) {
            provinceCode = province.code;
          } else {
            console.error("Province not found by name:", provinceCode);
            setWards([]);
            setLocationLoading(false);
            return;
          }
        }

        // Convert district name to code if needed
        let districtCode = formData.location.district;
        console.log(
          "🔍 Converting district:",
          districtCode,
          "from districts:",
          districts.length,
          "items"
        );

        if (isNaN(Number(districtCode)) && districts.length > 0) {
          const district = districts.find(
            (d) =>
              d.name === districtCode ||
              d.name.toLowerCase() === districtCode.toLowerCase()
          );
          if (district) {
            districtCode = district.code;
            console.log(
              "✅ Converted district name to code:",
              formData.location.district,
              "->",
              district.code
            );
          } else {
            console.error("❌ District not found by name:", districtCode);
            console.log(
              "Available districts:",
              districts.map((d) => `${d.name} (${d.code})`)
            );
            setWards([]);
            setLocationLoading(false);
            return;
          }
        } else if (isNaN(Number(districtCode))) {
          console.log(
            "⚠️ District name provided but districts array is empty. District:",
            districtCode,
            "Districts length:",
            districts.length
          );
          setWards([]);
          setLocationLoading(false);
          return;
        }

        const result = await locationService.getWards(
          provinceCode,
          districtCode
        );
        setWards(result || []);
      } catch (error) {
        console.error("Error loading wards:", error);
        setWards([]);
      } finally {
        setLocationLoading(false);
      }
    };

    loadWards();
  }, [
    formData.location.province,
    formData.location.district,
    provinces,
    districts,
    isInitializing,
  ]);

  // Initialize form data when editing post is set
  useEffect(() => {
    if (editingPost) {
      setIsInitializing(true); // Start initialization

      const categoryName =
        typeof editingPost.category === "string"
          ? editingPost.category
          : editingPost.category.name;

      setFormData({
        type: editingPost.type,
        category: categoryName,
        location: {
          province: editingPost.location.province,
          district: editingPost.location.district,
          ward: editingPost.location.ward,
          street: editingPost.location.street || "",
          project:
            typeof editingPost.project === "string"
              ? editingPost.project
              : editingPost.project?.id || "",
        },
        area: editingPost.area?.toString() || "",
        price: editingPost.price,
        currency: editingPost.currency,
        legalDocs: editingPost.legalDocs || "Sổ đỏ/ Sổ hồng",
        furniture: editingPost.furniture || "Đầy đủ",
        bedrooms: editingPost.bedrooms || 0,
        bathrooms: editingPost.bathrooms || 0,
        floors: editingPost.floors || 0,
        houseDirection: editingPost.houseDirection || "",
        balconyDirection: editingPost.balconyDirection || "",
        roadWidth: editingPost.roadWidth || "",
        frontWidth: editingPost.frontWidth || "",
        contactName: editingPost.contactName || user?.username || "",
        email: editingPost.email || user?.email || "",
        phone: editingPost.phone || "",
        title: editingPost.title,
        description: editingPost.description || "",
      });

      // Set existing images
      setExistingImages(editingPost.images || []);

      // End initialization after a brief delay to allow form data to settle
      setTimeout(() => {
        setIsInitializing(false);
      }, 100);
    }
  }, [editingPost, user]);

  const open = (post?: EditPost) => {
    if (post) {
      setEditingPost(post);
    }
    setIsOpen(true);
    setCurrentStep(1);
    setPaymentError(null);
  };

  const close = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setSelectedImages([]);
    setExistingImages([]);
    setSelectedPackage(null);
    setPaymentError(null);
    setIsInitializing(false); // Reset initialization flag
    setEditingPost(null);
    // Reset form data
    setFormData({
      type: "ban",
      category: "",
      location: {
        province: "",
        district: "",
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
      contactName: user?.username || "",
      email: user?.email || "",
      phone: "",
      title: "",
      description: "",
    });
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

  const updateFormData = (
    field: keyof FormData,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLocationField = (
    field: keyof FormData["location"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Image handlers
  const handleImageSelect = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files);
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExistingImages = (images: string[]) => {
    console.log("🔄 Updating existing images:", images.length);
    console.log("📋 New images list:", images);
    setExistingImages(images);
  };

  // Helper method to immediately update post images
  // const updatePostImages = async (newImages: string[]) => {
  //   if (!editingPost) return;

  //   try {
  //     console.log("🔄 Immediately updating post images:", newImages.length);
  //     await postService.updatePost(
  //       editingPost._id,
  //       { images: newImages },
  //       undefined
  //     );
  //     console.log("✅ Post images updated immediately");
  //     setExistingImages(newImages);
  //   } catch (error) {
  //     console.error("❌ Error updating post images immediately:", error);
  //     // Don't throw error to avoid breaking the UI, just log it
  //   }
  // };

  // Submit handlers
  const handleBasicSubmit = async () => {
    if (!editingPost) return;

    try {
      setIsSubmitting(true);

      // Prepare update data
      const updateData: Partial<CreatePostData> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        location: {
          province: formData.location.province,
          district: formData.location.district,
          ward: formData.location.ward,
          street: formData.location.street || "",
        },
        area: formData.area,
        price: formData.price,
        currency: formData.currency,
        legalDocs: formData.legalDocs,
        furniture: formData.furniture,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        floors: formData.floors,
        houseDirection: formData.houseDirection,
        balconyDirection: formData.balconyDirection,
        roadWidth: formData.roadWidth,
        frontWidth: formData.frontWidth,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
      };

      // Add project if selected
      if (formData.location.project) {
        updateData.project = formData.location.project;
      }

      console.log("Updating post with data:", updateData);

      // Include current images
      const currentImages =
        existingImages.length > 0 ? existingImages : editingPost.images || [];
      console.log("Including current images:", currentImages.length);

      // Sử dụng resubmitPost cho tin bị từ chối, updatePost cho các trường hợp khác
      const result =
        editingPost.status === "rejected"
          ? await postService.resubmitPost(
              editingPost._id,
              updateData,
              currentImages
            )
          : await postService.updatePost(
              editingPost._id,
              updateData,
              currentImages
            );

      if (result.success) {
        if (editingPost.status === "rejected") {
          toast.success("Tin đăng đã được gửi lại để chờ duyệt!");
        } else {
          toast.success("Cập nhật tin đăng thành công!");
        }
        close();
        // Refresh page or navigate
        router.refresh();
      } else {
        if (editingPost.status === "rejected") {
          toast.error(result.message || "Có lỗi xảy ra khi gửi lại tin đăng");
        } else {
          toast.error(result.message || "Có lỗi xảy ra khi cập nhật tin đăng");
        }
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Có lỗi xảy ra khi cập nhật tin đăng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSubmit = async () => {
    if (!editingPost) return;

    console.log("🖼️ Starting image submit process...");
    console.log("📸 Existing images:", existingImages.length);
    console.log("� New images to upload:", selectedImages.length);

    try {
      setIsSubmitting(true);

      let finalImagesList = [...existingImages];

      // Step 1: Upload new images if any
      if (selectedImages.length > 0) {
        console.log("📤 Uploading", selectedImages.length, "new images...");

        // Create FormData and upload images via UploadService
        const dt = new DataTransfer();
        selectedImages.forEach((file) => dt.items.add(file));
        const fileList = dt.files;

        try {
          const uploadResults = await UploadService.uploadImages(fileList);
          console.log("📦 Upload results:", uploadResults);

          const newImageUrls = uploadResults
            .filter((result) => result.success && result.data?.url)
            .map((result) => result.data!.url);

          if (newImageUrls.length > 0) {
            finalImagesList = [...existingImages, ...newImageUrls];
            console.log(
              "✅ Successfully uploaded",
              newImageUrls.length,
              "images"
            );
            console.log("🔗 New image URLs:", newImageUrls);

            // Clear selected images after successful upload
            setSelectedImages([]);
          } else {
            throw new Error("No images were uploaded successfully");
          }
        } catch (uploadError) {
          console.error("❌ Upload error:", uploadError);
          toast.error("Không thể upload hình ảnh. Vui lòng thử lại.");
          return;
        }
      }

      console.log("📋 Final images list:", finalImagesList.length, "images"); // Step 2: Always update post with current images (even if no new images were uploaded)
      // This is important for cases where user only removed or reordered existing images
      try {
        console.log("📝 Updating post images...");
        const updateResult = await postService.updatePost(
          editingPost._id,
          {}, // Empty postData object
          finalImagesList // Pass images as separate parameter
        );

        console.log("✅ Post images updated successfully:", updateResult);

        // Update local state
        setExistingImages(finalImagesList);

        toast.success("Hình ảnh đã được cập nhật thành công!");
      } catch (updateError) {
        console.error("❌ Error updating post images:", updateError);
        toast.error("Có lỗi khi cập nhật hình ảnh vào bài đăng.");
        return;
      }

      // Step 3: Decide next step based on post status
      const needsPackageSelection =
        editingPost.status === "expired" ||
        editingPost.status === "waiting_payment";

      if (needsPackageSelection) {
        console.log("⏭️ Moving to package selection step");
        nextStep();
      } else {
        console.log("✅ Edit complete - images updated successfully");
        // For other statuses, just finish the edit process
        toast.success("Tin đăng đã được cập nhật thành công!");
        setTimeout(() => {
          close();
          window.location.reload(); // Refresh to see updated images
        }, 1000);
      }
    } catch (error) {
      console.error("💥 Critical error in handleImageSubmit:", error);
      toast.error("Có lỗi xảy ra khi xử lý hình ảnh");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackageSubmit = async () => {
    if (!selectedPackage || !editingPost) return;

    try {
      setIsSubmitting(true);
      setPaymentError(null);

      const packagePrice = selectedPackage.price || 0;

      if (packagePrice > 0) {
        // Check balance
        if (balance < packagePrice) {
          setPaymentError("Số dư không đủ để thanh toán gói tin.");
          return;
        }

        // Process payment using wallet deduction
        const paymentResult = await paymentService.deductForPost({
          amount: packagePrice,
          postId: editingPost._id,
          packageId: selectedPackage._id,
        });

        if (!paymentResult.success) {
          setPaymentError(
            paymentResult.message || "Thanh toán không thành công"
          );
          return;
        }
      }

      // Update post with package
      const result =
        editingPost.status === "rejected"
          ? await postService.resubmitPost(editingPost._id, {
              packageId: selectedPackage._id,
            })
          : await postService.updatePost(editingPost._id, {
              packageId: selectedPackage._id,
            });

      if (result.success) {
        if (editingPost.status === "rejected") {
          toast.success("Tin đăng đã được gửi lại để chờ duyệt!");
        } else {
          toast.success("Cập nhật gói tin thành công!");
        }
        close();
        refreshWallet();
        router.refresh();
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi cập nhật gói tin");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Có lỗi xảy ra khi cập nhật gói tin");
      setPaymentError("Có lỗi xảy ra khi thanh toán");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    isOpen,
    currentStep,
    formData,
    selectedImages,
    existingImages,
    selectedPackage,
    isSubmitting,
    paymentError,
    categories,
    projects,
    editingPost,
    balance,
    formattedBalance,

    // Location data
    provinces,
    districts,
    wards,
    locationLoading,

    // Actions
    open,
    close,
    nextStep,
    prevStep,
    updateFormData,
    updateLocationField,
    handleImageSelect,
    removeSelectedImage,
    removeExistingImage,
    updateExistingImages,
    setSelectedImages,
    setSelectedPackage,

    // Submit handlers
    handleBasicSubmit,
    handleImageSubmit,
    handlePackageSubmit,
  };
}
