# Tauri Plugin keyring

Store and retrieve secrets in the underlying platform secure store using [keyring-rs](https://crates.io/crates/keyring)

## Android support

Android support is added using Encrypted SharedPreferences.

The following line might need to be added to `src-tauri\gen\android\app\proguard-rules.pro` to fix a compiler error:

```
-dontwarn javax.annotation.**
```

## Install

Install the Core plugin by adding the following to your `Cargo.toml` file:

`src-tauri/Cargo.toml`

```toml
[dependencies]
tauri-plugin-keyring = { git = "https://github.com/LightraysTech/tauri-plugin-keyring" }
```

You can install the JavaScript Guest bindings using your preferred JavaScript package manager:

```sh
pnpm add https://github.com/LightraysTech/tauri-plugin-keyring
# or
npm add https://github.com/LightraysTech/tauri-plugin-keyring
# or
yarn add https://github.com/LightraysTech/tauri-plugin-keyring
```

## Usage

First you need to register the core plugin with Tauri:

`src-tauri/src/main.rs`

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_keyring::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Afterwards all the plugin's APIs are available through the JavaScript guest bindings:

```javascript
import { Entry } from 'tauri-plugin-keyring-api';

const entry = new Entry('my_target', 'my_service', 'my_name');

const entry2 = new Entry(null, 'my_service', 'my_name');

entry.setPassword('topS3cr3tP4$$w0rd');

console.log(await entry.getPassword());

entry.deletePassword();
```

## Contributing

PRs accepted.
