use tauri::Emitter;
#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri::Manager;
use tauri_plugin_updater::UpdaterExt;

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_keyring::init())
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::login,
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            commands::create_notification_window
        ]);

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder
            // setup the updater
            .setup(|app| {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    update(handle).await.unwrap();
                });
                Ok(())
            })
            // add single instance plugin to focus the main window when the app is already running
            .plugin(tauri_plugin_single_instance::init(|app, _, _| {
                let _ = app
                    .get_webview_window("main")
                    .expect("no main window")
                    .set_focus();
            }))
            // create the overlay (2nd) window
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

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded: usize = 0;

        // alternatively we could also call update.download() and update.install() separately
        update
            .download(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!(
                        "downloaded {}",
                        downloaded / usize::try_from(content_length.unwrap_or(0)).unwrap_or(0)
                            * 100
                    );
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        app.emit("update-downloaded", Some(update.version))
            .expect("failed to emit update-downloaded event");
    }

    Ok(())
}
