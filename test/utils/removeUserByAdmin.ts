import { usersRoutes } from '../endpoints';

export const removeUserByAdmin = async (request, user_id, headers) => {
  return await request.delete(usersRoutes.delete(user_id)).set(headers);
};
