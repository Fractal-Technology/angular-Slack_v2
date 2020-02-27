import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as setCookie from 'set-cookie-parser';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { app } from '../../api-server';
import { verifyJWT } from './jwt';

import User from '../../models/user.model';


const expect = chai.expect;
chai.use(sinonChai);
// tslint:disable:no-unused-expression

describe('api/auth/login', () => {
  const sandbox = sinon.sandbox.create();
  let userId = null;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    const user = await User.create({
      username: 'test',
      password: '123456',
    });
    userId = user._id;
  });
  afterEach(async () => {
    await User.remove({});
    sandbox.restore();
  });

  it('username must be string', async () => {
    return supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: {},
        password: null,
      })
      .expect(400, {
        error: '"username" must be a string',
      });
  });
  it('username must be provided', async () => {
    return supertest(app.listen(null))
      .post('/api/login')
      .send({
        password: 'hi',
      })
      .expect(400, {
        error: '"username" is required',
      });
  });
  it('password must be provided', async () => {
    return supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: 'hi',
      })
      .expect(400, {
        error: '"password" is required',
      });
  });
  it('unauthorized if user is not found', async () => {
    const bcryptCompare = sandbox.spy(bcrypt, 'compare');
    const userFind = sandbox.spy(User, 'findOne');
    await supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: 'hi',
        password: '123456',
      })
      .expect(401, {
        error: 'Username or password incorrect.',
      });
    expect(userFind).to.have.been.calledOnce;
    expect(bcryptCompare).not.to.have.been.called;
  });
  it('unauthorized if password is wrong', async () => {
    const bcryptCompare = sandbox.spy(bcrypt, 'compare');
    const userFind = sandbox.spy(User, 'findOne');
    await supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: 'test',
        password: '123asd',
      })
      .expect(401, {
        error: 'Username or password incorrect.',
      });
    expect(userFind).to.have.been.calledOnce;
    expect(bcryptCompare).to.have.been.calledOnce;
  });
  it('with correct credentials returns a valid token', async () => {
    const bcryptCompare = sandbox.spy(bcrypt, 'compare');
    await supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: 'test',
        password: '123456',
      })
      .expect(204)
      .then(async res => {
        const cookies = setCookie.parse(res);
        const jwtCookie = cookies.find((item) => item.name === 'jwt_token');
        expect(jwtCookie).to.exist;
        expect(jwtCookie.value).to.be.a('string').that.is.not.empty;
        // expect(jwtCookie.maxAge).to.equal(60);
        const decoded: any = await verifyJWT(jwtCookie.value);
        expect(decoded.username).to.equal('test');
        expect(decoded.user_id).to.equal(userId.toString());
      });
    expect(bcryptCompare).to.have.been.calledOnce;
  });
});
