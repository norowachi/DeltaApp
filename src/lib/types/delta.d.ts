enum WebSocketOP {
  HELLO = 0,
  MESSAGE_CREATE = 1,
  MESSAGE_UPDATE = 2,
  MESSAGE_DELETE = 3,
}

// User & Member Interfaces


interface PrivateUser {
  id: string;
  username: string;
  handle: string;
  avatar: string | null;
  roles: number;
  disabled: boolean;
  deleted: boolean;
  bot: boolean;
  system: boolean;
}

interface IUser {
  id: string;
  username: string;
  handle: string;
  avatar: string | null;
  roles: number;
  password: string;
  disabled: boolean;
  deleted: boolean;
  bot: boolean;
  system: boolean;
  token: string;
  guilds: IGuild[];
}

interface IMember {
  id: string;
  user: PrivateUser;
  guildId: string;
  nickname: string;
  owner: boolean;
}

// Message Interface
interface IMessage {
  id: string;
  content: string;
  embeds: IEmbed[];
  system: boolean;
  author: PrivateUser;
  channelId: string;
  guildId: string | null;
  ephemeral: boolean;
  readBy: string[];
  createdAt: Date;
  mentions: {
    [id: string]: string;
  };
}

interface IEmbed {
  type: 'image' | 'video' | 'link';
  title?: string;
  url?: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  description?: string;
  thumbnail?: string;
}

// Guild & Channel Interface
interface IGuild {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  members: string[];
  ownerId: string;
  channels: IChannel[];
  deleted: boolean;
}

//! Important
enum ChannelTypes {
  DM = 0,
  TEXT = 1,
  VOICE = 2,
}

interface IChannel {
  id: string;
  name: string;
  stickyMessage?: IMessage;
  messages: number;
  guildId: string;
  members: string[];
  type: ChannelTypes;
}
