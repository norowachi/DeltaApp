use serde_json::json;
use tauri_plugin_http::reqwest;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn login(
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
