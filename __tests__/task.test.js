import {
  buildServer,
  makeRequest,
  makeAuthRequest,
  clearUsers,
  insertUser,
  clearLabels,
  insertLabel,
  clearStatuses,
  insertStatus,
  clearTasks,
  insertTask,
} from './helpers/utils.js';
import tasksData from '../__fixtures__/tasks.json';
import statusesData from '../__fixtures__/statuses.json';
import labelsData from '../__fixtures__/labels.json';
import usersFixture from '../__fixtures__/users.json';

const validCredentials = usersFixture.session.valid;
const testUser = usersFixture.users.existing;

describe('Task Management Routes', () => {
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
    await clearLabels(server);
    await insertLabel(server, labelsData.existing);
    await clearTasks(server);
    await insertTask(server, tasksData.existing);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Access control', () => {
    it('GET /tasks without auth should redirect to main', async () => {
      const res = await request({ method: 'GET', url: '/tasks' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('GET /tasks/new without auth should redirect to main', async () => {
      const res = await request({ method: 'GET', url: '/tasks/new' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('GET /tasks/1 without auth should redirect to main', async () => {
      const res = await request({ method: 'GET', url: '/tasks/1' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('GET /tasks/1/edit without auth should redirect to main', async () => {
      const res = await request({ method: 'GET', url: '/tasks/1/edit' });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/');
    });
  });

  describe('Task CRUD (authenticated)', () => {
    it('GET /tasks should return list of tasks', async () => {
      const res = await authRequest(
        { method: 'GET', url: '/tasks' },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain(tasksData.existing.name);
    });

    it('GET /tasks/new should show creation form', async () => {
      const res = await authRequest(
        { method: 'GET', url: '/tasks/new' },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain('<form');
    });

    it('POST /tasks with valid data should create task and redirect', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/tasks',
          payload: { data: tasksData.new },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/tasks');

      const list = await authRequest(
        { method: 'GET', url: '/tasks' },
        validCredentials,
      );
      expect(list.payload).toContain(tasksData.new.name);
    });

    it('POST /tasks with invalid data should re-render form with errors', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/tasks',
          payload: { data: { name: '', description: '' } },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toMatch(/<div[^>]+alert-danger/);
    });

    it('GET /tasks/1/edit should show edit form with existing data', async () => {
      const res = await authRequest(
        { method: 'GET', url: '/tasks/1/edit' },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain(`value="${tasksData.existing.name}"`);
    });

    it('POST /tasks/1 with _method=patch should update and redirect', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/tasks/1',
          payload: { _method: 'patch', data: tasksData.updated },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/tasks');

      const list = await authRequest(
        { method: 'GET', url: '/tasks' },
        validCredentials,
      );
      expect(list.payload).toContain(tasksData.updated.name);
    });

    it('DELETE /tasks/1 via _method=delete should remove and redirect', async () => {
      const res = await authRequest(
        {
          method: 'POST',
          url: '/tasks/1',
          payload: { _method: 'delete' },
        },
        validCredentials,
      );
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/tasks');
    });

    it('should return no tasks when status does not match', async () => {
      const fakeStatusId = 'non-existent';
      const res = await authRequest(
        { method: 'GET', url: `/tasks?status=${fakeStatusId}` },
        validCredentials,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).not.toContain(tasksData.existing.name);
    });
  });
});
