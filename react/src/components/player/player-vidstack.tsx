import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { MediaPlayer, MediaProvider } from '@vidstack/react';

// default layout
import { defaultLayoutIcons, DefaultVideoLayout, DefaultAudioLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

// Plyr layout
import { plyrLayoutIcons, PlyrLayout } from "@vidstack/react/player/layouts/plyr";
import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/plyr/theme.css';

type PlayerVidstackProps = {
  playlistUrl?: string;
};

export const PlayerVidstack = ({ playlistUrl }: PlayerVidstackProps) => {
  const [layout, setLayout] = useState<"default" | "plyr">("plyr");

  return (
    <div className="w-full h-full flex flex-col">
      <Button onClick={() => setLayout(layout === "default" ? "plyr" : "default")}>
        {layout === "default" ? "Switch to Plyr" : "Switch to Default"}
      </Button>
      {/* Player */}
      <MediaPlayer
        title="Video Title"
        src={playlistUrl}
        playsInline
      >
        <MediaProvider />
        {layout === "default" ? (
          <>
            <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" />
            <DefaultAudioLayout icons={defaultLayoutIcons} />
          </>
        ) : (
          <PlyrLayout icons={plyrLayoutIcons} thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" />
        )}
      </MediaPlayer>
    </div>
  );

};