import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
// import Topbar from "@/components/headers/Topbar";
import BannerCountdown from "@/components/homes/BannerCountdown";
import Blogs from "@/components/homes/Blogs";
import Collections from "@/components/homes/Categories";
import Features from "@/components/common/Features";
import Hero from "@/components/homes/Hero";
import Products from "@/components/common/Products3";
import ShopGram from "@/components/common/ShopGram";
import Testimonials3 from "@/components/common/Testimonials3";
import MarqueeSection from "@/components/common/MarqueeSection";

export const metadata = {
  title: "Traditional Alley",
  description: "Desire for elegance",
};

export default function Home() {
  return (
    <>
      {/* <Topbar /> */}
      <Header1 />
      <Hero />
      <Collections />
      <Products />
      <MarqueeSection />
      {/* <BannerCollection /> */}
      <BannerCountdown />
      <Testimonials3 />
      <ShopGram />
      <Features />
      <Blogs />
      <Footer1 hasPaddingBottom />
    </>
  );
}
