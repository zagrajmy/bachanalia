import { Gallery } from "@/components/Gallery/Gallery";
import { lqipForWpUrl } from "@/utils/lqip";
import type { WpContentSegment } from "@/utils/prepareWpContent";

export function WpContent({
  segments,
  className,
}: {
  className?: string;
  segments: WpContentSegment[];
}) {
  return (
    <div className={className}>
      {segments.map((segment, i) =>
        segment.type === "gallery" ? (
          <Gallery
            key={i}
            images={segment.images.map((image) => ({
              ...image,
              blurDataURL: lqipForWpUrl(image.src),
            }))}
          />
        ) : (
          <div key={i} className="wp-content" dangerouslySetInnerHTML={{ __html: segment.html }} />
        ),
      )}
    </div>
  );
}
