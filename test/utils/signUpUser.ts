import { authRoutes } from '../endpoints';

const createUserDto = {
  username: 'Test_username',
  password: 'Test_password',
};

export const signUpUser = async (request) => {
  const signUpResponse = await request
    .post(authRoutes.signup)
    .set('Accept', 'application/json')
    .send(createUserDto);

  const mockUserId = signUpResponse.body.id;

  return { mockUserId };
};
