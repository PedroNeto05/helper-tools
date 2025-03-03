use tauri_plugin_shell::ShellExt;

#[derive(serde::Deserialize)]
struct Format {
    format_id: String,
    resolution: Option<u32>,
    tbr: Option<f32>,
    fps: Option<f32>,
    ext: String,
}
#[derive(serde::Deserialize)]
struct VideoInfo {
    title: String,
    duration: u64,
    thumbnail: String,
    formats: Vec<Format>,
}

#[derive(serde::Serialize)]
struct VideoFormat {
    format_id: String,
    resolution: u32,
    tbr: Option<f32>,
    fps: f32,
    ext: String,
}

#[derive(serde::Serialize)]
struct AudioFormat {
    format_id: String,
    tbr: Option<f32>,
    ext: String,
}

#[derive(serde::Serialize)]
struct NormalizedVideoInfo {
    title: String,
    duration: u64,
    thumbnail: String,
    video_formats: Vec<VideoFormat>,
    audio_formats: Vec<AudioFormat>,
}

#[tauri::command]
pub async fn validate_url(app: tauri::AppHandle, url: String) -> Result<bool, String> {
    let validate_url_bin = app
        .shell()
        .sidecar("validate-video-url")
        .map_err(|e| format!("Erro ao localizar o sidecar: {}", e))?
        .arg(url);

    let output = validate_url_bin
        .output()
        .await
        .map_err(|e| format!("Erro ao executar o sidecar: {}", e))?;

    let exit_code = output.status.code().unwrap_or(-1); // -1 indica erro desconhecido

    // Verifica o código de saída
    if exit_code == 0 {
        Ok(true)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Erro (código {}): {}", exit_code, stderr))
    }
}

#[tauri::command]
pub async fn get_video_info(
    app: tauri::AppHandle,
    url: String,
) -> Result<serde_json::Value, String> {
    let get_video_info_bin = app
        .shell()
        .sidecar("get-video-info")
        .map_err(|e| format!("Erro ao localizar o sidecar: {}", e))?
        .arg(url);

    let output = get_video_info_bin
        .output()
        .await
        .map_err(|e| format!("Erro ao executar o sidecar: {}", e))?;

    let exit_code = output.status.code().unwrap_or(-1); // -1 indica erro desconhecido

    // Verifica o código de saída
    if exit_code == 0 {
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let video_info: VideoInfo = serde_json::from_str(&stdout)
            .map_err(|e| format!("Erro ao fazer parse do JSON: {}", e))?;
        let normalized_video_info = parse_video_info(video_info);
        let normalized_video_info_json = serde_json::to_string(&normalized_video_info)
            .map_err(|e| format!("Erro ao converter para JSON: {}", e))?;
        serde_json::from_str(&normalized_video_info_json)
            .map_err(|e| format!("Erro ao fazer parse do JSON: {}", e))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Erro (código {}): {}", exit_code, stderr))
    }
}

fn parse_video_info(video_info: VideoInfo) -> NormalizedVideoInfo {
    let mut video_formats: Vec<VideoFormat> = vec![];
    let mut audio_formats: Vec<AudioFormat> = vec![];
    for format in video_info.formats {
        match format.resolution {
            Some(res) => {
                video_formats.push(VideoFormat {
                    format_id: format.format_id,
                    resolution: res,
                    tbr: format.tbr,
                    fps: format.fps.unwrap(),
                    ext: format.ext,
                });
                continue;
            }
            None => {
                audio_formats.push(AudioFormat {
                    format_id: format.format_id,
                    tbr: format.tbr,
                    ext: format.ext,
                });
            }
        }
    }

    NormalizedVideoInfo {
        title: video_info.title,
        duration: video_info.duration,
        thumbnail: video_info.thumbnail,
        video_formats,
        audio_formats,
    }
}
