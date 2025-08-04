import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import ContactPage from "@/components/contact/ContactPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ với chúng tôi | Bất động sản",
  description:
    "Liên hệ với đội ngũ chuyên gia bất động sản của chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn trong mọi vấn đề về bất động sản.",
  keywords:
    "liên hệ, tư vấn bất động sản, hỗ trợ khách hàng, real estate contact",
};

export default function LienHePage() {
  return (
    <>
      <Header />
      <ContactPage />
      <Footer />
    </>
  );
}
