import { listRoutes } from '../endpoints';

export const removeListById = async (request, list_id, headers) => {
  return await request.delete(listRoutes.delete(list_id)).set(headers);
};
