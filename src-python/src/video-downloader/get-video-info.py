import yt_dlp
import sys
import json


def get_video_info(url: str) -> dict:
    """
    Get video information from a given URL
    """
    # Configure yt-dlp options
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }

    # Create video info dictionary
    video_data = {
        'title': None,
        'duration': None,
        'formats': [],
        'thumbnail': None,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            video_data['title'] = info.get('title')
            video_data['duration'] = info.get('duration')
            video_data['thumbnail'] = info.get('thumbnail')

            for f in info.get('formats', []):
                video_data['formats'].append({
                    'format_id': f.get('format_id'),
                    'ext': f.get('ext'),
                    'resolution': f.get('resolution'),
                })

        return video_data

    except Exception as e:
        return {'error': str(e)}


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'URL argument is required'}))
        sys.exit(1)

    url = sys.argv[1]
    video_info = get_video_info(url)
    print(json.dumps(video_info))
    sys.exit(0)
