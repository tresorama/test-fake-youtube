import { useRef, useEffect } from "react";
// import "plyr-react/dist/plyr.css";
// import "plyr-react/plyr.css";
import Hls from "hls.js";
import Plyr, { type APITypes, type PlyrProps } from "plyr-react";

type PlayerPlyrReactProps = {
  playlistUrl?: string;
};

export const PlayerPlyrReact = ({ playlistUrl }: PlayerPlyrReactProps) => {
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

const Nested = ({ playlistUrl }: PlayerPlyrReactProps) => {
  const playerRef = useRef<APITypes | null>(null);

  useEffect(() => {
    if (!playerRef.current) return;
    if (!playlistUrl) return;

    // init player
    const video = document.getElementById("plyr") as HTMLVideoElement | null;
    if (!video) {
      throw new Error("plyr Video element not found");
    }

    const hls = new Hls();
    hls.loadSource(playlistUrl);
    hls.attachMedia(video);
    playerRef.current.plyr.media = video;

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      playerRef.current?.plyr.play();
    });


  }, [playlistUrl]);



  return (
    <Plyr
      ref={playerRef}
      id="plyr"
      options={{ volume: 0.1 }}
      source={{} as PlyrProps["source"]}
    />
  );

};