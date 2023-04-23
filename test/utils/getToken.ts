import { authRoutes } from '../endpoints';

const createUserDto = {
  username: 'Test_username',
  password: 'Test_password',
};

export const getToken = async (request) => {
  const signInResponse = await request
    .post(authRoutes.signin)
    .set('Accept', 'application/json')
    .send(createUserDto);

  const token = `Bearer ${signInResponse.body.accessToken}`;

  return { token };
};
