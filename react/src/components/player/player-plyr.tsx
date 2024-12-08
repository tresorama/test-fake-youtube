import { useRef, useEffect } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";


type PlayerPlyrProps = {
  playlistUrl?: string;
};

export const PlayerPlyr = ({ playlistUrl }: PlayerPlyrProps) => {
  const isHlsSupported = Hls.isSupported();

  if (!isHlsSupported) {
    return (
      <div className='w-full h-full flex justify-center items-center'>
        <span>HLS not supported</span>
      </div>
    );
  }

  return <Nested playlistUrl={playlistUrl} />;
};

const Nested = ({ playlistUrl }: PlayerPlyrProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (!playlistUrl) return;

    // 0. define base options of plyr
    const plyrOptions: Plyr.Options = {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen'
      ],
      settings: [
        'captions',
        'quality',
        'speed',
        'loop'
      ],
      autoplay: false,
      autopause: true,
      volume: 0.5,
      muted: false,
      clickToPlay: true,
      disableContextMenu: true,
      hideControls: true,
      displayDuration: true,
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4]
      },
    };

    // 1. init hls before
    // NOTE : the plyr player will be initialized when the playlist is loaded
    const hls = new Hls();
    hls.loadSource(playlistUrl);

    // 2. Add listener 
    // wait the the manifest/playlist is downloaded
    // then , update the qauality selector based on the available qualities
    // then, init plyr
    // @see https://github.com/sampotts/plyr/issues/1741#issuecomment-640293554
    hls.on(Hls.Events.MANIFEST_PARSED, () => {

      // Transform available levels into an array of integers (height values).
      const availableQualities = hls.levels.map((l) => l.height);

      // Add new qualities to option
      plyrOptions.quality = {
        default: availableQualities[0],
        options: availableQualities,
        // this ensures Plyr to use Hls to update quality level
        // Ref: https://github.com/sampotts/plyr/blob/master/src/js/html5.js#L77
        forced: true,
        onChange: (newQuality) => {
          hls.levels.forEach((level, levelIndex) => {
            if (level.height === newQuality) {
              console.log("Found quality match with " + newQuality);
              hls.currentLevel = levelIndex;
            }
          });
        }
      };

      // 3. Initialize new Plyr player with quality options
      if (!videoRef.current) return;
      const player = new Plyr(videoRef.current, plyrOptions);
      playerRef.current = player;
    });
    hls.attachMedia(videoRef.current);

  }, [playlistUrl]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full"
    >
    </video>
  );

};