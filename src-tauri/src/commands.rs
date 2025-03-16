// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde_json::json;
use tauri_plugin_http::reqwest;
#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;

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

#[tauri::command]
pub async fn register(
    username: Option<String>,
    handle: Option<String>,
    password: String,
) -> serde_json::Value {
    let res = reqwest::Client::new()
        .post("https://api.noro.cc/auth/register")
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

#[cfg(desktop)]
#[tauri::command]
pub async fn create_notification_window(app: tauri::AppHandle) {
    let _webview_window =
        tauri::WebviewWindowBuilder::from_config(&app, &app.config().app.windows[1].clone())
            .unwrap()
            .build()
            .unwrap();
}

#[cfg(desktop)]
#[tauri::command]
pub fn update_application(app: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        if let Some(update) = app.updater().unwrap().check().await.unwrap() {
            let mut downloaded: usize = 0;

            // calling the download method
            update
                .download_and_install(
                    |chunk_length, content_length| {
                        downloaded += chunk_length;
                        println!("downloaded {downloaded} from {content_length:?}",);
                    },
                    || {
                        println!("download finished");
                    },
                )
                .await
                .unwrap();

            println!("update installed");
        }
    });
}
