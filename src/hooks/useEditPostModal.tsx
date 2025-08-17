import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRef } from "react";
import { postService, adminPostsService } from "@/services/postsService";
import { UploadService } from "@/services/uploadService";
import { useAuth } from "@/store/hooks";
import { paymentService } from "@/services/paymentService";
import { categoryService, Category } from "@/services/categoryService";
import { ProjectService } from "@/services/projectService";
import { Project, ProjectListItem } from "@/types/project";
import {
  locationService,
  Location,
  AdminProvince,
} from "@/services/locationService";
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
  const pathname = usePathname();
  const { user } = useAuth();

  // Determine if we're in admin context based on URL
  const isAdminContext = pathname?.includes("/admin/") || false;

  // EMERGENCY FIX: Disable useWallet in modals to prevent multiple instances causing infinite loops
  // const { balance, formattedBalance, refresh: refreshWallet } = useWallet();
  // For now, we'll handle wallet balance checking differently or skip it in modals
  const balance = 0; // Placeholder - will get actual balance when needed
  const formattedBalance = "0₫"; // Placeholder
  const refreshWallet = () => Promise.resolve(); // No-op function

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

  // Location data state - Cấu trúc 2 tầng mới (Tỉnh/Thành phố → Phường/Xã)
  const [provinces, setProvinces] = useState<AdminProvince[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const hasInitialized = useRef(false);

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
    title: "",
    description: "",
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await categoryService.getCategories();
        const activeCategories = result.filter(
          (cat: Category) => cat.isProject === false && cat.isActive !== false
        );
        console.log("Active categories:", activeCategories);
        setCategories(activeCategories);
      } catch {
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
      } catch {
        toast.error("Không thể tải danh sách dự án");
      }
    };

    loadProjects();
  }, []);

  // Load provinces - Sử dụng API mới đã được chuẩn hóa
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLocationLoading(true);
        // Sử dụng API đã được cập nhật
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const response = await fetch(`${API_URL}/api/locations/provinces`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Transform data để phù hợp với Location interface
          const transformedProvinces = result.data.map(
            (province: {
              name: string;
              code: string;
              slug: string;
              type: string;
              name_with_type: string;
            }) => ({
              _id: province.code || "",
              name: province.name,
              code: province.code,
              slug: province.slug,
              type: province.type,
              name_with_type: province.name_with_type,
            })
          );
          setProvinces(transformedProvinces);
        } else {
          toast.error("Dữ liệu tỉnh thành không hợp lệ");
          setProvinces([]);
        }
      } catch {
        toast.error("Không thể tải danh sách tỉnh thành");
        setProvinces([]);
      } finally {
        setLocationLoading(false);
      }
    };

    loadProvinces();
  }, []);

  // Load wards when province changes - Cấu trúc 2 tầng mới
  useEffect(() => {
    const loadWards = async () => {
      // Skip loading if currently initializing or no province
      if (isInitializing || !formData.location.province) {
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
            provinceCode = String(province.code);
            console.log(
              "Converted province name to code:",
              formData.location.province,
              "->",
              province.code
            );
          } else {
            toast.error("Không tìm thấy tỉnh thành");
            setWards([]);
            setLocationLoading(false);
            return;
          }
        }

        // Load wards directly from province (no districts in 2-tier structure)
        const result = await locationService.getWardsFromProvince(provinceCode);
        setWards(result || []);
      } catch {
        toast.error("Không thể tải danh sách phường xã");
        setWards([]);
      } finally {
        setLocationLoading(false);
      }
    };

    loadWards();
  }, [formData.location.province, provinces, isInitializing, setWards]);

  // Initialize form data when editing post is set
  useEffect(() => {
    if (editingPost && user && !hasInitialized.current) {
      // Only initialize once per post
      hasInitialized.current = true;
      setIsInitializing(true); // Start initialization

      console.log("🔍 editingPost data:", editingPost);
      console.log("🏠 editingPost.houseDirection:", editingPost.houseDirection);
      console.log(
        "🌅 editingPost.balconyDirection:",
        editingPost.balconyDirection
      );
      console.log("🛣️ editingPost.roadWidth:", editingPost.roadWidth);
      console.log("🏠 editingPost.frontWidth:", editingPost.frontWidth);
      console.log("🛏️ editingPost.bedrooms:", editingPost.bedrooms);
      console.log("🚿 editingPost.bathrooms:", editingPost.bathrooms);
      console.log("🏢 editingPost.floors:", editingPost.floors);
      console.log("📄 editingPost.legalDocs:", editingPost.legalDocs);
      console.log("🪑 editingPost.furniture:", editingPost.furniture);

      const categoryName =
        typeof editingPost.category === "string"
          ? editingPost.category
          : editingPost.category.name;

      setFormData({
        type: editingPost.type,
        category: categoryName,
        location: {
          province: editingPost.location.province,
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
      hasInitialized.current = false; // Reset initialization flag for new post
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
    hasInitialized.current = false; // Reset initialization tracking
    // Reset form data
    setFormData({
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
    console.log(`🔧 Hook updateFormData: ${String(field)} = ${value}`);
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

      console.log("🔄 STARTING BASIC SUBMIT");
      console.log("📋 Current formData:", formData);

      // Prepare update data (force pending status for user dashboard edits)
      const updateData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        location: {
          province: formData.location.province,
          district: "", // Empty district for 2-tier structure compatibility
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
        status: "pending", // Force status to pending - requires admin/employee approval
      };

      // Add project if selected
      if (formData.location.project) {
        (updateData as any).project = formData.location.project;
      }

      console.log("📦 Prepared updateData:");
      console.log("🏠 houseDirection:", updateData.houseDirection);
      console.log("🌅 balconyDirection:", updateData.balconyDirection);
      console.log("🛣️ roadWidth:", updateData.roadWidth);
      console.log("🏠 frontWidth:", updateData.frontWidth);
      console.log("🛏️ bedrooms:", updateData.bedrooms);
      console.log("🚿 bathrooms:", updateData.bathrooms);
      console.log("🏢 floors:", updateData.floors);
      console.log("📄 legalDocs:", updateData.legalDocs);
      console.log("🪑 furniture:", updateData.furniture);
      console.log("📦 Full updateData:", JSON.stringify(updateData, null, 2));

      // Include current images
      const currentImages =
        existingImages.length > 0 ? existingImages : editingPost.images || [];
      console.log("Including current images:", currentImages.length);

      // Sử dụng đúng service dựa vào context và trạng thái post
      const result =
        editingPost.status === "rejected"
          ? await postService.resubmitPost(
              editingPost._id,
              updateData,
              currentImages
            )
          : isAdminContext
          ? await adminPostsService.updateAdminPost(editingPost._id, {
              ...updateData,
              images: currentImages,
            })
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
    } catch {
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
        } catch {
          toast.error("Không thể upload hình ảnh. Vui lòng thử lại.");
          return;
        }
      }

      // Step 2: Always update post with current images AND basic info
      // This is important for cases where user only removed or reordered existing images
      try {
        console.log("📝 Updating post with images AND basic info...");

        // Prepare complete update data including basic info
        const updateData = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category: formData.category,
          location: {
            province: formData.location.province,
            district: "", // Empty district for 2-tier structure compatibility
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
          status: "pending", // Force status to pending - requires admin/employee approval
        };

        // Add project if selected
        if (formData.location.project) {
          (updateData as any).project = formData.location.project;
        }

        console.log("� Complete update data with basic info:");
        console.log("🏠 houseDirection:", updateData.houseDirection);
        console.log("🌅 balconyDirection:", updateData.balconyDirection);
        console.log("🛣️ roadWidth:", updateData.roadWidth);
        console.log("🏠 frontWidth:", updateData.frontWidth);
        console.log("🛏️ bedrooms:", updateData.bedrooms);

        const updateResult = await (isAdminContext
          ? adminPostsService.updateAdminPost(editingPost._id, {
              ...updateData, // Send complete form data
              images: finalImagesList, // Include images in the update data
            })
          : postService.updatePost(editingPost._id, {
              ...updateData, // Send complete form data
              images: finalImagesList, // Include images in the update data
            }));

        console.log("✅ Post images updated successfully:", updateResult);

        // Update local state
        setExistingImages(finalImagesList);

        toast.success("Hình ảnh đã được cập nhật thành công!");
      } catch {
        toast.error("Có lỗi khi cập nhật hình ảnh vào bài đăng.");
        return;
      }

      // Step 3: Decide next step based on post status
      const needsPackageSelection = editingPost.status === "expired";

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
    } catch {
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
          : isAdminContext
          ? await adminPostsService.updateAdminPost(editingPost._id, {
              packageId: selectedPackage._id,
              status: "pending", // Force status to pending - requires admin/employee approval
            })
          : await postService.updatePost(editingPost._id, {
              packageId: selectedPackage._id,
              status: "pending",
            } as any);

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
    } catch {
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
