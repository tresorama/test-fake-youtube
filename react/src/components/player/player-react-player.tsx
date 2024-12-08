import ReactPlayer from 'react-player';

type PlayerReactPlayerProps = {
  playlistUrl?: string;
};

export const PlayerReactPlayer = ({ playlistUrl }: PlayerReactPlayerProps) => {

  return (
    <ReactPlayer
      url={playlistUrl}
      controls={true}
      config={{
        file: {
          forceVideo: true,
          forceHLS: true,
        }
      }}
      width={'100%'}
      height={'100%'}
    />
  );

};