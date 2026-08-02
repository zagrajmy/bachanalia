/** Stolen from next/dist/shared/lib/image-blur-svg.js — SVG Gaussian blur over a tiny LQIP. */
export function getImageBlurSvg({
  widthInt,
  heightInt,
  blurWidth,
  blurHeight,
  blurDataURL,
  objectFit,
}: {
  widthInt?: number;
  heightInt?: number;
  blurWidth?: number;
  blurHeight?: number;
  blurDataURL: string;
  objectFit?: string;
}) {
  const std = 20;
  const svgWidth = blurWidth ? blurWidth * 40 : widthInt;
  const svgHeight = blurHeight ? blurHeight * 40 : heightInt;
  const viewBox = svgWidth && svgHeight ? `viewBox='0 0 ${svgWidth} ${svgHeight}'` : "";
  const preserveAspectRatio = viewBox
    ? "none"
    : objectFit === "contain"
      ? "xMidYMid"
      : objectFit === "cover"
        ? "xMidYMid slice"
        : "none";

  return `%3Csvg xmlns='http://www.w3.org/2000/svg' ${viewBox}%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='${std}'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='${std}'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='${preserveAspectRatio}' style='filter: url(%23b);' href='${blurDataURL}'/%3E%3C/svg%3E`;
}

export function blurPlaceholderStyle(
  blurDataURL: string,
  {
    width,
    height,
    objectFit = "cover",
  }: {
    width?: number;
    height?: number;
    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  } = {},
) {
  const backgroundSize =
    objectFit === "fill" ? "100% 100%" : objectFit === "none" || objectFit === "scale-down" ? undefined : objectFit;

  return {
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,${getImageBlurSvg({
      widthInt: width,
      heightInt: height,
      blurDataURL,
      objectFit,
    })}")`,
    backgroundPosition: "50% 50%",
    backgroundRepeat: "no-repeat" as const,
    ...(backgroundSize ? { backgroundSize } : {}),
    color: "transparent",
  };
}
