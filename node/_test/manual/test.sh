#  bash script with ffmpeg that cut a video, keeping only the first 20 seconds, without transcodibg

ffmpeg -i elephants-dream.mp4 -ss 00:00:00 -t 00:00:20 -c copy elephants-dream-trimmed.mp4


# create multiple hls resolution playlist and a master playlist
ffmpeg -hide_banner -re -i elephants-dream-trimmed.mp4 \
  -map 0:v:0 -map 0:a:0 \
  -map 0:v:0 -map 0:a:0 \
  -map 0:v:0 -map 0:a:0 \
  -map 0:v:0 -map 0:a:0 \
  -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -c:a aac -ar 48000 \
  -filter:v:0 scale=w=640:h=360:force_original_aspect_ratio=decrease -maxrate:v:0 856k -bufsize:v:0 1200k -b:a:0 96k \
  -filter:v:1 scale=w=960:h=540:force_original_aspect_ratio=decrease -maxrate:v:1 1498k -bufsize:v:1 2100k -b:a:1 128k \
  -filter:v:2 scale=w=1280:h=720:force_original_aspect_ratio=decrease -maxrate:v:2 2996k -bufsize:v:2 4200k -b:a:2 128k \
  -filter:v:3 scale=w=1920:h=1080:force_original_aspect_ratio=decrease -maxrate:v:3 5350k -bufsize:v:3 7500k -b:a:3 192k \
  -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:540p v:3,a:3,name:360p" \
  -f hls \
  -hls_time 10 \
  -hls_playlist_type vod \
  -hls_list_size 0 \
  -master_pl_name master.m3u8 \
  -hls_segment_filename "output/v%v_segment%d.ts" \
  output/v%v/index.m3u8



# create multiple hls resolution playlist and a master playlist
# v2
ffmpeg -f flv -i "rtmp://server/live/livestream" \
  -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 -map 0:v:0 -map 0:a:0 \
  -c:v libx264 -crf 22 -c:a aac -ar 44100 \
  -filter:v:0 scale=w=480:h=360  -maxrate:v:0 600k -b:a:0 500k \
  -filter:v:1 scale=w=640:h=480  -maxrate:v:1 1500k -b:a:1 1000k \
  -filter:v:2 scale=w=1280:h=720 -maxrate:v:2 3000k -b:a:2 2000k \
  -var_stream_map "v:0,a:0,name:360p v:1,a:1,name:480p v:2,a:2,name:720p" \
  -preset fast -hls_list_size 10 -threads 0 -f hls \
  -hls_time 3 -hls_flags independent_segments \
  -master_pl_name "livestream.m3u8" \
  -y "livestream-%v.m3u8"


# create multiple hls resolution playlist and a master playlist
# v3
rm -rf ./output && \
mkdir -p ./output && \
ffmpeg -hide_banner -re -i elephants-dream-trimmed.mp4 \
  -map 0:v:0 -map 0:a:0 \
  -map 0:v:0 -map 0:a:0 \
  -map 0:v:0 -map 0:a:0 \
  -map 0:v:0 -map 0:a:0 \
  -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -c:a aac -ar 48000 \
  -filter:v:0 scale=w=640:h=360:force_original_aspect_ratio=decrease -maxrate:v:0 856k -bufsize:v:0 1200k -b:a:0 96k \
  -filter:v:1 scale=w=960:h=540:force_original_aspect_ratio=decrease -maxrate:v:1 1498k -bufsize:v:1 2100k -b:a:1 128k \
  -filter:v:2 scale=w=1280:h=720:force_original_aspect_ratio=decrease -maxrate:v:2 2996k -bufsize:v:2 4200k -b:a:2 128k \
  -filter:v:3 scale=w=1920:h=1080:force_original_aspect_ratio=decrease -maxrate:v:3 5350k -bufsize:v:3 7500k -b:a:3 192k \
  -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:540p v:3,a:3,name:360p" \
  -f hls \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_list_size 0 \
  -master_pl_name master.m3u8 \
  -hls_segment_filename "output/v%v_segment%d.ts" \
  output/v%v.m3u8