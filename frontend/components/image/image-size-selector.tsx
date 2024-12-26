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
import { XIcon } from "lucide-react";

type ImageSizeType =
  | "square_hd"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9"
  | "custom";

const SIZE_PRESETS: Record<
  Exclude<ImageSizeType, "custom">,
  { width: string; height: string }
> = {
  square_hd: { width: "1024", height: "1024" },
  portrait_4_3: { width: "768", height: "1024" },
  portrait_16_9: { width: "576", height: "1024" },
  landscape_4_3: { width: "1024", height: "768" },
  landscape_16_9: { width: "1024", height: "576" },
};

interface ImageSizeSelectorProps {
  onSizeChange?: (size: {
    selectedSize: ImageSizeType;
    width: string;
    height: string;
  }) => void;
}

export default function ImageSizeSelector({
  onSizeChange,
}: ImageSizeSelectorProps) {
  const [selectedSize, setSelectedSize] =
    useState<ImageSizeType>("landscape_16_9");
  const [width, setWidth] = useState("1024");
  const [height, setHeight] = useState("576");

  useEffect(() => {
    if (onSizeChange) {
      onSizeChange({
        selectedSize,
        width,
        height,
      });
    }
  }, [selectedSize, width, height]);

  const handleSizeChange = (value: ImageSizeType) => {
    setSelectedSize(value);

    if (value !== "custom") {
      const { width: newWidth, height: newHeight } = SIZE_PRESETS[value];
      setWidth(newWidth);
      setHeight(newHeight);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select value={selectedSize} onValueChange={handleSizeChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="square_hd">Square HD 1:1</SelectItem>
            <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
            <SelectItem value="portrait_16_9">Portrait 16:9</SelectItem>
            <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
            <SelectItem value="landscape_16_9">Landscape 16:9</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedSize === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-24"
            placeholder="Width"
          />
          <XIcon className="h-4 w-4 text-gray-500" />
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-24"
            placeholder="Height"
          />
        </div>
      )}
    </div>
  );
}
