package com.plugin.keyring

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import app.tauri.plugin.Invoke
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
//import android.security.keystore.KeyGenParameterSpec
//import android.security.keystore.KeyProperties

@InvokeArg
class SetPasswordArgs {
  lateinit var file: String
  lateinit var key: String
  lateinit var value: String
}

@InvokeArg
class GetPasswordArgs {
  lateinit var file: String
  lateinit var key: String
}

@TauriPlugin
class KeyringPlugin(private val activity: Activity): Plugin(activity) {

    @Command
    fun setPassword(invoke: Invoke) {
        val context = activity
        val args = invoke.parseArgs(SetPasswordArgs::class.java)


        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        val prefs = EncryptedSharedPreferences.create(
            context,
            args.file,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )

        prefs.edit().putString(args.key,args.value).apply()

        val ret = JSObject()
        invoke.resolve(ret)
    }

    @Command
    fun getPassword(invoke: Invoke) {
        val context = activity

        val args = invoke.parseArgs(GetPasswordArgs::class.java)

        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        val prefs = EncryptedSharedPreferences.create(
            context,
            args.file,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )

        

        val ret = JSObject()
        ret.put("value", prefs.getString(args.key, ""))
        invoke.resolve(ret)
    }

    @Command
    fun deletePassword(invoke: Invoke) {
        val context = activity

        val args = invoke.parseArgs(GetPasswordArgs::class.java)

        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        val prefs = EncryptedSharedPreferences.create(
            context,
            args.file,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )

        prefs.edit().remove(args.key).apply()
        

        val ret = JSObject()
        invoke.resolve(ret)
    }
}
