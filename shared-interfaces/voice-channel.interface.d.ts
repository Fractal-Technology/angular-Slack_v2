export interface VoiceChannel {
  _id: string;
  name: string;
  users: VoiceChannelUser[];
}

export interface VoiceChannelUser {
  socket_id: string;
  _id: string;
  username: string;
}

export interface CreateVoiceChannelRequest {
  name: string;
  server_id: string;
}
