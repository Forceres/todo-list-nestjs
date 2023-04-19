import { authRoutes } from '../endpoints';

const loginModeratorDto = {
  username: 'Moderator',
  password: 'moderator',
};

export const getModeratorToken = async (request) => {
  const signInResponse = await request
    .post(authRoutes.signin)
    .set('Accept', 'application/json')
    .send(loginModeratorDto);

  const token = `Bearer ${signInResponse.body.accessToken}`;

  return { token };
};
