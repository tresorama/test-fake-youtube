import { useRef, useEffect } from "react";
import shaka from 'shaka-player';

console.log({ shaka });
type PlayerShakaJsProps = {
  playlistUrl?: string;
};

export const PlayerShakaJs = ({ playlistUrl }: PlayerShakaJsProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // if dom is not ready
    if (!videoRef.current) return;
    if (!playlistUrl) return;

    // init player
    const player = new shaka.Player(videoRef.current);
    player
      .load(playlistUrl)
      .then(() => {
        console.log('shaka player is loaded');
      })
      .catch((error: unknown) => {
        console.error('shaka player error code');
        console.error(error);
      });

  }, [playlistUrl]);

  return <video ref={videoRef} controls />;

};