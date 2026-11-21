import React from 'react';
import HeroSection from '../components/home/HeroSection';
import ServicesPreview from '../components/home/ServicesPreview';
import WhyChooseSection from '../components/home/WhyChooseSection';
import RoadmapSection from '../components/home/RoadmapSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <WhyChooseSection />
      <RoadmapSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}