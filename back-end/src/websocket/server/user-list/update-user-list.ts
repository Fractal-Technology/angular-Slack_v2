import { UserListUpdate } from 'shared-interfaces/server.interface';

// Called when user changes status e.g. on login
export async function updateUserList(user, io) {
  user.joined_servers.forEach(serverId => {
    const userListUpdate: UserListUpdate = {
      server_id: serverId,
      user: {
        username: user.username,
        _id: user._id,
        online: true,
      },
    };
    io.in(`server-${serverId}`).emit('update-user-list', userListUpdate);
  });
}
