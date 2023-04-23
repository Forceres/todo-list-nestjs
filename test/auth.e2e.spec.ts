import { JwtService } from '@nestjs/jwt';
import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';
import { compare } from 'bcrypt';

import request from './lib/supertest';
import { authRoutes } from './endpoints';
import {
  getToken,
  getAdminToken,
  shouldBeAdmin,
  removeUserByAdmin,
  shouldBeModerator,
  getModeratorToken,
  shouldBeUser,
} from './utils';

import { SECRET_KEY, SECRET_REFRESH_KEY } from '../src/environments/env';

const createUserDto = {
  username: 'test_user_3',
  password: 'TEST_PASS_PASS',
};

describe('Auth (e2e)', () => {
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
    it('should return the account info', async () => {
      const getResponse = await req.get(authRoutes.profile).set(headers);
      expect(getResponse.statusCode).toBe(StatusCodes.OK);
      expect(getResponse.body).toBeInstanceOf(Object);
    });

    it('should respond with UNAUTHORIZED if the JWTtoken is invalid', async () => {
      const getResponse = await req.get(authRoutes.profile).set({});
      expect(getResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('POST', () => {
    it('should create user (signUp) correctly', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const {
        id,
        username,
        password,
        tasks_quantity,
        createdAt,
        updatedAt,
        role,
      } = signUpResponse.body;

      createdUserIds.push(id);

      const passwordMatch = await compare(createUserDto.password, password);

      expect(validate(id)).toBe(true);
      expect(username === createUserDto.username).toBe(true);
      expect(passwordMatch).toBe(true);
      expect(tasks_quantity).toBe(0);
      expect(typeof createdAt).toBe('string');
      expect(typeof updatedAt).toBe('string');
      expect(role === null).toBe(false);
    });

    it('should respond with BAD_REQUEST if the required data is invalid', async () => {
      const signUpResponses = await Promise.all([
        req.post(authRoutes.signup).set(headers).send({}),
        req.post(authRoutes.signup).set(headers).send({ username: 'username' }),
        req.post(authRoutes.signup).set(headers).send({ password: 'password' }),
        req
          .post(authRoutes.signup)
          .set(headers)
          .send({ username: null, password: 'qwerty' }),
      ]);

      expect(
        signUpResponses.every(
          (response) => response.statusCode === StatusCodes.BAD_REQUEST
        )
      );
    });

    it('should respond with BAD_REQUEST status code if the user with this username already exists', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id } = signUpResponse.body;

      createdUserIds.push(id);

      const signUpSecondResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpSecondResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return accessToken and RefreshToken (signIn) correctly', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id, username, role_id } = signUpResponse.body;
      createdUserIds.push(id);

      const signInResponse = await req
        .post(authRoutes.signin)
        .set(headers)
        .send(createUserDto);

      expect(signInResponse.statusCode).toBe(StatusCodes.CREATED);

      const { accessToken, refreshToken } = signInResponse.body;
      const jwt = new JwtService();
      const jwtPayload = await jwt.verifyAsync(accessToken, {
        secret: SECRET_KEY,
      });
      const refreshPayload = await jwt.verifyAsync(refreshToken, {
        secret: SECRET_REFRESH_KEY,
      });

      expect(id === jwtPayload.id).toBe(true);
      expect(id === refreshPayload.id).toBe(true);
      expect(username === jwtPayload.username).toBe(true);
      expect(username === refreshPayload.username).toBe(true);
      expect(role_id === jwtPayload.role.id).toBe(true);
      expect(role_id === refreshPayload.role.id).toBe(true);
    });

    it('should respond with UNAUTHORIZED if the password is incorrect', async () => {
      const signInResponse = await req
        .post(authRoutes.signin)
        .set(headers)
        .send({ username: 'JustUser', password: 'this-is-invalid' });
      expect(signInResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should respond with BAD_REQUEST if the required data (username) is invalid', async () => {
      const signInResponses = await Promise.all([
        req.post(authRoutes.signin).set(headers).send({}),
        req.post(authRoutes.signin).set(headers).send({ username: 'username' }),
        req.post(authRoutes.signin).set(headers).send({ password: 'password' }),
        req
          .post(authRoutes.signin)
          .set(headers)
          .send({ username: null, password: 'qwerty' }),
      ]);
      expect(
        signInResponses.every(
          (response) => response.statusCode === StatusCodes.NOT_FOUND
        )
      );
    });

    it('should update accessToken by unexpired refreshToken correctly', async () => {
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

      const { refreshToken } = signInResponse.body;

      const refreshResponse = await req
        .post(authRoutes.refresh)
        .set(headers)
        .send({ refreshToken: refreshToken });

      expect(refreshResponse.statusCode).toBe(StatusCodes.CREATED);
      expect(refreshResponse.body).toBeInstanceOf(Object);
    });

    it('should respond with UNAUTHORIZED status code if there is no refresh token', async () => {
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

      const { refreshToken } = signInResponse.body;

      const tokenResponses = await Promise.all([
        req.post(authRoutes.refresh).set(headers).send({}),
        req.post(authRoutes.refresh).set(headers).send(refreshToken),
      ]);
      expect(
        tokenResponses.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with FORBIDDEN status code if the refresh token is invalid', async () => {
      const signUpResponse = await req
        .post(authRoutes.signup)
        .set(headers)
        .send(createUserDto);

      expect(signUpResponse.statusCode).toBe(StatusCodes.CREATED);

      const { id, username } = signUpResponse.body;
      createdUserIds.push(id);

      const wrongSecret = 'secretKey';
      const jwt = new JwtService();
      const tokenWrongSecret = await jwt.signAsync(
        { id: 'this-is-invalid', username: 'invalid-username' },
        {
          secret: wrongSecret,
          expiresIn: '1s',
        }
      );
      const tokenRightSecret = await jwt.signAsync(
        { id: 'this-is-invalid', username: 'invalid-username' },
        {
          secret: SECRET_REFRESH_KEY,
          expiresIn: '1s',
        }
      );
      const tokenRightSecretWithRightId = await jwt.signAsync(
        {
          id: id,
          username: username,
        },
        { secret: SECRET_REFRESH_KEY, expiresIn: '1s' }
      );
      const tokenWrongSecretWithRightId = await jwt.signAsync(
        { id: id, username: username },
        { secret: wrongSecret, expiresIn: '100s' }
      );
      const tokenRightSecretWrongIdUnexpired = await jwt.signAsync(
        { id: id, username: username },
        { secret: SECRET_REFRESH_KEY, expiresIn: '100s' }
      );
      const tokenResponses = await Promise.all([
        req
          .post(authRoutes.refresh)
          .set(headers)
          .send({ refreshToken: 'this-is-invalid' }),
        req
          .post(authRoutes.refresh)
          .set(headers)
          .send({ refreshToken: tokenRightSecret }),
        req
          .post(authRoutes.refresh)
          .set(headers)
          .send({ refreshToken: tokenWrongSecret }),
        req
          .post(authRoutes.refresh)
          .set(headers)
          .send({ refreshToken: tokenRightSecretWithRightId }),
        req
          .post(authRoutes.refresh)
          .set(headers)
          .send({ refreshToken: tokenWrongSecretWithRightId }),
        req
          .post(authRoutes.refresh)
          .set(headers)
          .send({ refreshToken: tokenRightSecretWrongIdUnexpired }),
      ]);

      expect(
        tokenResponses.every(
          (response) => response.statusCode === StatusCodes.FORBIDDEN
        )
      );
    });
  });

  describe('PUT', () => {
    it('should update the account password correctly', async () => {
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

      const { accessToken } = signInResponse.body;
      expect(signInResponse.statusCode).toBe(StatusCodes.CREATED);

      const temporaryHeaders = { Accept: 'application/json' };
      temporaryHeaders['Authorization'] = `Bearer ${accessToken}`;

      const updateResponse = await req
        .put(authRoutes.update)
        .set(temporaryHeaders)
        .send({ password: 'password' });

      expect(updateResponse.statusCode).toBe(StatusCodes.OK);
      expect(updateResponse.body).toBeInstanceOf(Object);
    });

    it('should respond with UNAUTHORIZED if the JWTtoken is invalid', async () => {
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

      const { accessToken } = signInResponse.body;
      expect(signInResponse.statusCode).toBe(StatusCodes.CREATED);

      const temporaryHeaders = { Accept: 'application/json' };
      temporaryHeaders['Authorization'] = `Bearer ${accessToken}`;

      const wrongJwt =
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const updateResponse = await Promise.all([
        req
          .put(authRoutes.update)
          .set({
            Accept: 'application/json',
            Authorization: wrongJwt,
          })
          .send({ password: 'password' }),
        req.put(authRoutes.update).set({}).send({ password: 'password' }),
        req
          .put(authRoutes.update)
          .set(temporaryHeaders)
          .send({ password: createUserDto.password }),
      ]);
      expect(
        updateResponse.every(
          (response) => response.statusCode === StatusCodes.UNAUTHORIZED
        )
      );
    });

    it('should respond with BAD_REQUEST if the required data is invalid', async () => {
      const updateResponses = await Promise.all([
        req.put(authRoutes.update).set(headers).send({ password: null }),
        req.put(authRoutes.update).set(headers).send({}),
        req.put(authRoutes.update).set(headers).send({ password: 'qwerty' }),
        req.put(authRoutes.update).set(headers).send({
          password:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac magna eu elit dignissim bibendum a sit amet enim. Maecenas ultricies, velit at hendrerit ultrices, velit sapien pharetra nisl, sed posuere velit odio sit amet turpis.',
        }),
      ]);
      expect(
        updateResponses.every(
          (response) => response.statusCode === StatusCodes.BAD_REQUEST
        )
      );
    });
  });
});
