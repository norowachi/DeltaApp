'use strict';

var core = require('@tauri-apps/api/core');

class Entry {
    constructor(target, service, user) {
        this.target = target;
        this.service = service;
        this.user = user;
    }
    async setPassword(password) {
        if (this.target) {
            await core.invoke('plugin:keyring|set_password_with_target', {
                target: this.target,
                service: this.service,
                user: this.user,
                password
            });
        }
        else {
            await core.invoke('plugin:keyring|set_password', {
                service: this.service,
                user: this.user,
                password
            });
        }
    }
    async getPassword() {
        if (this.target) {
            return await core.invoke('plugin:keyring|get_password_with_target', {
                target: this.target,
                service: this.service,
                user: this.user,
            });
        }
        else {
            return await core.invoke('plugin:keyring|get_password', {
                service: this.service,
                user: this.user,
            });
        }
    }
    async deletePassword() {
        if (this.target) {
            await core.invoke('plugin:keyring|delete_password_with_tardelete', {
                target: this.target,
                service: this.service,
                user: this.user,
            });
        }
        else {
            await core.invoke('plugin:keyring|get_password', {
                service: this.service,
                user: this.user,
            });
        }
    }
}

exports.Entry = Entry;
