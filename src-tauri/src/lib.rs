use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![validate_url])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn validate_url(app: tauri::AppHandle, url: String) -> Result<bool, String> {
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
