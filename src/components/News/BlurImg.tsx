"use client";

import { type ImgHTMLAttributes, useState } from "react";

import { blurPlaceholderStyle } from "@/utils/imageBlurSvg";

export function BlurImg({
  blurDataURL,
  style,
  onLoad,
  width,
  height,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & {
  blurDataURL?: string;
}) {
  const [blurComplete, setBlurComplete] = useState(false);
  const placeholder =
    !blurComplete && blurDataURL
      ? blurPlaceholderStyle(blurDataURL, {
          width: typeof width === "number" ? width : undefined,
          height: typeof height === "number" ? height : undefined,
        })
      : undefined;

  return (
    <img
      {...props}
      width={width}
      height={height}
      ref={(node) => {
        if (node?.complete && node.naturalWidth > 0 && blurDataURL) setBlurComplete(true);
      }}
      style={{ ...placeholder, ...style }}
      onLoad={(event) => {
        if (blurDataURL) setBlurComplete(true);
        onLoad?.(event);
      }}
    />
  );
}
