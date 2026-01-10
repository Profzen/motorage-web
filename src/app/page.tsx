import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Advantages } from "@/components/sections/Advantages";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <Advantages />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
