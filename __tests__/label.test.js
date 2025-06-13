import {
  buildServer,
  makeRequest,
  makeAuthRequest,
  clearUsers,
  insertUser,
  clearLabels,
  insertLabel,
} from './helpers/utils.js';
import labelsData from '../__fixtures__/labels.json';
import usersFixture from '../__fixtures__/users.json';

const validCredentials = usersFixture.session.valid;
const testUser = usersFixture.users.existing;

describe('Label Management Routes', () => {
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
    await clearLabels(server);
    await insertLabel(server, labelsData.existing);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Access control', () => {
    it('GET /labels without auth should redirect to main', async () => {
      const res = await request({ method: 'GET', url: '/labels' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('GET /labels/new without auth should redirect to main', async () => {
      const res = await request({ method: 'GET', url: '/labels/new' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });
  });

  describe('Label CRUD (authenticated)', () => {
    it('GET /labels should return list of labels', async () => {
      const res = await authRequest(
        { method: 'GET', url: '/labels' },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain(labelsData.existing.name);
    });

    it('GET /labels/new should show creation form', async () => {
      const res = await authRequest(
        { method: 'GET', url: '/labels/new' },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain('<form');
    });

    it('POST /labels with valid data should create label and redirect', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/labels',
          payload: { data: labelsData.new },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/labels');

      const list = await authRequest(
        { method: 'GET', url: '/labels' },
        validCredentials,
      );
      expect(list.payload).toContain(labelsData.new.name);
    });

    it('POST /labels with invalid data should re-render form', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/labels',
          payload: { data: { name: '' } },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toMatch(/<div[^>]+alert-danger/);
    });

    it('GET /labels/:id/edit should show edit form', async () => {
      const { id, name } = labelsData.existing;
      const res = await authRequest(
        { method: 'GET', url: `/labels/${id}/edit` },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain(name);
      expect(res.payload).toContain('<form');
    });

    it('POST /labels/:id with _method=patch valid should update and redirect', async () => {
      const { id } = labelsData.existing;
      const update = { name: labelsData.updated.name };
      const res = await authRequest(
        {
          method: 'POST',
          url: `/labels/${id}`,
          payload: { _method: 'patch', data: update },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/labels');

      const list = await authRequest(
        { method: 'GET', url: '/labels' },
        validCredentials,
      );
      expect(list.payload).toContain(labelsData.updated.name);
    });

    it('POST /labels/:id with _method=patch invalid should re-render edit form', async () => {
      const { id } = labelsData.existing;
      const res = await authRequest(
        {
          method: 'POST',
          url: `/labels/${id}`,
          payload: { _method: 'patch', data: { name: '' } },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toMatch(/<div[^>]+alert-danger/);
    });
  });
});
