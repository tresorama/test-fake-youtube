import { useRef, useEffect } from "react";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type PlayerVideoJsProps = {
  playlistUrl?: string;
};

export const PlayerVideoJs = ({ playlistUrl }: PlayerVideoJsProps) => {
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    // if dom is not ready
    if (!videoWrapperRef.current) return;
    if (!playlistUrl) return;

    // 1. define options
    const videoJsOptions = {
      sources: [{
        src: playlistUrl,
        type: 'application/x-mpegURL'
      }],
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      // playbackRates: [0.5, 1, 1.5, 2],
      // height: 400,
      // responsive: true,
      // poster: thumbnail,
      controlBar: {
        playToggle: true,
        volumePanel: {
          inline: false
        },
        skipButtons: {
          forward: 10,
          backward: 10
        },
        fullscreenToggle: true
      },
    };

    // 2. if already initialized
    if (playerRef.current) {
      const player = playerRef.current;
      player.autoplay(videoJsOptions.autoplay);
      player.src(videoJsOptions.sources);
      return;
    }

    // 3. if not already initialized

    // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
    const videoElement = document.createElement("video-js");
    videoElement.classList.add('vjs-big-play-centered');

    // append to Dom
    videoWrapperRef.current.appendChild(videoElement);

    // init player
    const player = videojs(videoWrapperRef.current, videoJsOptions);
    playerRef.current = player;

  }, [playlistUrl]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (!player) return;
      if (player.isDisposed()) return;
      player.dispose();
      playerRef.current = null;
    };
  }, []);

  return (
    <div data-vjs-player style={{ width: '100%', height: '100%' }}>
      <div ref={videoWrapperRef} />
    </div>
  );

  // return <video ref={videoRef} className="video-js vjs-default-skin" />;

};