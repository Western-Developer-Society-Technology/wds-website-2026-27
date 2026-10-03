"use client";

import Image from "next/image";
import { useState } from "react";
import { EVENT_IMAGE_PLACEHOLDER } from "@/lib/events/config";

export default function EventImage({ src, alt = "", ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const imageSrc = src && src !== failedSrc ? src : EVENT_IMAGE_PLACEHOLDER;

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      unoptimized={imageSrc.startsWith("https://") || imageSrc === EVENT_IMAGE_PLACEHOLDER}
      onError={imageSrc === EVENT_IMAGE_PLACEHOLDER ? undefined : () => setFailedSrc(src)}
    />
  );
}
