import {
  buildServer,
  makeRequest,
  makeAuthRequest,
  clearUsers,
  insertUser,
  clearStatuses,
  insertStatus,
} from './helpers/utils.js';
import statusesData from '../__fixtures__/statuses.json';
import usersFixture from '../__fixtures__/users.json';

const validCredentials = usersFixture.session.valid;
const testUser = usersFixture.users.existing;

describe('Status Management Routes', () => {
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
    await insertUser(server, testUser);
    await clearStatuses(server);
    await insertStatus(server, statusesData.existing);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Access control', () => {
    it('GET /statuses without auth should redirect to main', async () => {
      const res = await request({ method: 'GET', url: '/statuses' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('GET /statuses/new without auth should redirect to main', async () => {
      const res = await request({ method: 'GET', url: '/statuses/new' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });
  });

  describe('Status CRUD (authenticated)', () => {
    it('GET /statuses should return list of statuses', async () => {
      const res = await authRequest(
        { method: 'GET', url: '/statuses' },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain(statusesData.existing.name);
    });

    it('GET /statuses/new should show creation form', async () => {
      const res = await authRequest(
        { method: 'GET', url: '/statuses/new' },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain('<form');
    });

    it('POST /statuses with valid data should create status and redirect', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/statuses',
          payload: { data: statusesData.new },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/statuses');

      const list = await authRequest(
        { method: 'GET', url: '/statuses' },
        validCredentials,
      );
      expect(list.payload).toContain(statusesData.new.name);
    });

    it('POST /statuses with invalid data should re-render form', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/statuses',
          payload: { data: { name: '' } },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toMatch(/<div[^>]+alert-danger/);
    });

    it('GET /statuses/:id/edit should show edit form', async () => {
      const { id, name } = statusesData.existing;
      const res = await authRequest(
        { method: 'GET', url: `/statuses/${id}/edit` },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain(name);
      expect(res.payload).toContain('<form');
    });

    it('POST /statuses/:id with _method=patch valid should update and redirect', async () => {
      const { id } = statusesData.existing;
      const update = { name: statusesData.updated.name };
      const res = await authRequest(
        {
          method: 'POST',
          url: `/statuses/${id}`,
          payload: { _method: 'patch', data: update },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/statuses');

      const list = await authRequest(
        { method: 'GET', url: '/statuses' },
        validCredentials,
      );
      expect(list.payload).toContain(statusesData.updated.name);
    });

    it('POST /statuses/:id with _method=patch invalid should re-render edit form', async () => {
      const { id } = statusesData.existing;
      const res = await authRequest(
        {
          method: 'POST',
          url: `/statuses/${id}`,
          payload: { _method: 'patch', data: { name: '' } },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toMatch(/<div[^>]+alert-danger/);
    });
  });
});
