import { Gallery } from "@/components/Gallery/Gallery";
import type { WpContentSegment } from "@/utils/prepareWpContent";

/**
 * WordPress bodies stay one `dangerouslySetInnerHTML` blob, except where
 * `splitWpContent` has lifted a gallery out of them — those render as real
 * components so the photos go through `next/image` and open in a lightbox.
 */
export function WpContent({
  segments,
  className,
}: {
  segments: WpContentSegment[];
  className?: string;
}) {
  return (
    <div className={className}>
      {segments.map((segment, i) =>
        segment.type === "gallery" ? (
          <Gallery key={i} images={segment.images} />
        ) : (
          <div key={i} className="wp-content" dangerouslySetInnerHTML={{ __html: segment.html }} />
        ),
      )}
    </div>
  );
}
