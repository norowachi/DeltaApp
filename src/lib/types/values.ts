export enum Roles {
  STAFF = 1 << 0, // user is a staff member
  BOT = 1 << 1, // user is a bot
  VERIFIED = 1 << 2, // user (whether bot or not) is verified
}

export enum WebSocketOP {
  HELLO = 0,
  JOIN = 1,
  LEAVE = 2,
  MESSAGE_CREATE = 3,
  MESSAGE_UPDATE = 4,
  MESSAGE_DELETE = 5,
}

export enum ChannelTypes {
  DM = 0,
  TEXT = 1,
  VOICE = 2,
}

export enum ChannelPermissions {
  PUBLIC = 1 << 0,
}
