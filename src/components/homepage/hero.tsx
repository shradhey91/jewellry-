import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroProps {
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  videoUrl: string;
  fallbackImageUrl: string;
  videoEnabled?: boolean;
  videoStartTime?: number;
  videoEndTime?: number;
}

const getYouTubeEmbedUrl = (
  url: string,
  start?: number,
  end?: number
) => {
  if (!url) return null;

  let videoId: string | null = null;

  try {
    const urlObj = new URL(url);

    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v");
    }
  } catch {
    return null;
  }

  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    rel: "0",
    playsinline: "1",
    modestbranding: "1",
  });

  if (start && start > 0) params.append("start", String(start));
  if (end && end > 0) params.append("end", String(end));

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export function Hero({
  title,
  titleHighlight,
  subtitle,
  ctaText,
  ctaLink,
  videoUrl,
  fallbackImageUrl,
  videoEnabled = true,
  videoStartTime = 0,
  videoEndTime = 0,
}: HeroProps) {
  const embedUrl = getYouTubeEmbedUrl(
    videoUrl,
    videoStartTime,
    videoEndTime
  );

  const isYoutube = Boolean(embedUrl);

  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-black"
      style={{
        backgroundImage:
          !videoEnabled || !videoUrl
            ? `url(${fallbackImageUrl})`
            : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ===== BACKGROUND VIDEO ===== */}
      {videoEnabled && videoUrl && (
        <div className="absolute inset-0 overflow-hidden">
          {isYoutube ? (
            /* YouTube background – desktop-proof */
            <div className="absolute top-1/2 left-1/2 w-[177.78vh] h-[100vh] -translate-x-1/2 -translate-y-1/2 scale-[1.35]">
              <iframe
                src={embedUrl!}
                className="w-full h-full pointer-events-none"
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Background Video"
              />
            </div>
          ) : (
            /* Self-hosted video */
            <video
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              autoPlay
              loop
              muted
              playsInline
              src={videoUrl}
            />
          )}
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
        <h2 className="font-headline uppercase text-2xl md:text-3xl lg:text-4xl">
          {title}
        </h2>

        <h1 className="font-headline uppercase font-bold text-6xl md:text-8xl lg:text-9xl xl:text-[150px] leading-none">
          {titleHighlight}
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg tracking-wider">
          {subtitle}
        </p>

        <Button asChild size="lg" className="mt-8 hero-cta">
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      </div>
    </section>
  );
}
