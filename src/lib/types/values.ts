export enum Roles {
  STAFF = 1 << 0, // user is a staff member
  BOT = 1 << 1, // user is a bot
  VERIFIED = 1 << 2, // user (whether bot or not) is verified
}

export enum WebSocketOP {
  HELLO = 0,
  MESSAGE_CREATE = 1,
  MESSAGE_UPDATE = 2,
  MESSAGE_DELETE = 3,
}