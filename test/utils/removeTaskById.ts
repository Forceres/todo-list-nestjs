import { tasksRoutes } from '../endpoints';

export const removeTaskById = async (request, task_id, headers) => {
  return await request.delete(tasksRoutes.delete(task_id)).set(headers);
};
