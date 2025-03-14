use serde_json::json;
use tauri_plugin_http::reqwest;

#[tauri::command]
pub async fn login(
    username: Option<String>,
    handle: Option<String>,
    password: String,
) -> serde_json::Value {
    let res = reqwest::Client::new()
        .post("https://api.noro.cc/auth/login")
        .header("Content-Type", "application/json")
        .json(&json!(
            {
                "username": Some(username),
                "handle": Some(handle),
                "password": password
            }
        ))
        .send()
        .await
        .unwrap();
    return res.json().await.unwrap();
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
pub async fn create_notification_window(app: tauri::AppHandle) {
    let _webview_window =
        tauri::WebviewWindowBuilder::from_config(&app, &app.config().app.windows[1].clone())
            .unwrap()
            .build()
            .unwrap();
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
