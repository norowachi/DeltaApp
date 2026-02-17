#[cfg(desktop)]
use tauri::Manager;

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_keyring::init())
        .invoke_handler(tauri::generate_handler![
            commands::login,
            commands::register,
            #[cfg(desktop)]
            commands::create_notification_window,
            #[cfg(desktop)]
            commands::update_application
        ]);

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_process::init())
            .plugin(tauri_plugin_updater::Builder::new().build())
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
