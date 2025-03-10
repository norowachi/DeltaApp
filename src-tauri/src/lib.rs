use serde_json::json;
#[cfg(desktop)]
use tauri::Manager;
use tauri_plugin_http::reqwest;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_keyring::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            login,
            #[cfg(desktop)]
            create_notification
        ]);

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _, _| {
                let _ = app
                    .get_webview_window("main")
                    .expect("no main window")
                    .set_focus();
            }))
            .setup(|app| {
                let _ = tauri::WebviewWindowBuilder::from_config(
                    app,
                    &app.config().app.windows[1].clone(),
                )
                .unwrap()
                .build()
                .unwrap();
                Ok(())
            });
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
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

#[cfg(desktop)]
#[tauri::command]
async fn create_notification(app: tauri::AppHandle) {
    let _webview_window =
        tauri::WebviewWindowBuilder::from_config(&app, &app.config().app.windows[1].clone())
            .unwrap()
            .build()
            .unwrap();
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
