"use client";
import React, { useState, useEffect, useRef } from "react";

const stats = [
  {
    number: 100000,
    suffix: "+",
    label: "Tin đăng bất động sản",
    icon: "fas fa-home",
  },
  {
    number: 50000,
    suffix: "+",
    label: "Khách hàng tin tưởng",
    icon: "fas fa-users",
  },
  { number: 1000, suffix: "+", label: "Dự án đã bán", icon: "fas fa-building" },
  { number: 15, suffix: "+", label: "Năm kinh nghiệm", icon: "fas fa-award" },
];

const useCountAnimation = (
  end: number,
  duration: number = 1500,
  shouldStart: boolean = false
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuint(progress);
      const currentCount = Math.round(easedProgress * end);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, shouldStart]);

  return count;
};

const useIntersectionObserver = (threshold: number = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold, rootMargin: "0px" }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isIntersecting] as const;
};

const formatNumber = (num: number): string => num.toLocaleString("vi-VN");

interface StatItemProps {
  stat: { number: number; suffix: string; label: string; icon: string };
  index: number;
  isVisible: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ stat, index, isVisible }) => {
  const count = useCountAnimation(stat.number, 1500 + index * 100, isVisible);

  return (
    <div
      className={`transform transition-all duration-700 p-4 rounded-lg ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } hover:bg-blue-700/50 hover:shadow-lg hover:scale-105`}
    >
      <div className="text-4xl md:text-5xl mb-3 text-white/90">
        <i className={stat.icon}></i>
      </div>
      <div
        className={`text-2xl md:text-3xl font-bold mb-2 ${
          isVisible ? "" : "blur-sm"
        }`}
      >
        {formatNumber(count)}
        {stat.suffix}
      </div>
      <div className="text-sm md:text-base opacity-90">{stat.label}</div>
    </div>
  );
};

export function StatsSection() {
  const [sectionRef, isVisible] = useIntersectionObserver(0.1);

  return (
    <section
      ref={sectionRef}
      className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white"
      style={{ minHeight: "300px" }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 ">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 select-none">
            Thống kê ấn tượng
          </h2>
          <p className="text-lg opacity-90 select-none">
            Những con số chứng minh uy tín của chúng tôi
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              stat={stat}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
