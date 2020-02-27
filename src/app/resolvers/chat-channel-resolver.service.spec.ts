import { TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../reducers/reducers';
import { AppState } from '../reducers/app.states';

import { ChatChannelResolver } from './chat-channel-resolver.service';
import { WebsocketService } from '../services/websocket.service';
import { SET_CURRENT_SERVER } from '../reducers/current-server.reducer';
import { ChannelList, ChatChannel } from '../../../shared-interfaces/channel.interface';
import { JOIN_CHANNEL } from '../reducers/current-chat-channel.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorService } from '../services/error.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

describe('ChatChannelResolverService', () => {
  let service: ChatChannelResolver;
  let store: Store<AppState>;
  let router: Router;

  const fakeWebSocketService = {
    socket: {
      emit: jasmine.createSpy(),
    },
  };
  const route = {
    paramMap: {
      get: () => 'asd',
    },
    parent: {
      url: [
        { path: 'parentPath' },
      ],
    },
  };
  const channelList: ChannelList = {
    server_id: '123',
    channels: [
      { _id: 'asd', server_id: '123', name: 'chan1', last_message: new Date() },
      { _id: 'dmchannel', name: 'dmchannelName', user_ids: [], last_message: new Date() },
    ],
  };
  const server = {
    name: 'server1',
    _id: '123',
    owner_id: '345',
  };
  const fakeErrorService = {
    errorMessage: {
      next: jasmine.createSpy(),
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatChannelResolver,
        { provide: WebsocketService, useValue: fakeWebSocketService },
        { provide: ErrorService, useValue: fakeErrorService },
      ],
      imports: [
        StoreModule.forRoot(reducers),
        RouterTestingModule,
      ],
    });
    service = TestBed.get(ChatChannelResolver);
    store = TestBed.get(Store);
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: server,
    });
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    fakeErrorService.errorMessage.next.calls.reset();
    fakeWebSocketService.socket.emit.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('resolves if current server contains channel list', async () => {
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: { ...server, channelList: channelList },
    });
    spyOn(store, 'dispatch').and.callThrough();
    await service.resolve(<any>route, null);
    const expectedCreatedChannel: ChatChannel = {
      _id: channelList.channels[0]._id,
      name: channelList.channels[0].name,
      server_id: channelList.channels[0].server_id,
    };
    expect(store.dispatch).toHaveBeenCalledWith({
      type: JOIN_CHANNEL,
      payload: expectedCreatedChannel,
    });
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('join-channel', 'asd');
  });
  it('resolves with a dm channel', async () => {
    route.paramMap = {
      get: () => 'dmchannel',
    };
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: { ...server, channelList: channelList },
    });
    spyOn(store, 'dispatch').and.callThrough();
    await service.resolve(<any>route, null);
    const channelListItem = channelList.channels.find(chan => chan._id === 'dmchannel');
    const expectedCreatedChannel: ChatChannel = {
      _id: channelListItem._id,
      name: channelListItem.name,
      user_ids: channelListItem.user_ids,
    };
    expect(store.dispatch).toHaveBeenCalledWith({
      type: JOIN_CHANNEL,
      payload: expectedCreatedChannel,
    });
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('join-channel', 'dmchannel');
    const currentChannel = await store.select('currentChatChannel')
      .take(1)
      .toPromise();
    expect(currentChannel._id).toEqual('dmchannel');
    expect(currentChannel.user_ids).toEqual([]);
    expect(currentChannel.server_id).toBeUndefined();
  });
  it('gets dm channels if parent path  === friends', async () => {
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: { ...server, channelList: channelList },
    });
    const friendsRoute = {
      paramMap: {
        get: () => 'asd',
      },
      parent: {
        url: [
          { path: 'friends' },
        ],
      },
    };

    await service.resolve(<any>friendsRoute, null);
    expect(fakeWebSocketService.socket.emit)
      .toHaveBeenCalledWith('get-dm-channels', undefined);
  });
  it('redirects to correct path when path === friends', async () => {
    const friendsRoute = {
      paramMap: {
        get: () => 'asd',
      },
      parent: {
        url: [
          { path: 'friends' },
        ],
      },
    };

    // Throw error to speed up timeout process
    spyOn(Observable.prototype, 'timeout').and.throwError('testerror');

    await service.resolve(<any>friendsRoute, null);
    expect(router.navigate).toHaveBeenCalledWith(['friends']);
  });
  it('redirects if channel not found in server', async () => {
    store.dispatch({
      type: SET_CURRENT_SERVER,
      payload: { ...server, channelList: channelList },
    });
    const routeWithInvalidId = {
      ...route,
      paramMap: {
        get: () => 'wrong',
      },
    };
    // Throw error to speed up timeout process
    spyOn(Observable.prototype, 'timeout').and.throwError('testerror');
    spyOn(store, 'dispatch');

    await service.resolve(<any>routeWithInvalidId, null);
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });
});
