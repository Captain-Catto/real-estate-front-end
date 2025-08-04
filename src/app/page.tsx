"use client";
import SearchSectionMain from "@/components/home/SearchSectionMain";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import FixedNewsSection from "@/components/home/FixedNewsSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen container mx-auto max-w-7xl">
        {/* Hero Section */}
        <section className="relative text-white py-4">
          <SearchSectionMain />
        </section>

        {/* News Section */}
        <FixedNewsSection />

        {/* Featured Properties */}
        <FeaturedProperties />

        {/* Featured Project */}
        <FeaturedProject />

        {/* Stats Section */}
        <StatsSection />
      </main>
      <Footer />
    </>
  );
}
