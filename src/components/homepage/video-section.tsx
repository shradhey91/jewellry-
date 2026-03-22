
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VideoSectionProps {
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

const getYouTubeEmbedUrl = (url: string, start?: number, end?: number) => {
    if (!url) return null;
    let videoId;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === "youtu.be") {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes("youtube.com")) {
            videoId = urlObj.searchParams.get("v");
        }
    } catch (e) {
        return null;
    }
    
    if (!videoId) return null;

    const params = new URLSearchParams({
        autoplay: '1',
        mute: '1',
        loop: '1',
        playlist: videoId,
        controls: '0',
        rel: '0',
        iv_load_policy: '3',
        playsinline: '1',
        title: '0'
    });

    if (start && start > 0) params.append('start', String(start));
    if (end && end > 0) params.append('end', String(end));
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function VideoSection({
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
}: VideoSectionProps) {

  const embedUrl = getYouTubeEmbedUrl(videoUrl, videoStartTime, videoEndTime);
  const isYoutube = !!embedUrl;
  const videoTimeSuffix = videoUrl && !isYoutube && (videoStartTime || videoEndTime)
    ? `#t=${videoStartTime || 0}${videoEndTime ? `,${videoEndTime}` : ''}`
    : '';


  const sectionStyle = {
    height: `70vh`,
    backgroundImage: !videoEnabled || !videoUrl ? `url(${fallbackImageUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } as React.CSSProperties;
  
  const videoContainerClass = "absolute inset-0 w-full h-full overflow-hidden";
  const videoClass = "absolute inset-0 w-full h-full object-cover pointer-events-none";

  return (
    <section className="relative w-full overflow-hidden bg-black" style={sectionStyle}>
      {videoEnabled && videoUrl && (
        <div className={videoContainerClass}>
          {isYoutube ? (
              <iframe
                  src={embedUrl!}
                  className={videoClass}
                  frameBorder="0"
                  allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Embedded YouTube Background Video"
              ></iframe>
          ) : (
              <video
                className={videoClass}
                autoPlay
                loop
                muted
                playsInline
                key={videoUrl + videoTimeSuffix}
                src={videoUrl + videoTimeSuffix}
              >
                Your browser does not support the video tag.
              </video>
          )}
        </div>
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-8">
        <h2 className="font-headline uppercase text-2xl md:text-3xl lg:text-4xl">
            {title}
        </h2>
        <h1 className="font-headline uppercase font-bold text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[130px] leading-none break-words max-w-full">
          {titleHighlight}
        </h1>
        <p className="mt-4 tracking-wider text-base md:text-lg">
            {subtitle}
        </p>
        <Button asChild size="lg" className="mt-8 hero-cta">
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      </div>
    </section>
  );
}
