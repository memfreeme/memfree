"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type ImageUseCaseType =
  | "social_media_post"
  | "product_presentation"
  | "marketing_banner"
  | "blog_illustration"
  | "presentation_slide"
  | "profile_picture"
  | "event_poster"
  | "website_hero"
  | "custom";

const USE_CASE_DESCRIPTIONS: Record<
  Exclude<ImageUseCaseType, "custom">,
  string
> = {
  social_media_post: "Social Media Post",
  product_presentation: "Product Presentation",
  marketing_banner: "Marketing Banner",
  blog_illustration: "Blog Illustration",
  presentation_slide: "Presentation Slide",
  profile_picture: "Profile Picture",
  event_poster: "Event Poster",
  website_hero: "Website Hero",
};

interface ImageUseCaseSelectorProps {
  onUseCaseChange?: (useCase: {
    selectedUseCase: ImageUseCaseType;
    customUseCase?: string;
  }) => void;
}

export default function ImageUseCaseSelector({
  onUseCaseChange,
}: ImageUseCaseSelectorProps) {
  const [selectedUseCase, setSelectedUseCase] =
    useState<ImageUseCaseType>("social_media_post");
  const [customUseCase, setCustomUseCase] = useState("");

  useEffect(() => {
    if (onUseCaseChange) {
      onUseCaseChange({
        selectedUseCase,
        customUseCase: selectedUseCase === "custom" ? customUseCase : undefined,
      });
    }
  }, [selectedUseCase, customUseCase]);

  const handleUseCaseChange = (value: ImageUseCaseType) => {
    setSelectedUseCase(value);
    if (value !== "custom") {
      setCustomUseCase("");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select value={selectedUseCase} onValueChange={handleUseCaseChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select Image Use Case" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(USE_CASE_DESCRIPTIONS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Use Case</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedUseCase === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={customUseCase}
            onChange={(e) => setCustomUseCase(e.target.value)}
            className="w-64"
            placeholder="Enter Custom Use Case"
          />
        </div>
      )}
    </div>
  );
}
