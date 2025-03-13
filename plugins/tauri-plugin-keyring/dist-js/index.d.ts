export declare class Entry {
  target: string | null;
  service: string;
  user: string;
  constructor(target: string | null, service: string, user: string);
  setPassword(password: string): Promise<void>;
  getPassword(): Promise<unknown>;
  deletePassword(): Promise<void>;
}
