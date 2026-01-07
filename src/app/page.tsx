import { getSections, getPublicGalleryImages, getPublicReels, getMedia } from "@/app/actions/cms";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { BookingBar } from "@/components/sections/BookingBar";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { ReelsSection } from "@/components/sections/ReelsSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { CTASection } from "@/components/sections/CTASection";
import { ContactSection } from "@/components/sections/ContactSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { Footer } from "@/components/sections/Footer";

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  about: AboutSection,
  services: ServicesSection,
  packages: PackagesSection,
  reels: ReelsSection,
  gallery: GallerySection,
  testimonials: TestimonialsSection,
  events: EventsSection,
  partners: PartnersSection,
  cta: CTASection,
  contact: ContactSection,
  newsletter: NewsletterSection,
};

export const revalidate = 0; // Ensure dynamic data is always fresh

export default async function HomePage() {
  const sections = await getSections();
  const galleryImagesRaw = await getPublicGalleryImages();
  const reelsData = await getPublicReels();
  const aboutMedia = await getMedia("about");

  // Filter out images with empty URLs
  const galleryImages = galleryImagesRaw.filter((img: any) => img.src && img.src.trim() !== "");

  // Map reels to frontend format
  const publicReels = reelsData.map((reel: any) => ({
    id: reel.id,
    // Use custom thumbnail if set, otherwise try Instagram's media endpoint
    src: reel.thumbnail_url || `https://www.instagram.com/p/${reel.embed_id}/media/?size=l`,
    label: reel.label || "",
    views: reel.views || "10K",
    embedId: reel.embed_id
  }));

  // Helper to render sections efficiently
  const renderDynamicSections = () => {
    // If no sections found (DB error or empty), fallback to default order?
    // Or maybe just show everything? 
    // Better to handle empty state gracefully.
    if (!sections || sections.length === 0) {
      console.warn("No sections found in CMS, using default layout fallback.");
      // Fallback layout if DB is empty to avoid blank page
      return (
        <>
          <AboutSection images={aboutMedia} />
          <ServicesSection />
          <PackagesSection />
          <ReelsSection reels={publicReels} />
          <GallerySection images={galleryImages} />
          <TestimonialsSection />
          <EventsSection />
          <PartnersSection />
          <CTASection />
          <ContactSection />
          <NewsletterSection />
        </>
      );
    }

    return sections
      .filter((section) => section.is_active)
      .map((section) => {
        const Component = SECTION_COMPONENTS[section.name.toLowerCase()];
        if (!Component) {
          console.warn(`Component not found for section: ${section.name}`);
          return null;
        }

        if (section.name === "gallery") {
          return <Component key={section.id} images={galleryImages} />;
        }

        if (section.name === "reels") {
          return <Component key={section.id} reels={publicReels} />;
        }

        if (section.name === "about") {
          return <Component key={section.id} images={aboutMedia} />;
        }

        return <Component key={section.id} />;
      });
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <BookingBar />

      {renderDynamicSections()}

      <Footer />
    </main>
  );
}
