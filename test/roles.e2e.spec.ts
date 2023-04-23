import { StatusCodes } from 'http-status-codes';

import request from './lib/supertest';
import { authRoutes, rolesRoutes } from './endpoints';
import {
  getToken,
  getAdminToken,
  shouldBeAdmin,
  removeUserByAdmin,
  shouldBeModerator,
  getModeratorToken,
  shouldBeUser,
} from './utils';

const createUserDto = {
  username: 'test_user_2',
  password: 'Test_PASS_TEST',
};

describe('Roles (e2e)', () => {
  const req = request;
  const headers = { Accept: 'application/json' };
  const headersAdmin = { Accept: 'application/json' };
  let createdUserIds = [];

  beforeAll(async () => {
    if (shouldBeAdmin) {
      const result = await getAdminToken(req);
      headers['Authorization'] = result.token;
      headersAdmin['Authorization'] = result.token;
    } else if (shouldBeModerator) {
      const result = await getModeratorToken(req);
      headers['Authorization'] = result.token;
    } else if (shouldBeUser) {
      const result = await getToken(req);
      headers['Authorization'] = result.token;
    }
  });

  afterAll(async () => {
    if (headers['Authorization']) {
      delete headers['Authorization'];
    }
    if (headersAdmin['Authorization']) {
      delete headersAdmin['Authorization'];
    }
  });

  afterEach(async () => {
    if (!headersAdmin.hasOwnProperty('Authorization')) {
      const result = await getAdminToken(req);
      headersAdmin['Authorization'] = result.token;
    }
    if (createdUserIds.length > 0) {
      const deletePromises = createdUserIds.map((id) =>
        removeUserByAdmin(req, id, headersAdmin)
      );
      await Promise.all(deletePromises);
      createdUserIds = [];
    }
  });

  describe('GET', () => {
    it('should return the role by its title correctly if the request is sent by the admin or moderator', async () => {
      const getResponses = await Promise.all([
        req.get(rolesRoutes.getByTitle('USER')).set(headers),
        req.get(rolesRoutes.getByTitle('MODERATOR')).set(headers),
        req.get(rolesRoutes.getByTitle('ADMIN')).set(headers),
      ]);
      expect(
        getResponses.every((response) =>
          [StatusCodes.OK, StatusCodes.FORBIDDEN].includes(response.statusCode)
        )
      );
      expect(
        getResponses.every((response) => typeof response.body === 'object')
      );
    });

    it('should respond with NOT_FOUND or FORBIDDEN status code if the provided role does not exist or the request is sent by a user', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = signUpResponse.body;

      createdUserIds.push(id);

      const signInResponse = await req
        .post(authRoutes.signin)
        .set(headers)
        .send(createUserDto);

      expect(signInResponse.statusCode).toBe(StatusCodes.CREATED);

      const { accessToken } = signInResponse.body;
      const temporaryHeaders = {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const getResponses = await Promise.all([
        req.get(rolesRoutes.getByTitle('Kalinin')).set(headers),
        req.get(rolesRoutes.getByTitle('USER')).set(temporaryHeaders),
      ]);

      expect(
        getResponses.every((response) =>
          [StatusCodes.NOT_FOUND, StatusCodes.FORBIDDEN].includes(
            response.statusCode
          )
        )
      );
    });

    it('should respond with UNAUTHORIZED or FORBIDDEN status code if the JWTtoken is invalid or the request is sent by a user', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = signUpResponse.body;

      createdUserIds.push(id);

      const signInResponse = await req
        .post(authRoutes.signin)
        .set(headers)
        .send(createUserDto);

      expect(signInResponse.statusCode).toBe(StatusCodes.CREATED);

      const { accessToken } = signInResponse.body;
      const temporaryHeaders = {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      const getResponses = await Promise.all([
        req.get(rolesRoutes.getByTitle('Kalinin')).set({}),
        req.get(rolesRoutes.getByTitle('USER')).set(temporaryHeaders),
      ]);

      expect(
        getResponses.every((response) =>
          [StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN].includes(
            response.statusCode
          )
        )
      );
    });
  });
});
