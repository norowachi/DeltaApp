const COMMANDS: &[&str] = &[
    "set_password",
    "set_password_with_target",
    "get_password",
    "get_password_with_target",
    "delete_password",
    "delete_password_with_target",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .build();
}
