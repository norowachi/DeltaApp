use keyring::Entry;
use tauri::command;

#[command]
pub(crate) async fn set_password_with_target(
    target: &str,
    service: &str,
    user: &str,
    password: &str,
) -> Result<(), String> {
    let e = Entry::new_with_target(target, service, user).map_err(|err| err.to_string())?;
    e.set_password(password).map_err(|err| err.to_string())
}

#[command]
pub(crate) async fn set_password(service: &str, user: &str, password: &str) -> Result<(), String> {
    let e = Entry::new(service, user).map_err(|err| err.to_string())?;
    e.set_password(password).map_err(|err| err.to_string())
}

#[command]
pub(crate) async fn get_password_with_target(
    target: &str,
    service: &str,
    user: &str,
) -> Result<String, String> {
    let e = Entry::new_with_target(target, service, user).map_err(|err| err.to_string())?;
    e.get_password().map_err(|err| err.to_string())
}

#[command]
pub(crate) async fn get_password(service: &str, user: &str) -> Result<String, String> {
    let e = Entry::new(service, user).map_err(|err| err.to_string())?;
    e.get_password().map_err(|err| err.to_string())
}

#[command]
pub(crate) async fn delete_password_with_target(
    target: &str,
    service: &str,
    user: &str,
) -> Result<(), String> {
    let e = Entry::new_with_target(target, service, user).map_err(|err| err.to_string())?;
    e.delete_credential().map_err(|err| err.to_string())
}

#[command]
pub(crate) async fn delete_password(service: &str, user: &str) -> Result<(), String> {
    let e = Entry::new(service, user).map_err(|err| err.to_string())?;
    e.delete_credential().map_err(|err| err.to_string())
}
