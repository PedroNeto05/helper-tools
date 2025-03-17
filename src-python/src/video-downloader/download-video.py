from yt_dlp import YoutubeDL
from sys import exit, argv


def download_video(url: str, output_path: str, format_id):
    last_progress = 0  # Variável para armazenar o último progresso exibido

    def progress_hook(d):
        nonlocal last_progress
        if d['status'] == 'downloading' and d.get('_total_bytes'):
            total = d['_total_bytes']
            downloaded = d.get('_downloaded_bytes', 0)
            progress = int((downloaded / total) * 100)

            if progress > last_progress:  # Garante que o valor nunca diminua
                print(f"\r{progress}%", end='', flush=True)
                last_progress = progress

    ydl_opts = {
        'format': format_id,
        'outtmpl': f'{output_path}/%(title)s.%(ext)s',
        'progress_hooks': [progress_hook],
        'quiet': True,
        'no_warnings': True,
        'noprogress': True,
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])


if __name__ == '__main__':
    if len(argv) < 4:
        exit(1)
    url = argv[1]
    output_path = argv[2]
    format_id = argv[3]
    download_video(url, output_path, format_id)
