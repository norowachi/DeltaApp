export enum Roles {
  STAFF = 1 << 0, // user is a staff member
  BOT = 1 << 1, // user is a bot
  VERIFIED = 1 << 2, // user (whether bot or not) is verified
}
