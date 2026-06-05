import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HeroSection from "../components/home/HeroSection";
import CategoryGrid from "../components/home/CategoryGrid";
import FeaturedProfessionals from "../components/home/FeaturedProfessionals";
import HowItWorks from "../components/home/HowItWorks";
import TestimonialBanner from "../components/home/TestimonialBanner";

// TrustedBy (yellow band) intentionally removed

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff", minWidth: 1280 }}>
      <Navbar />
      <HeroSection />
      <CategoryGrid />
      <FeaturedProfessionals />
      <HowItWorks />
      <TestimonialBanner />
      <Footer />
    </div>
  );
}