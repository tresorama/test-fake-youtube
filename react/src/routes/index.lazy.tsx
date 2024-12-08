import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';

import { API_SERVER_URL } from '@/constants';
import { PlayerVideoJs } from '@/components/player/player-video-js';
import { PlayerHlsJs } from '@/components/player/player-hlsjs';
import { PlayerShakaJs } from '@/components/player/player-shaka';
// import { PlayerPlyrReact } from '@/components/player/player-plyr-react';
import { PlayerPlyr } from '@/components/player/player-plyr';
import { PlayerReactPlayer } from '@/components/player/player-react-player';
import { PlayerVidstack } from '@/components/player/player-vidstack';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="p-2 space-y-12">
      <h1>Welcome Home!</h1>
      <VideosFeed />
    </div>
  );
}

// queries

const queries = {
  getVideos: async () => {
    const res = await fetch(`${API_SERVER_URL}/videos`);
    const resSchema = z.array(z.object({
      id: z.string(),
      status: z.enum(['preprocessing', 'ready']),
      title: z.string(),
      description: z.string(),
      author: z.string(),
      path_upload: z.string().nullable(),
      path_processed: z.array(z.string()).nullable(),
      path_cdn_urls: z.array(z.string()).nullable(),
    }));
    return resSchema.parse(await res.json());
  }
};
const useVideos = () => {
  return useQuery({
    queryKey: ['videos'],
    queryFn: queries.getVideos,
  });
};

// components

const VideosFeed = () => {
  const videos = useVideos();

  return (
    <div className='border space-y-2'>
      {videos.isLoading ? <p>Loading...</p>
        : (videos.isError || !videos.data) ? <p>Error</p>
          : videos.data.length === 0 ? <p>No videos</p>
            : videos.data.map(video => <VideoFeedItem key={video.id} video={video} />)
      }
    </div>
  );

};

const VideoFeedItem = ({
  video
}: {
  video: Awaited<ReturnType<typeof queries.getVideos>>[number];
}) => {

  // const manualPlaylistSegmentUrls = (() => {
  //   if (video.status !== 'ready') return;
  //   if (!video.path_cdn_urls) return;
  //   return video.path_cdn_urls;
  // })();

  const hlsPlaylistUrl = (() => {
    if (video.status !== 'ready') return;
    if (!video.path_cdn_urls) return;
    const playlistUrl = video.path_cdn_urls.find(url => url.endsWith('master.m3u8'));
    if (!playlistUrl) return;
    return playlistUrl;
  })();

  return (
    <div className='grid grid-cols-[40%_minmax(0,1fr)]'>
      {/* LEFT */}
      <div className='w-full flex flex-col gap-2'>

        {/* vidstack */}
        <div className='VIDSTACK relative w-full aspect-video flex justify-center items-center border-2'>
          <div className='absolute w-[80%] h-[80%]'>
            <PlayerVidstack playlistUrl={hlsPlaylistUrl} />
          </div>
          <div className='absolute top-0 right-0 bg-white/10 text-xs'>vidstack</div>
        </div>
        {/* react-player */}
        <div className='REACT-PLAYER relative w-full aspect-video flex justify-center items-center border-2'>
          <div className='absolute w-[80%] h-[80%]'>
            <PlayerReactPlayer playlistUrl={hlsPlaylistUrl} />
          </div>
          <div className='absolute top-0 right-0 bg-white/10 text-xs'>react-player</div>
        </div>
        {/* plyr */}
        <div className='PLYR relative w-full aspect-video flex justify-center items-center border-2'>
          <div className='absolute w-[80%] h-[80%]'>
            <PlayerPlyr playlistUrl={hlsPlaylistUrl} />
          </div>
          <div className='absolute top-0 right-0 bg-white/10 text-xs'>plyr</div>
        </div>
        {/* hls.js */}
        <div className='HLSJS relative w-full aspect-video flex justify-center items-center border-2'>
          <div className='absolute w-[80%] h-[80%]'>
            <PlayerHlsJs playlistUrl={hlsPlaylistUrl} />
          </div>
          <div className='absolute top-0 right-0 bg-white/10 text-xs'>hls.js</div>
        </div>
        {/* plyr-react */}
        {/* <div className='PLYR-REACT relative w-full aspect-video flex justify-center items-center border-2'>
            <div className='absolute w-[80%] h-[80%]'>
              <PlayerPlyrReact playlistUrl={hlsPlaylistUrl} />
            </div>
            <div className='absolute top-0 right-0 bg-white/10 text-xs'>plyr-react</div>
          </div> */}
        {/* shaka.js */}
        <div className='SHAKA relative w-full aspect-video flex justify-center items-center border-2'>
          <div className='absolute w-[80%] h-[80%]'>
            <PlayerShakaJs playlistUrl={hlsPlaylistUrl} />
          </div>
          <div className='absolute top-0 right-0 bg-white/10 text-xs'>shaka-player</div>
        </div>
        {/* video.js */}
        <div className='VIDEOJS relative w-full aspect-video flex justify-center items-center border-2'>
          <div className='absolute w-[80%] h-[80%]'>
            <PlayerVideoJs playlistUrl={hlsPlaylistUrl} />
          </div>
          <div className='absolute top-0 right-0 bg-white/10 text-xs'>video.js</div>
        </div>

      </div>

      {/* RIGHT */}
      <div className='p-4 text-xs text-neutral-400'>
        <h2>{video.title}</h2>
        <p>{video.description}</p>
        <p>{video.author}</p>
        <p>{video.status}</p>
        <hr className='my-2' />
        <p>Path upload</p>
        <p>{video.path_upload}</p>
        <hr className='my-2' />
        <p>Path processed</p>
        {video.path_processed?.map((path, i) => (
          <p key={i}>{path}</p>
        ))}
        <hr className='my-2' />
        <p>Path CDN</p>
        {video.path_cdn_urls?.map((path, i) => (
          <p key={i}>{path}</p>
        ))}
      </div>
    </div>
  );
}


