import sys
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError

def validate_video_url(url: str) -> bool:
    """
    Validates if the given URL is a valid video URL using yt-dlp
    Returns True if valid, False otherwise
    """
    ydl_opts = {
      'quiet': True,
      'no_warnings': True,
      'extract_flat': True,
    }
    try:
        with YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(url, download=False)
            return True
    except DownloadError:
        return False
    except Exception:
        return False

def main():
    if len(sys.argv) != 2:
        sys.exit(1)
    url = sys.argv[1]
    result = validate_video_url(url)
    sys.exit(0 if result else 1)

if __name__ == "__main__":
  main()