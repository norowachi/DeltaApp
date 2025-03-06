use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

pub use keyring;

#[cfg(target_os = "android")]
mod android;

mod commands;
mod error;

pub use error::{Error, Result};

use commands::*;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("keyring")
        .invoke_handler(tauri::generate_handler![
            set_password,
            set_password_with_target,
            get_password,
            get_password_with_target,
            delete_password,
            delete_password_with_target
        ])
        .setup(|_, api| {
            #[cfg(target_os = "android")]
            android::init(api)?;
            let _ = api;
            Ok(())
        })
        .build()
}
