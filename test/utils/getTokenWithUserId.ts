import { authRoutes } from '../endpoints';

const createUserDto = {
  username: 'Test_username',
  password: 'Test_password',
};

export const getTokenWithUserId = async (request) => {
  const signUpResponse = await request
    .post(authRoutes.signup)
    .set('Accept', 'application/json')
    .send(createUserDto);

  const mockUserId = signUpResponse.body.id;

  const signInResponse = await request
    .post(authRoutes.signin)
    .set('Accept', 'application/json')
    .send(createUserDto);

  const token = `Bearer ${signInResponse.body.accessToken}`;

  return { token, mockUserId };
};
