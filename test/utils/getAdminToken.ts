import { authRoutes } from '../endpoints';

const loginAdminDto = {
  username: 'Administrator',
  password: 'administrator',
};

export const getAdminToken = async (request) => {
  const signInResponse = await request
    .post(authRoutes.signin)
    .set('Accept', 'application/json')
    .send(loginAdminDto);

  const token = `Bearer ${signInResponse.body.accessToken}`;

  return { token };
};
