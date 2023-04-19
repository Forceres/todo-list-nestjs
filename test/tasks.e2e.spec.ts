import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';

import request from './lib/supertest';
import { authRoutes, listRoutes, tasksRoutes } from './endpoints';
import {
  getTokenWithUserId,
  getAdminToken,
  shouldBeAdmin,
  removeUserByAdmin,
  shouldBeUser,
  shouldBeModerator,
  getModeratorToken,
  removeListById,
  removeTaskById,
} from './utils';

const createListDto = {
  title: 'LIST_TEST_TEST',
};

const createTaskDto = {
  title: 'TASK_TEST_TEST',
  description: 'TEST SHORT DESCRIPTION',
};

const updateTaskDto = {
  title: 'task_test_test',
  description: 'test short description',
};

const randomUUID = '2e07434d-54db-4b7f-a1a6-61641d0e0798';

describe('Tasks (e2e)', () => {
  const req = request;
  const headers = { Accept: 'application/json' };
  const headersAdmin = { Accept: 'application/json' };
  let createdListIds = [];
  let createdTaskIds = [];
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
    if (createdTaskIds.length > 0) {
      const deletePromises = createdTaskIds.map((id) =>
        removeTaskById(req, id, headers)
      );
      await Promise.all(deletePromises);
      createdTaskIds = [];
    }
    if (createdListIds.length > 0) {
      const deletePromises = createdListIds.map((id) =>
        removeListById(req, id, headers)
      );
      await Promise.all(deletePromises);
      createdListIds = [];
    }
  });

  describe('GET', () => {
    it('should return all tasks of the specific list, which is connected with the authorized account correctly', async () => {
      const createListResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createListResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = createListResponse.body;

      createdListIds.push(id);

      const getResponse = await req.get(tasksRoutes.getAll(id)).set(headers);

      expect(getResponse.statusCode).toBe(StatusCodes.OK);
      expect(getResponse.body).toBeInstanceOf(Array);
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const getResponses = await Promise.all([
        req.get(tasksRoutes.getAll(randomUUID)).set({}),
        req.get(tasksRoutes.getAll(randomUUID)).set({
          Accept: 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
        }),
      ]);
      expect(
        getResponses.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with NOT_FOUND status code if the list does not exist', async () => {
      const getResponse = await req
        .get(tasksRoutes.getAll(randomUUID))
        .set(headers);

      expect(getResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code if the list_id is invalid', async () => {
      const getResponse = await req.get(tasksRoutes.getAll(null)).set(headers);
      expect(getResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return the specific task by its id correctly if the authorized account has this task', async () => {
      const createListResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createListResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = createListResponse.body;

      createdListIds.push(id);

      const createTaskResponse = await req
        .post(tasksRoutes.create(id))
        .set(headers)
        .send(createTaskDto);

      expect(createTaskResponse.statusCode).toBe(StatusCodes.CREATED);
      expect(createTaskResponse.body).toBeInstanceOf(Object);

      const { id: task_id } = createTaskResponse.body;

      createdTaskIds.push(task_id);

      const getResponse = await req
        .get(tasksRoutes.getById(task_id))
        .set(headers);

      expect(getResponse.statusCode).toBe(StatusCodes.OK);
      expect(getResponse.body).toBeInstanceOf(Object);
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const getResponses = await Promise.all([
        req.get(tasksRoutes.getById(randomUUID)).set({}),
        req.get(tasksRoutes.getById(randomUUID)).set({
          Accept: 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
        }),
      ]);
      expect(
        getResponses.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with NOT_FOUND status code if the task does not exist', async () => {
      const getResponse = await req
        .get(tasksRoutes.getById(randomUUID))
        .set(headers);

      expect(getResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code if the task_id is invalid', async () => {
      const getResponse = await req.get(tasksRoutes.getById(null)).set(headers);
      expect(getResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('POST', () => {
    it(`should create a task with the bond to the authorized user's list correctly`, async () => {
      const createListResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createListResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = createListResponse.body;

      createdListIds.push(id);

      const createTaskResponse = await req
        .post(tasksRoutes.create(id))
        .set(headers)
        .send(createTaskDto);

      expect(createTaskResponse.statusCode).toBe(StatusCodes.CREATED);
      expect(createTaskResponse.body).toBeInstanceOf(Object);

      const {
        id: task_id,
        title,
        description,
        urgency,
        createdAt,
        updatedAt,
        isDone,
        list_id,
      } = createTaskResponse.body;

      createdTaskIds.push(task_id);

      expect(validate(task_id)).toBe(true);
      expect(title === createTaskDto.title);
      expect(description === createTaskDto.description);
      expect(urgency === 'LOW').toBe(true);
      expect(typeof createdAt).toBe('string');
      expect(typeof updatedAt).toBe('string');
      expect(isDone).toBe(false);
      expect(list_id === id).toBe(true);

      const createSecondTaskResponse = await req
        .post(tasksRoutes.create(id))
        .set(headers)
        .send({ ...createTaskDto, urgency: 'HIGH' });

      expect(createSecondTaskResponse.statusCode).toBe(StatusCodes.CREATED);
      expect(createSecondTaskResponse.body).toBeInstanceOf(Object);

      const { urgency: secondUrgency, id: secondId } =
        createSecondTaskResponse.body;

      createdTaskIds.push(secondId);

      expect(secondUrgency === 'HIGH').toBe(true);

      const userProfileResponse = await req
        .get(authRoutes.profile)
        .set(headers);

      expect(userProfileResponse.statusCode).toBe(StatusCodes.OK);

      const { tasks_quantity: user_tasks_quantity, list } =
        userProfileResponse.body;

      const currentList = await list.find((val) => val.id === id);

      expect(currentList.tasks_quantity === 2).toBe(true);
      expect(user_tasks_quantity === 2).toBe(true);
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const createResponse = await Promise.all([
        req.post(tasksRoutes.create(randomUUID)).set({}).send(createTaskDto),
        req
          .post(tasksRoutes.create(randomUUID))
          .set({
            Accept: 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
          })
          .send(createTaskDto),
      ]);

      expect(
        createResponse.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with NOT_FOUND status code if the list does not exist', async () => {
      const createResponse = await req
        .post(tasksRoutes.create(randomUUID))
        .set(headers)
        .send(createTaskDto);

      expect(createResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code if the required data is invalid', async () => {
      const createResponses = await Promise.all([
        req.post(tasksRoutes.create(randomUUID)).set(headers).send({}),
        req
          .post(tasksRoutes.create(randomUUID))
          .set(headers)
          .send({ title: 'test-title-test' }),
        req.post(tasksRoutes.create(randomUUID)).set(headers).send({
          title: null,
          description: 'test-description-test-description',
        }),
        req
          .post(tasksRoutes.create(randomUUID))
          .set(headers)
          .send({ title: 'test-title-test', description: null }),
        req
          .post(tasksRoutes.create(randomUUID))
          .set(headers)
          .send({ description: 'test-description-test-description' }),
        req.post(tasksRoutes.create(randomUUID)).set(headers).send({
          title: 'test-title-test',
          description: 'test-description-test-description',
          urgency: 'high',
        }),
        req.post(tasksRoutes.create(randomUUID)).set(headers).send({
          title: 'test-title-test',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas at diam at mauris vestibulum maximus. Suspendisse tristique est eget ex commodo, vitae facilisis nisi convallis. Sed id enim sed erat commodo malesuada. Nulla malesuada velit et sapien dignissim faucibus. Integer venenatis commodo mauris, eget pulvinar risus interdum sed. Donec dictum mauris felis, ac suscipit leo vestibulum sed. Proin eu tellus eu ex scelerisque commodo at in velit. Suspendisse ac ipsum tristique, fermentum libero in, sagittis magna. Sed vitae nulla commodo, vehicula velit eget, suscipit ex. Sed commodo in ante vitae vestibulum. Sed dapibus viverra elit a pretium. Maecenas commodo elit ac rutrum malesuada. Phasellus ullamcorper aliquam turpis, id congue metus vestibulum eu. Sed vehicula, lectus ut blandit aliquam, lorem sapien semper justo, eu bibendum urna dolor vel felis. Praesent euismod rutrum augue, ac malesuada elit faucibus eu. Nam blandit pulvinar lacus, non pellentesque odio vestibulum id. Integer congue, lectus in tempus bibendum, tortor neque feugiat sapien, vel rhoncus nibh nibh ac massa. Ut at ipsum justo. Suspendisse auctor tortor vel risus pulvinar laoreet. Donec dictum convallis neque, vel imperdiet leo tincidunt vel. Etiam convallis ante vitae arcu euismod lobortis. Aliquam lobortis, odio id eleifend vehicula, augue ipsum finibus justo, vel posuere enim nisi in orci. Suspendisse aliquam, libero eget convallis placerat, lorem arcu euismod justo, a iaculis magna nunc vel tortor. Nam et ipsum justo.',
        }),
        req
          .post(tasksRoutes.create(randomUUID))
          .set(headers)
          .send({ title: 'test-title-test', description: 'q' }),
        req.post(tasksRoutes.create(randomUUID)).set(headers).send({
          title: 'q',
          description: 'test-description-test-description',
        }),
        req.post(tasksRoutes.create(randomUUID)).set(headers).send({
          title: 'test-task-test-task-test-task',
          description: 'test-description-test-description',
        }),
        req.post(tasksRoutes.create(randomUUID)).set(headers).send({
          title: 'test-title-test',
          description: 'test-description-test-description',
          urgency: null,
        }),
        req.post(tasksRoutes.create(randomUUID)).set(headers).send({
          title: 'test-title-test',
          description: 'test-description-test-description',
          urgency: 'HIGHERHIGHER',
        }),
        req.post(tasksRoutes.create(null)).set(headers).send(createTaskDto),
      ]);

      expect(
        createResponses.every(
          (response) => response.statusCode === StatusCodes.BAD_REQUEST
        )
      );
    });
  });

  describe('PUT', () => {
    it('should update the task details correctly, the task is connected with the authorized account', async () => {
      const createListResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createListResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = createListResponse.body;

      createdListIds.push(id);

      const createTaskResponse = await req
        .post(tasksRoutes.create(id))
        .set(headers)
        .send(createTaskDto);

      expect(createTaskResponse.statusCode).toBe(StatusCodes.CREATED);
      expect(createTaskResponse.body).toBeInstanceOf(Object);

      const { id: task_id } = createTaskResponse.body;

      createdTaskIds.push(task_id);

      const updateResponse = await req
        .put(tasksRoutes.update(task_id))
        .set(headers)
        .send(updateTaskDto);

      expect(updateResponse.statusCode).toBe(StatusCodes.OK);
      expect(updateResponse.body).toBeInstanceOf(Object);

      const { title, description } = updateResponse.body;

      expect(title === updateTaskDto.title).toBe(true);
      expect(description === updateTaskDto.description).toBe(true);

      const updateSecondResponse = await req
        .put(tasksRoutes.update(task_id))
        .set(headers)
        .send({ ...updateTaskDto, urgency: 'HIGH' });

      expect(updateSecondResponse.statusCode).toBe(StatusCodes.OK);

      const { urgency } = updateSecondResponse.body;

      expect(urgency === 'HIGH').toBe(true);

      const updateThirdResponse = await req
        .put(tasksRoutes.update(task_id))
        .set(headers)
        .send({ ...updateTaskDto, isDone: true });

      expect(updateThirdResponse.statusCode).toBe(StatusCodes.OK);

      const { isDone } = updateThirdResponse.body;

      expect(isDone).toBe(true);

      const updateFourthResponse = await req
        .put(tasksRoutes.update(task_id))
        .set(headers)
        .send({ ...updateTaskDto, urgency: 'HIGH', isDone: true });

      expect(updateFourthResponse.statusCode).toBe(StatusCodes.OK);

      const { urgency: urg, isDone: isD } = updateThirdResponse.body;

      expect(isD).toBe(true);
      expect(urg === 'HIGH').toBe(true);
    });

    it('should respond with BAD_REQUEST status code if the required data is invalid', async () => {
      const updateResponses = await Promise.all([
        req.put(tasksRoutes.update(randomUUID)).set(headers).send({}),
        req.put(tasksRoutes.update(randomUUID)).set(headers).send({
          title: null,
          description: 'test-description-test-description',
        }),
        req
          .put(tasksRoutes.update(randomUUID))
          .set(headers)
          .send({ title: 'test-title-test', description: null }),
        req.put(tasksRoutes.update(randomUUID)).set(headers).send({
          title: 'test-title-test',
          description: 'test-description-test-description',
          urgency: null,
        }),
        req.put(tasksRoutes.update(randomUUID)).set(headers).send({
          title: 'test-title-test',
          description: 'test-description-test-description',
          urgency: 'HIGH',
          isDone: '12345',
        }),
        req.put(tasksRoutes.update(randomUUID)).set(headers).send({
          title: null,
          description: null,
          urgency: null,
          isDone: null,
        }),
        req.put(tasksRoutes.create(null)).set(headers).send(createTaskDto),
      ]);

      expect(
        updateResponses.every(
          (response) => response.statusCode === StatusCodes.BAD_REQUEST
        )
      );
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const updateResponse = await Promise.all([
        req.put(tasksRoutes.update(randomUUID)).set({}).send(updateTaskDto),
        req
          .put(tasksRoutes.update(randomUUID))
          .set({
            Accept: 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
          })
          .send(updateTaskDto),
      ]);

      expect(
        updateResponse.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with NOT_FOUND status code if the task does not exist', async () => {
      const updateResponse = await req
        .put(tasksRoutes.update(randomUUID))
        .set(headers)
        .send(updateTaskDto);

      expect(updateResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('DELETE', () => {
    it('should delete the task of the authorized account by its id correctly', async () => {
      const createListResponse = await req
        .post(listRoutes.create)
        .set(headers)
        .send(createListDto);

      expect(createListResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = createListResponse.body;

      createdListIds.push(id);

      const createTaskResponse = await req
        .post(tasksRoutes.create(id))
        .set(headers)
        .send(createTaskDto);

      expect(createTaskResponse.statusCode).toBe(StatusCodes.CREATED);
      expect(createTaskResponse.body).toBeInstanceOf(Object);

      const { id: task_id } = createTaskResponse.body;

      const deleteResponse = await req
        .delete(tasksRoutes.delete(task_id))
        .set(headers);

      expect(deleteResponse.statusCode).toBe(StatusCodes.OK);

      const getResponse = await req
        .get(tasksRoutes.getById(task_id))
        .set(headers);

      expect(getResponse.statusCode).toBe(StatusCodes.NOT_FOUND);

      const userProfileResponse = await req
        .get(authRoutes.profile)
        .set(headers);

      expect(userProfileResponse.statusCode).toBe(StatusCodes.OK);

      const { tasks_quantity: user_tasks_quantity, list } =
        userProfileResponse.body;

      const currentList = await list.find((val) => val.id === id);

      expect(currentList.tasks_quantity === 0).toBe(true);
      expect(user_tasks_quantity === 0).toBe(true);
    });

    it('should respond with UNAUTHORIZED status code if the JWTtoken is invalid', async () => {
      const deleteResponses = await Promise.all([
        req.delete(tasksRoutes.delete(randomUUID)).set({}),
        req.delete(tasksRoutes.delete(randomUUID)).set({
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

    it('should respond with NOT_FOUND status code if the task does not exist', async () => {
      const deleteResponse = await req
        .delete(tasksRoutes.delete(randomUUID))
        .set(headers);

      expect(deleteResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should respond with BAD_REQUEST status code if the task_id is invalid', async () => {
      const deleteResponse = await req
        .delete(tasksRoutes.delete(null))
        .set(headers);
      expect(deleteResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });
});
