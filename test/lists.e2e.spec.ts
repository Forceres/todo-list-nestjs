import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';

import request from './lib/supertest';
import { listRoutes } from './endpoints';
import {
  getTokenWithUserId,
  getAdminToken,
  shouldBeAdmin,
  removeUserByAdmin,
  shouldBeUser,
  shouldBeModerator,
  getModeratorToken,
  removeListById,
} from './utils';

const createListDto = {
  title: 'LIST_TEST_LIST',
};

const randomUUID = '2e07434d-54db-4b7f-a1a6-61641d0e0798';

describe('Lists (e2e)', () => {
  const req = request;
  const headers = { Accept: 'application/json' };
  const headersAdmin = { Accept: 'application/json' };
  let createdListIds = [];
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
    if (createdListIds.length > 0) {
      const deletePromises = createdListIds.map((id) =>
        removeListById(req, id, headers)
      );
      await Promise.all(deletePromises);
      createdListIds = [];
    }
  });

  describe('GET', () => {
    it('should return all lists of the authorized account correctly', async () => {
      const getResponse = await req.get(listRoutes.getAll).set(headers);
      expect(getResponse.statusCode).toBe(StatusCodes.OK);
      expect(getResponse.body).toBeInstanceOf(Array);
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const getResponse = await req.get(listRoutes.getAll).set({});
      expect(getResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(getResponse.body).toBeInstanceOf(Object);
    });

    it('should return the list by the id correctly', async () => {
      const createResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = createResponse.body;

      createdListIds.push(id);

      const getResponse = await req.get(listRoutes.getById(id)).set(headers);

      expect(getResponse.statusCode).toBe(StatusCodes.OK);
      expect(getResponse.body).toBeInstanceOf(Object);
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const getResponse = await Promise.all([
        req.get(listRoutes.getById(randomUUID)).set({}),
        req.get(listRoutes.getById(randomUUID)).set({
          Accept: 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
        }),
      ]);

      expect(
        getResponse.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with NOT_FOUND status code if the list is not found', async () => {
      const getResponse = await req
        .get(listRoutes.getById(randomUUID))
        .set(headers);
      expect(getResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code if the id is invalid', async () => {
      const getResponse = await req.get(listRoutes.getById(null)).set(headers);
      expect(getResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('POST', () => {
    it('should create list with the bond to the authorized account correctly', async () => {
      const createResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createResponse.statusCode).toBe(StatusCodes.CREATED);
      expect(createResponse.body).toBeInstanceOf(Object);

      const {
        id,
        title: createdTitle,
        user_id: createdUsedId,
        createdAt,
        updatedAt,
        tasks_quantity,
      } = createResponse.body;

      createdListIds.push(id);

      expect(validate(id)).toBe(true);
      expect(createdTitle === createListDto.title).toBe(true);
      expect(createdUsedId === null).toBe(false);
      expect(tasks_quantity).toBe(0);
      expect(typeof createdAt).toBe('string');
      expect(typeof updatedAt).toBe('string');
      expect(createdAt === updatedAt).toBe(true);
    });

    it('should respond with BAD_REQUEST if the required data is invalid', async () => {
      const createResponses = await Promise.all([
        req.post(listRoutes.create).set(headers).send({}),
        req.post(listRoutes.create).set(headers).send({ title: null }),
        req.post(listRoutes.create).set(headers).send({ title: '12345' }),
        req
          .post(listRoutes.create)
          .set(headers)
          .send({ title: 'qwerty123456qwerty123456qwerty123456qwerty' }),
      ]);

      expect(
        createResponses.every(
          (response) => response.statusCode === StatusCodes.BAD_REQUEST
        )
      );
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const createResponses = await Promise.all([
        req.post(listRoutes.create).set({}).send(createListDto),
        req.post(listRoutes.create).set({
          Accept: 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
        }),
      ]);

      expect(
        createResponses.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });
  });

  describe('PUT', () => {
    it('should update the title of the list by list_id correctly', async () => {
      const createResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id, user_id: createdUserId } = createResponse.body;

      createdListIds.push(id);

      const updateResponse = await req
        .put(listRoutes.update(id))
        .set(headers)
        .send({ title: 'test-title-test' });

      expect(updateResponse.statusCode).toBe(StatusCodes.OK);
      expect(updateResponse.body).toBeInstanceOf(Object);

      const {
        id: updatedId,
        title,
        updatedAt,
        createdAt,
        user_id,
      } = updateResponse.body;

      expect(updatedId === id).toBe(true);
      expect(title === 'test-title-test').toBe(true);
      expect(typeof updatedAt).toBe('string');
      expect(typeof createdAt).toBe('string');
      expect(user_id === createdUserId).toBe(true);
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const updateResponses = await Promise.all([
        req
          .put(listRoutes.update(randomUUID))
          .set({})
          .send({ title: 'test-list-test' }),
        req.put(listRoutes.update(randomUUID)).set({
          Accept: 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
        }),
      ]);

      expect(
        updateResponses.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with BAD_REQUEST if the required data is invalid', async () => {
      const updateResponses = await Promise.all([
        req
          .put(listRoutes.update(randomUUID))
          .set(headers)
          .send({ title: null }),
        req.put(listRoutes.update(randomUUID)).set(headers).send({}),
        req
          .put(listRoutes.update(randomUUID))
          .set(headers)
          .send({ title: 'qwerty' }),
        req
          .put(listRoutes.update(randomUUID))
          .set(headers)
          .send({ title: 'qwerty123456qwerty123456qwerty123456qwerty' }),
        req
          .put(listRoutes.update(null))
          .set(headers)
          .send({ title: 'test-title-test' }),
      ]);

      expect(
        updateResponses.every(
          (response) => response.statusCode === StatusCodes.BAD_REQUEST
        )
      );
    });

    it('should respond with NOT_FOUND status code if the list is not found', async () => {
      const updateResponse = await req
        .put(listRoutes.update(randomUUID))
        .set(headers)
        .send({ title: 'test-list-test' });

      expect(updateResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE', () => {
    it('should delete the list of the authorized account by the list_id correctly', async () => {
      const createResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = createResponse.body;

      const deleteResponse = await req
        .delete(listRoutes.delete(id))
        .set(headers);

      expect(deleteResponse.statusCode).toBe(StatusCodes.OK);

      const getResponse = await req.get(listRoutes.getById(id)).set(headers);

      expect(getResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const deleteResponses = await Promise.all([
        req.delete(listRoutes.delete(randomUUID)).set({}),
        req.delete(listRoutes.delete(randomUUID)).set({
          Accept: 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
        }),
      ]);

      expect(
        deleteResponses.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with NOT_FOUND status code if there is no such list in the authorized account', async () => {
      const deleteResponse = await req
        .delete(listRoutes.delete(randomUUID))
        .set(headers);
      expect(deleteResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code if the id is invalid', async () => {
      const deleteResponse = await req
        .delete(listRoutes.delete(null))
        .set(headers);
      expect(deleteResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });
});
