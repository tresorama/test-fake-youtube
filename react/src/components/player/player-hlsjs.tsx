import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import { cn } from "@/utils/cn";
import { useElementFullscreen } from "@/utils/hooks/use-element-fullscreen";

type PlayerHlsJsProps = {
  playlistUrl?: string;
};

export const PlayerHlsJs = ({ playlistUrl }: PlayerHlsJsProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [qualities, setQualities] = useState<{ label: string, height: number; }[]>([]);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number | null>(null);
  const fullscreen = useElementFullscreen(wrapperRef);


  useEffect(() => {
    // if dom is not ready
    if (!videoRef.current) return;
    if (!playlistUrl) return;

    // init player

    if (Hls.isSupported()) {
      hlsRef.current = new Hls();
      const hls = hlsRef.current;
      hls.loadSource(playlistUrl);
      hls.attachMedia(videoRef.current);

      // wait the the manifest/playlist is downloaded
      // then , update the qauality selector based on the available qualities
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Add new qualities to option
        setQualities(hls.levels.map((l) => ({
          label: `${l.height}p`,
          height: l.height
        })));

        // set initial quality
        setSelectedQualityIndex(0);
      });
      return;
    }

    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = playlistUrl;
      return;
    }

    console.log('hls not supported');

  }, [playlistUrl]);

  useEffect(() => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = selectedQualityIndex ?? 0;

    // hlsRef.current?.levels.forEach((level, levelIndex) => {
    //   if (level.height === newQuality) {
    //     console.log("Found quality match with " + newQuality);
    //     if (hlsRef.current) {
    //       hlsRef.current.currentLevel = levelIndex;
    //     }
    //   }
    // });
  }, [selectedQualityIndex]);

  return (
    <div ref={wrapperRef} className="w-full h-full flex flex-col">
      {/* Video */}
      <video ref={videoRef} controls className="w-full" />
      {/* Controls */}
      <div className="flex gap-2">
        {/* Quality Switcher */}
        <div className="flex gap-1">
          {qualities.map((quality, i) => (
            <button
              key={quality.label}
              type="button"
              className={cn([selectedQualityIndex === i ? 'bg-blue-500 text-white' : 'bg-neutral-800'])}
              onClick={() => setSelectedQualityIndex(i)}>
              <span>{quality.label}</span>
            </button>
          ))}
          {/* FUllscrenn */}
        </div>
        <div className="border px-2" onClick={fullscreen.toggleFullscreen}>
          {fullscreen.isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
        </div>
      </div>
    </div>
  );

};