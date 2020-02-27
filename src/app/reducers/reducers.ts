import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.states';
import { serverListReducer } from './server-list.reducer';
import { currentServerReducer } from './current-server.reducer';
import { currentChatChannelReducer } from './current-chat-channel.reducer';
import { friendsReducer } from './friends-reducer';
import { meReducer } from './me-reducer';
import { currentVoiceChannelReducer } from './current-voice-channel-reducer';

export const reducers: ActionReducerMap<AppState> = {
  serverList: serverListReducer,
  currentServer: currentServerReducer,
  currentChatChannel: currentChatChannelReducer,
  currentVoiceChannel: currentVoiceChannelReducer,
  friends: friendsReducer,
  me: meReducer,
};
