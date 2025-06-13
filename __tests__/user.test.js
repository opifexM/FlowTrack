import {
  buildServer,
  makeAuthRequest,
  clearUsers,
  insertUser,
  makeRequest,
} from './helpers/utils.js';
import testData from '../__fixtures__/users.json';

describe('User Management Routes', () => {
  let server;
  let request;
  let authRequest;

  beforeAll(async () => {
    server = await buildServer();
    request = makeRequest(server);
    authRequest = makeAuthRequest(server);
  });

  beforeEach(async () => {
    await clearUsers(server);
    await insertUser(server, testData.users.existing);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Session Routes', () => {
    it('GET /session/new should return 200', async () => {
      const res = await request({ method: 'GET', url: '/session/new' });
      expect(res.statusCode).toBe(200);
    });

    it('POST /session with valid credentials should redirect, set cookie and go to root', async () => {
      const res = await request({
        method: 'POST',
        url: '/session',
        payload: { data: testData.session.valid },
      });
      expect(res.statusCode).toBe(302);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers.location).toBe('/');
    });

    it('POST /session with invalid credentials should redirect back to login', async () => {
      const res = await request({
        method: 'POST',
        url: '/session',
        payload: { data: testData.session.invalid },
      });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/session/new');
    });

    it('DELETE /session via _method=delete should logout and redirect to root', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/session',
          payload: { _method: 'delete' },
        },
        testData.session.valid,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('DELETE /session should logout and redirect to root', async () => {
      const res = await authRequest(
        { method: 'DELETE', url: '/session' },
        testData.session.valid,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });
  });

  describe('User Routes', () => {
    describe('Public', () => {
      it('GET /users should return 200 and list existing user', async () => {
        const res = await request({ method: 'GET', url: '/users' });
        expect(res.statusCode).toBe(200);
        expect(res.payload).toContain(testData.users.existing.email);
      });

      it('GET /users/new should return 200', async () => {
        const res = await request({ method: 'GET', url: '/users/new' });
        expect(res.statusCode).toBe(200);
      });

      it('POST /users with valid data should create a new user, redirect and list it', async () => {
        const res = await request({
          method: 'POST',
          url: '/users',
          payload: { data: testData.users.new },
        });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/');

        const list = await request({ method: 'GET', url: '/users' });
        expect(list.payload).toContain(testData.users.new.email);
      });

      it('POST /users with invalid data should render form with errors', async () => {
        const res = await request({
          method: 'POST',
          url: '/users',
          payload: { data: testData.users.invalid },
        });
        expect(res.statusCode).toBe(200);
        expect(res.payload).toMatch(/<div[^>]+alert-danger/);
      });
    });

    describe('Protected User Routes', () => {
      const { id } = testData.users.existing;

      describe('when unauthenticated', () => {
        it('GET /users/:id/edit should redirect to “/”', async () => {
          const res = await request({ method: 'GET', url: `/users/${id}/edit` });
          expect(res.statusCode).toBe(302);
          expect(res.headers.location).toBe('/');
        });
      });

      describe('when authenticated', () => {
        it('GET /users/:id/edit should return 200 and show user data', async () => {
          const res = await authRequest(
            { method: 'GET', url: `/users/${id}/edit` },
            testData.session.valid,
          );
          expect(res.statusCode).toBe(200);
          expect(res.payload).toContain(
            `value="${testData.users.existing.firstName}"`,
          );
        });
      });
    });
  });
});
