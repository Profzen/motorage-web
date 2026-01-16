import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Advantages } from "@/components/sections/Advantages";
import { StatsSection } from "@/components/sections/StatsSection";
import { RolesSection } from "@/components/sections/RolesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsSection />
      <HowItWorks />
      <RolesSection />
      <Advantages />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
