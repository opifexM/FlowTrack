import {
  buildServer,
  makeRequest,
  makeAuthRequest,
  clearUsers,
  insertUser,
} from './helpers/utils.js';
import testData from '../__fixtures__/users.json';

describe('Main Page Route', () => {
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

  describe('Main page', () => {
    it('GET / should show main page for unauthenticated user', async () => {
      const res = await request({ method: 'GET', url: '/' });
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain('FlowTrack');
    });

    it('GET / should show main page for authenticated user', async () => {
      const res = await authRequest(
        {
          method: 'GET',
          url: '/',
        },
        testData.session.valid,
      );
      expect(res.statusCode).toBe(200);
      expect(res.payload).toContain('FlowTrack');
    });
  });
});
