import { useEffect, useRef, useState } from "react";

export const PlayerManual = ({ segmentUrls }: { segmentUrls?: string[]; }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(true); // Stato per il caricamento

  useEffect(() => {
    if (!videoRef.current || !segmentUrls) {
      return;
    }

    const videoEl = videoRef.current;
    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);
    videoEl.src = objectUrl;

    mediaSource.addEventListener('sourceopen', () => {
      const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');

      let currentSegment = 0;

      const fetchAndAppendSegment = () => {
        if (currentSegment >= segmentUrls.length) {
          mediaSource.endOfStream();
          setLoading(false);  // Segnala che il caricamento è terminato
          return;
        }

        fetch(segmentUrls[currentSegment])
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch segment: ${segmentUrls[currentSegment]}`);
            }
            return response.arrayBuffer();
          })
          .then((data) => {
            if (sourceBuffer.updating) {
              // Se il buffer è già in uso, aspetta che finisca l'operazione precedente
              setTimeout(fetchAndAppendSegment, 50);
              return;
            }

            sourceBuffer.appendBuffer(data);
            currentSegment += 1;
          })
          .catch((error) => {
            console.error('Error loading segment:', error);
            setLoading(false);
          });
      };

      sourceBuffer.addEventListener('updateend', fetchAndAppendSegment);
      fetchAndAppendSegment(); // Carica il primo segmento

      // Cleanup quando il componente viene smontato
      return () => {
        if (videoRef.current) {
          const videoEl = videoRef.current;
          if (videoEl.src) {
            URL.revokeObjectURL(videoEl.src);  // Revoca l'URL creato
          }
        }
      };
    });
  }, [segmentUrls]);

  return (
    <div className='w-full h-full border-2 border-red-400 relative flex justify-center items-center'>
      {loading && <p className="absolute">Loading...</p>}
      <video
        ref={videoRef}
        controls
        className='w-full h-full'
      >
      </video>
    </div>
  );

};