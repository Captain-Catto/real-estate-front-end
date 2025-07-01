"use client";
import SearchSectionMain from "@/components/home/SearchSectionMain";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { NewsSection } from "@/components/home/NewsSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen container mx-auto">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative container mx-auto px-4 py-20">
            <SearchSectionMain />
          </div>
        </section>

        {/* News Section */}
        <NewsSection />

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
