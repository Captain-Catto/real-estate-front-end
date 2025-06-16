import ProjectDetail from "@/components/project-detail/ProjectDetail";

export default function ProjectDetailPage({
  params,
}: {
  params: { slug: string }; // Change từ projectSlug về slug
}) {
  return <ProjectDetail projectSlug={params.slug} />;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }; // Change từ projectSlug về slug
}) {
  const { slug } = params;

  const metadataMap = {
    "masteri-an-phu": {
      title: "Masteri An Phú - Dự án căn hộ cao cấp Quận 2",
      description:
        "Masteri An Phú tại Quận 2, TP.HCM với 1200 căn hộ cao cấp, view sông Sài Gòn đẹp.",
      keywords: "masteri an phu, căn hộ quận 2, masterise homes",
    },
    "vinhomes-central-park": {
      title: "Vinhomes Central Park - Khu đô thị phức hợp",
      description:
        "Vinhomes Central Park với công viên 14ha, đầy đủ tiện ích cao cấp tại trung tâm TP.HCM.",
      keywords: "vinhomes central park, căn hộ bình thạnh, vingroup",
    },
    "anland-premium": {
      title: "Anland Premium - Dự án căn hộ Hà Đông",
      description:
        "Anland Premium tại Hà Đông với 575 căn hộ cao cấp, đầy đủ tiện ích.",
      keywords: "anland premium, căn hộ hà đông, nam cường",
    },
  };

  const metadata = metadataMap[slug as keyof typeof metadataMap];

  if (metadata) {
    return {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        type: "website",
      },
    };
  }

  return {
    title: "Dự án không tìm thấy",
    description: "Dự án bạn tìm kiếm không tồn tại.",
  };
}

export async function generateStaticParams() {
  return [
    { slug: "masteri-an-phu" },
    { slug: "vinhomes-central-park" },
    { slug: "anland-premium" },
  ];
}
