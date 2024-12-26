"use client";

import { AIImageGenerator } from "@/components/image/image-generator";

export default function PageWrapper() {
  const handleImageGenerated = (imageUrl: string) => {
    console.log("Generated image URL:", imageUrl);
  };
  return (
    <div className="container mx-auto px-4 py-12">
      <AIImageGenerator onImageGenerated={handleImageGenerated} />
    </div>
  );
}
