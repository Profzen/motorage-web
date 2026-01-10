import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Advantages } from "@/components/sections/Advantages";
import { StatsSection } from "@/components/sections/StatsSection";
import { RolesSection } from "@/components/sections/RolesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <StatsSection />
        <HowItWorks />
        <RolesSection />
        <Advantages />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
