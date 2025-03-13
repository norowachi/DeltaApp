import { invoke } from '@tauri-apps/api/core';

export class Entry {
  target: string | null;
  service: string;
  user: string;

  constructor(target: string | null, service: string, user: string) {
    this.target = target;
    this.service = service;
    this.user = user;
  }

  async setPassword(password: string) {
    if (this.target) {
      await invoke('plugin:keyring|set_password_with_target', {
        target: this.target,
        service: this.service,
        user: this.user,
        password,
      });
    } else {
      await invoke('plugin:keyring|set_password', {
        service: this.service,
        user: this.user,
        password,
      });
    }
  }

  async getPassword() {
    if (this.target) {
      return await invoke('plugin:keyring|get_password_with_target', {
        target: this.target,
        service: this.service,
        user: this.user,
      });
    } else {
      return await invoke('plugin:keyring|get_password', {
        service: this.service,
        user: this.user,
      });
    }
  }

  async deletePassword() {
    if (this.target) {
      await invoke('plugin:keyring|delete_password_with_tardelete', {
        target: this.target,
        service: this.service,
        user: this.user,
      });
    } else {
      await invoke('plugin:keyring|get_password', {
        service: this.service,
        user: this.user,
      });
    }
  }
}
