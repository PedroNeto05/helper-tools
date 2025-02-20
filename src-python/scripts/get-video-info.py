import yt_dlp


def get_video_info(url):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats_dict = {}

            for f in info['formats']:
                format_id = f.get('format_id', 'N/A')
                formats_dict[format_id] = {
                    'ext': f.get('ext', 'N/A'),
                    'resolution': f.get('resolution', 'N/A'),
                    'fps': f.get('fps', 'N/A'),
                }

            return {
                'title': info.get('title'),
                'thumbnail': info.get('thumbnail', 'N/A'),
                'duration': info.get('duration', 'N/A'),
                'formats': formats_dict
            }

    except yt_dlp.utils.DownloadError as e:
        return {'error': str(e)}


if __name__ == "__main__":
    video_url = input("Enter the video URL: ")
    print(get_video_info(video_url))
