use serde::de::DeserializeOwned;
use tauri::{
    plugin::{PluginApi, PluginHandle},
    Runtime,
};

use keyring::credential::{
    Credential, CredentialApi, CredentialBuilder, CredentialBuilderApi, CredentialPersistence,
};
use keyring::error::{Error, Result};

const PLUGIN_IDENTIFIER: &str = "com.plugin.keyring";

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetRequest {
    pub file: String,
    pub key: String,
    pub value: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetRequest {
    pub file: String,
    pub key: String,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetResponse {}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetResponse {
    pub value: Option<String>,
}

pub fn init<R: Runtime, C: DeserializeOwned>(api: PluginApi<R, C>) -> crate::Result<()> {
    let handle = api.register_android_plugin(PLUGIN_IDENTIFIER, "KeyringPlugin")?;
    keyring::set_default_credential_builder(default_credential_builder(handle));
    Ok(())
}

/// The concrete Android credential
#[derive(Debug)]
pub struct AndroidCredential<R: Runtime> {
    pub file: String,
    pub key: String,
    pub plugin_handle: PluginHandle<R>,
}

impl<R: Runtime> CredentialApi for AndroidCredential<R> {
    /// Set a password on a Android credential.
    ///
    /// If there is an error in the Android, it will be returned
    /// and the password will _not_ be set.  The error will
    /// be cleared, so calling again will set the password.
    fn set_password(&self, password: &str) -> Result<()> {
        let _: std::result::Result<SetResponse, tauri::plugin::mobile::PluginInvokeError> =
            self.plugin_handle.run_mobile_plugin(
                "setPassword",
                SetRequest {
                    file: self.file.clone(),
                    key: self.key.clone(),
                    value: password.to_string(),
                },
            );
        Ok(())
    }

    /// Get the password from a Android credential, if any.
    ///
    /// If there is an error set in the Android, it will
    /// be returned instead of a password.
    fn get_password(&self) -> Result<String> {
        let res: std::result::Result<GetResponse, tauri::plugin::mobile::PluginInvokeError> =
            self.plugin_handle.run_mobile_plugin(
                "getPassword",
                GetRequest {
                    file: self.file.clone(),
                    key: self.key.clone(),
                },
            );
        match res {
            Ok(res) => match res.value {
                Some(val) => Ok(val),
                None => Err(Error::NoEntry),
            },
            Err(e) => Err(Error::PlatformFailure(Box::new(e))),
        }
    }

    /// Delete the password in a Android credential
    ///
    /// If there is an error, it will be returned and
    /// the deletion will not happen.
    ///
    /// If there is no password, a [NoEntry](Error::NoEntry) error
    /// will be returned.
    fn delete_credential(&self) -> Result<()> {
        let res: std::result::Result<GetResponse, tauri::plugin::mobile::PluginInvokeError> =
            self.plugin_handle.run_mobile_plugin(
                "deletePassword",
                GetRequest {
                    file: self.file.clone(),
                    key: self.key.clone(),
                },
            );
        match res {
            Ok(_) => Ok(()),
            Err(e) => Err(Error::PlatformFailure(Box::new(e))),
        }
    }

    /// Return this Android credential concrete object
    /// wrapped in the [Any](std::any::Any) trait,
    /// so it can be downcast.
    fn as_any(&self) -> &dyn std::any::Any {
        self
    }

    fn set_secret(&self, secret: &[u8]) -> Result<()> {
        self.set_password(&String::from_utf8(secret.to_vec()).unwrap())
    }

    fn get_secret(&self) -> Result<Vec<u8>> {
        self.get_password().map(|s| s.into_bytes())
    }
}

impl<R: Runtime> AndroidCredential<R> {
    /// Make a new Android credential.
    fn new_with_target(
        target: Option<&str>,
        service: &str,
        user: &str,
        plugin_handle: PluginHandle<R>,
    ) -> Result<Self> {
        match target {
            Some(target) => Ok(AndroidCredential {
                file: target.to_string(),
                key: format!("{user}.{service}"),
                plugin_handle: plugin_handle,
            }),
            None => Ok(AndroidCredential {
                file: service.to_string(),
                key: user.to_string(),
                plugin_handle: plugin_handle,
            }),
        }
    }
}

/// The builder for Android credentials.
pub struct AndroidCredentialBuilder<R: Runtime> {
    pub plugin_handle: PluginHandle<R>,
}

impl<R: Runtime> CredentialBuilderApi for AndroidCredentialBuilder<R> {
    /// Build a Android credential for the given target, service, and user.
    ///
    /// Since Androids don't persist between sessions,  all Androids
    /// start off without passwords.
    fn build(&self, target: Option<&str>, service: &str, user: &str) -> Result<Box<Credential>> {
        let credential: AndroidCredential<R> =
            AndroidCredential::new_with_target(target, service, user, self.plugin_handle.clone())
                .unwrap();
        Ok(Box::new(credential))
    }

    /// Get an [Any][std::any::Any] reference to the Android credential builder.
    fn as_any(&self) -> &dyn std::any::Any {
        self
    }

    /// This keystore keeps the password in the entry!
    fn persistence(&self) -> CredentialPersistence {
        CredentialPersistence::EntryOnly
    }
}

/// Return a Android credential builder for use by clients.
fn default_credential_builder<R: Runtime>(
    plugin_handle: PluginHandle<R>,
) -> Box<CredentialBuilder> {
    Box::new(AndroidCredentialBuilder {
        plugin_handle: plugin_handle,
    })
}
