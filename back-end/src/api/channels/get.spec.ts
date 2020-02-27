import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { app } from '../../api-server';
import { createJWT } from '../auth/jwt';
import User from '../../models/user.model';
import Channel from '../../models/channel.model';
// tslint:disable:no-unused-expression

const expect = chai.expect;
chai.use(sinonChai);

describe('api/channels/get', () => {
  let token;
  let invalidToken;
  let user1, user2, user3;
  let channel1, channel2;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
    invalidToken = createJWT({
      username: 'test-user',
      user_id: '123456781234567812345678',
    }, `5s`);
  });
  beforeEach(async () => {
    user1 = await User.create({ username: 'test-user1', password: '123456' });
    user2 = await User.create({ username: 'test-user2', password: '123456' });
    user3 = await User.create({
      username: 'test-user3',
      password: '123456',
      friends: [user1._id, user2._id],
    });
    token = createJWT({
      username: 'test-user',
      user_id: user1._id,
    }, `3s`);
  });
  after(async () => {
    mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    await Channel.remove({});
  });
  it('returns 401 if not logged in', async () => {
    return supertest(app.listen(null))
      .get('/api/channels')
      .set('Cookie', `jwt_token=`)
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 401 if user does not exist', async () => {
    return supertest(app.listen(null))
      .get('/api/channels')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .expect(401);
  });
  it('returns channels', async () => {
    channel1 = await Channel.create({
      name: 'chantest',
      user_ids: [user1._id, user2._id],
    });
    channel2 = await Channel.create({
      name: 'chantest2',
      user_ids: [user1._id, user3._id],
    });
    return supertest(app.listen(null))
      .get('/api/channels')
      .set('Cookie', `jwt_token=${token}`)
      .expect(200)
      .then(response => {
        expect(response.body).to.have.property('channels');
        expect(response.body.channels).to.have.length(2);
      });
  });
});
