use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub async fn validate_url(app: tauri::AppHandle, url: String) -> Result<bool, String> {
    let validate_url_bin = app
    .shell()
    .sidecar("validate-video-url")
    .map_err(|e| format!("Erro ao localizar o sidecar: {}", e))?
    .arg(url);

    let output = validate_url_bin.output().await.map_err(|e| format!("Erro ao executar o sidecar: {}", e))?;

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
pub async fn get_video_info(app: tauri::AppHandle, url: String) -> Result<serde_json::Value, String> {
  let get_video_info_bin = app
  .shell()
  .sidecar("get-video-info")
  .map_err(|e| format!("Erro ao localizar o sidecar: {}", e))?
  .arg(url);

  let output = get_video_info_bin.output().await.map_err(|e| format!("Erro ao executar o sidecar: {}", e))?;

  let exit_code = output.status.code().unwrap_or(-1); // -1 indica erro desconhecido

  // Verifica o código de saída
  if exit_code == 0 {
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    serde_json::from_str(&stdout)
      .map_err(|e| format!("Erro ao fazer parse do JSON: {}", e))
  } else {
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    Err(format!("Erro (código {}): {}", exit_code, stderr))
  }
}
