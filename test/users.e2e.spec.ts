import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';

import request from './lib/supertest';
import { usersRoutes, authRoutes } from './endpoints';
import {
  getTokenWithUserId,
  getAdminToken,
  shouldBeAdmin,
  removeUserByAdmin,
  shouldBeUser,
  shouldBeModerator,
  getModeratorToken,
} from './utils';

const createUserDto = {
  username: 'USER_TEST_USER',
  password: 'PASS_TEST_PASS',
};

const randomUUID = '2e07434d-54db-4b7f-a1a6-61641d0e0798';

describe('Users (e2e)', () => {
  const req = request;
  const headers = { Accept: 'application/json' };
  const headersAdmin = { Accept: 'application/json' };
  let createdUserIds = [];
  let mockUserId: string | undefined;

  beforeAll(async () => {
    if (shouldBeAdmin) {
      const result = await getAdminToken(req);
      headers['Authorization'] = result.token;
      headersAdmin['Authorization'] = result.token;
    } else if (shouldBeModerator) {
      const result = await getModeratorToken(req);
      headers['Authorization'] = result.token;
    } else if (shouldBeUser) {
      const result = await getTokenWithUserId(req);
      headers['Authorization'] = result.token;
      mockUserId = result.mockUserId;
    }
  });

  afterAll(async () => {
    if (mockUserId) {
      await removeUserByAdmin(req, mockUserId, headersAdmin);
    }
    if (headers['Authorization']) {
      delete headers['Authorization'];
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
    it('should get all users correctly if the request is sent by the admin or moderator', async () => {
      const getResponse = await req.get(usersRoutes.getAll).set(headers);
      expect([StatusCodes.OK, StatusCodes.FORBIDDEN]).toContain(
        getResponse.statusCode
      );
      if (getResponse.statusCode === StatusCodes.OK)
        expect(getResponse.body).toBeInstanceOf(Array);
      else if (getResponse.statusCode === StatusCodes.FORBIDDEN)
        expect(getResponse.body).toBeInstanceOf(Object);
    });

    it('should respond with FORBIDDEN status code if the JWTtoken is invalid or the request is sent by a user', async () => {
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
        req.get(usersRoutes.getAll).set(temporaryHeaders),
        req.get(usersRoutes.getAll).set({}),
      ]);

      expect(
        getResponses.every(
          (response) => response.statusCode === StatusCodes.FORBIDDEN
        )
      );
    });

    it('should get user by id correctly if the request is sent by the admin or moderator', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = signUpResponse.body;

      createdUserIds.push(id);

      const getResponse = await req.get(usersRoutes.getById(id)).set(headers);

      expect([StatusCodes.OK, StatusCodes.FORBIDDEN]).toContain(
        getResponse.statusCode
      );
      expect(getResponse.body).toBeInstanceOf(Object);
    });

    it('should respond with BAD_REQUEST or FORBIDDEN status code if id is invalid or the request is sent by a user', async () => {
      const getResponse = await req
        .get(usersRoutes.getById('this-id-is-invalid'))
        .set(headers);
      expect([StatusCodes.BAD_REQUEST, StatusCodes.FORBIDDEN]).toContain(
        getResponse.statusCode
      );
    });

    it('should respond with NOT_FOUND or FORBIDDEN status code if the user does not exist or the request is sent by a user', async () => {
      const getResponse = await req
        .get(usersRoutes.getById(randomUUID))
        .set(headers);
      expect([StatusCodes.NOT_FOUND, StatusCodes.FORBIDDEN]).toContain(
        getResponse.statusCode
      );
    });

    it('should respond with FORBIDDEN status code if the JWTtoken is invalid or the request is sent by a user', async () => {
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
        req.get(usersRoutes.getById(id)).set(temporaryHeaders),
        req.get(usersRoutes.getById(id)).set({}),
      ]);

      expect(
        getResponses.every(
          (response) => response.statusCode === StatusCodes.FORBIDDEN
        )
      );
    });
  });

  describe('PUT', () => {
    it('should update user role correctly if the request is sent by the admin', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const {
        id: signUpId,
        username: signUpUsername,
        role_id: signUpRoleId,
        password: signUpPassword,
      } = signUpResponse.body;

      createdUserIds.push(signUpId);

      const updateResponse = await req
        .put(usersRoutes.update(signUpId))
        .set(headers)
        .send({ title: 'MODERATOR' });

      expect([StatusCodes.OK, StatusCodes.FORBIDDEN]).toContain(
        updateResponse.statusCode
      );

      if (updateResponse.statusCode === StatusCodes.OK) {
        const {
          id,
          username,
          password,
          tasks_quantity,
          createdAt,
          updatedAt,
          role_id: updatedRoleId,
        } = updateResponse.body;

        expect(validate(id)).toBe(true);
        expect(username).toBe(signUpUsername);
        expect(password).toBe(signUpPassword);
        expect(tasks_quantity).toBe(0);
        expect(typeof createdAt).toBe('string');
        expect(typeof updatedAt).toBe('string');
        expect(signUpRoleId !== updatedRoleId).toBe(true);

        const updateResponseTheSame = await req
          .put(usersRoutes.update(id))
          .set(headers)
          .send({ title: 'MODERATOR' });

        expect(updateResponseTheSame.statusCode).toBe(StatusCodes.BAD_REQUEST);
      }
    });

    it('should respond with BAD_REQUEST or FORBIDDEN status code if id is invalid or the request is sent by a user', async () => {
      const updateResponse = await req
        .put(usersRoutes.update('this-id-is-invalid'))
        .set(headers)
        .send({ title: 'MODERATOR' });

      expect([StatusCodes.BAD_REQUEST, StatusCodes.FORBIDDEN]).toContain(
        updateResponse.statusCode
      );
    });

    it('should respond with BAD_REQUEST or FORBIDDEN status code if dto is invalid or the request is sent by a user', async () => {
      const updateResponses = await Promise.all([
        req.put(usersRoutes.update(randomUUID)).set(headers).send({}),
        req
          .put(usersRoutes.update(randomUUID))
          .set(headers)
          .send({ title: 'user' }),
        req
          .put(usersRoutes.update(randomUUID))
          .set(headers)
          .send({ title: 'US' }),
        req
          .put(usersRoutes.update(randomUUID))
          .set(headers)
          .send({ title: 'LOREMIPSUMLOREMIPSUM' }),
      ]);

      expect(
        updateResponses.every((response) =>
          [StatusCodes.BAD_REQUEST, StatusCodes.FORBIDDEN].includes(
            response.statusCode
          )
        )
      );
    });

    it('should respond with NOT_FOUND or FORBIDDEN status code if the user does not exist or the request is sent by a user', async () => {
      const updateResponse = await req
        .put(usersRoutes.update(randomUUID))
        .set(headers)
        .send({ title: 'MODERATOR' });

      expect([StatusCodes.NOT_FOUND, StatusCodes.FORBIDDEN]).toContain(
        updateResponse.statusCode
      );
    });

    it('should respond with BAD_REQUEST or FORBIDDEN status code if the role does not exist or the request is sent by a user', async () => {
      const updateResponse = await req
        .put(usersRoutes.update(randomUUID))
        .set(headers)
        .send({ title: 'OBSERVER' });

      expect([StatusCodes.BAD_REQUEST, StatusCodes.FORBIDDEN]).toContain(
        updateResponse.statusCode
      );
    });

    it('should respond with FORBIDDEN status code the JWTtoken is invalid or the request is sent by a user', async () => {
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
        req.put(usersRoutes.update(id)).set(temporaryHeaders),
        req.put(usersRoutes.update(id)).set({}),
      ]);

      expect(
        getResponses.every(
          (response) => response.statusCode === StatusCodes.FORBIDDEN
        )
      );
    });
  });

  describe('DELETE', () => {
    it('should delete user correctly if the request is sent by the admin', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = signUpResponse.body;

      const deleteResponse = await req
        .delete(usersRoutes.delete(id))
        .set(headers);

      expect([StatusCodes.OK, StatusCodes.FORBIDDEN]).toContain(
        deleteResponse.statusCode
      );

      if (deleteResponse.statusCode === StatusCodes.FORBIDDEN)
        removeUserByAdmin(req, id, headersAdmin);

      const getResponse = await req.get(usersRoutes.getById(id)).set(headers);

      expect([StatusCodes.NOT_FOUND, StatusCodes.FORBIDDEN]).toContain(
        getResponse.statusCode
      );
    });

    it('should respond with BAD_REQUEST or FORBIDDEN status code if id is invalid or the request is sent by a user or moderator', async () => {
      const getResponse = await req
        .delete(usersRoutes.delete('this-id-is-invalid'))
        .set(headers);
      expect([StatusCodes.BAD_REQUEST, StatusCodes.FORBIDDEN]).toContain(
        getResponse.statusCode
      );
    });

    it('should respond with NOT_FOUND or FORBIDDEN status code if the user does not exist or the request is sent by a user or moderator', async () => {
      const getResponse = await req
        .delete(usersRoutes.delete(randomUUID))
        .set(headers);
      expect([StatusCodes.NOT_FOUND, StatusCodes.FORBIDDEN]).toContain(
        getResponse.statusCode
      );
    });

    it('should respond with FORBIDDEN status code if the JWTtoken is invalid or the request is sent by a user or moderator', async () => {
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
        req.delete(usersRoutes.delete(id)).set(temporaryHeaders),
        req.delete(usersRoutes.delete(id)).set({}),
      ]);

      expect(
        getResponses.every(
          (response) => response.statusCode === StatusCodes.FORBIDDEN
        )
      );
    });
  });
});
