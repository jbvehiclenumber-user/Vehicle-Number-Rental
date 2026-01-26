// src/pages/HomePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import Header from "../components/Header";
import { COLORS } from "../constants/colors";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuthStore();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId) {
            setVisibleSections((prev) => new Set(prev).add(sectionId));
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(currentRefs).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (userType === "company") {
        navigate("/company/dashboard");
      } else {
        navigate("/driver/dashboard");
      }
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section 
        className="relative text-white py-60 bg-cover bg-no-repeat overflow-hidden hero-background"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL || ''}/truck-background.jpg)`,
          backgroundColor: '#1e3a8a', // fallback 배경색
        }}
      >
        {/* 남색 반투명 오버레이 */}
        <div 
          className="absolute inset-0 animate-fadeIn" 
          style={{ backgroundColor: COLORS.navy.overlay }}
        ></div>
        
        {/* 콘텐츠 */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeInUp">
            영업용 차량 번호 임대 중개 플랫폼
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fadeInUp stagger-1" style={{ animationDelay: '0.2s' }}>
          대한민국 영업용 번호판 거래의 새로운 기준, <strong>넘버링크</strong>
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-3 bg-white rounded-lg font-semibold button-bounce animate-fadeInUp"
            style={{ 
              color: COLORS.navy.primary,
              animationDelay: '0.4s',
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            지금 시작하기
          </button>
        </div>
      </section>

      {/* 차량 번호 중개 소개 섹션 */}
      <section 
        className="text-white py-24"
        style={{ backgroundColor: COLORS.navy.primary }}
        ref={(el) => { sectionRefs.current['intro'] = el; }}
        data-section-id="intro"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 
            className={`text-3xl md:text-4xl font-bold mb-12 section-hidden ${visibleSections.has('intro') ? 'section-visible' : ''}`}
            style={{ color: 'white' }}
          >
            차량 번호 중개
          </h3>

          {/* Section 1 */}
          <div 
            className={`flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-white border-opacity-20 section-hidden ${visibleSections.has('intro') ? 'section-visible' : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            <div className="flex-shrink-0">
              <div 
                className="w-24 h-24 rounded-lg flex items-center justify-center text-3xl font-bold number-badge hover-lift"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                1
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg mb-3 leading-relaxed">
                넘버링크는 영업용 차량 번호를 투명하게 연결하는 중개 플랫폼으로, 소유주와 구매자 간의 신뢰를 바탕으로 합리적인 거래를 돕습니다.
              </p>
              <p className="text-lg leading-relaxed text-gray-200">
                저희 플랫폼은 복잡한 절차를 간소화하고, 실시간 매물 공유와 중개인 매칭을 통해 시간과 비용을 절약해 드립니다.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div 
            className={`flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-white border-opacity-20 section-hidden ${visibleSections.has('intro') ? 'section-visible' : ''}`}
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="flex-shrink-0">
              <div 
                className="w-24 h-24 rounded-lg flex items-center justify-center text-3xl font-bold number-badge hover-lift"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                2
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg mb-3 leading-relaxed">
                간편한 거래 프로세스로 고객 만족을 최우선으로 합니다.
              </p>
              <p className="text-lg leading-relaxed text-gray-200">
                너무 복잡한 비교 없이 간편하게 매물 정보를 확인하고, 바로 중개인 연결을 요청할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div 
            className={`flex flex-col md:flex-row gap-6 section-hidden ${visibleSections.has('intro') ? 'section-visible' : ''}`}
            style={{ transitionDelay: '0.3s' }}
          >
            <div className="flex-shrink-0">
              <div 
                className="w-24 h-24 rounded-lg flex items-center justify-center text-3xl font-bold number-badge hover-lift"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                3
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg mb-3 leading-relaxed">
                투명한 수수료 체계와 실명 인증으로 안전하고 합리적인 거래를 보장합니다.
              </p>
              <p className="text-lg leading-relaxed text-gray-200">
                다양한 차종과 지역에서 매물을 빠르게 매칭하고 상담할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 회사 소개 section*/}
      <section 
        className="text-white py-28"
        style={{ backgroundColor: COLORS.navy.primary }}
        ref={(el) => { sectionRefs.current['company'] = el; }}
        data-section-id="company"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div 
              className={`flex-1 section-hidden ${visibleSections.has('company') ? 'section-visible' : ''}`}
              style={{ transitionDelay: '0.1s' }}
            >
              <p className="text-sm mb-2 opacity-80">정보</p>
              <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'white' }}>
                회사 소개
              </h3>
              {/* <a
                href="https://jungbulogis.co.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white rounded-lg font-semibold button-bounce inline-block"
                style={{ color: COLORS.navy.primary }}
              >
                자세히 보기
              </a> */}
            </div>
            <div 
              className={`flex-1 md:pl-8 flex items-center section-hidden ${visibleSections.has('company') ? 'section-visible' : ''}`}
              style={{ transitionDelay: '0.2s' }}
            >
              <p className="text-lg leading-relaxed text-gray-200">
                에스에이치물류는 디지털 물류 비전기업으로서 영업용 번호 중개 사업의 파트너와 고객 모두의 이익을 최우선에 두고 해당 플랫폼을 개발하였습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section 
        className="bg-white py-16"
        ref={(el) => { sectionRefs.current['features'] = el; }}
        data-section-id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 
            className={`text-3xl md:text-4xl font-bold mb-12 section-hidden ${visibleSections.has('features') ? 'section-visible' : ''}`}
            style={{ color: COLORS.navy.primary }}
          >
            서비스 안내
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white">
            <div 
              className={`hover-lift section-hidden ${visibleSections.has('features') ? 'section-visible' : ''}`}
              style={{ transitionDelay: '0.1s' }}
            >
              <div className="w-full h-64 mb-4 rounded-lg overflow-hidden">
                <img 
                  src={`${process.env.PUBLIC_URL || ''}/images/vehicle-number-brokerage.jpg`}
                  alt="차량 번호 중개 서비스"
                  className="w-full h-full object-cover image-zoom"
                />
              </div>
            </div>
              <p className="text-gray-700 leading-relaxed">
                차량 번호 중개와 실명 인증, 안전한 결제 시스템으로 신뢰 가능한 거래를 제공합니다.
              </p>
            
            </div>
            <div className="bg-white">
              <div 
                className={`hover-lift section-hidden ${visibleSections.has('features') ? 'section-visible' : ''}`}
                style={{ transitionDelay: '0.2s' }}
              >
                <div className="w-full h-64 mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={`${process.env.PUBLIC_URL || ''}/images/taxi-lineup.jpg`}
                    alt="지역별 매물 매칭 서비스"
                    className="w-full h-full object-cover image-zoom"
                  />
                </div>
              </div>
                <p className="text-gray-700 leading-relaxed">
                  지역별 매물 매칭과 맞춤형 상담으로 속도와 만족도를 높입니다.
                </p>
              
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="bg-gray-800 text-white py-8"
        ref={(el) => { sectionRefs.current['footer'] = el; }}
        data-section-id="footer"
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center section-hidden ${visibleSections.has('footer') ? 'section-visible' : ''}`}>
          <p>&copy; 2025 에스에이치물류. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
