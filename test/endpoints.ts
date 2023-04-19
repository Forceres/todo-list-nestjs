export const authRoutes = {
  signup: `/auth/signup`,
  signin: `/auth/signin`,
  profile: `/auth/profile`,
  update: `/auth/update`,
  refresh: `/auth/refresh`,
};

export const rolesRoutes = {
  getByTitle: (title: string) => `/roles/${title}`,
};

export const usersRoutes = {
  getAll: '/users',
  getById: (id: string) => `/users/${id}`,
  update: (id: string) => `/users/${id}`,
  delete: (id: string) => `/users/${id}`,
};

export const listRoutes = {
  getAll: '/lists',
  getById: (id: string) => `/lists/${id}`,
  create: '/lists',
  update: (id: string) => `/lists/${id}`,
  delete: (id: string) => `/lists/${id}`,
};

export const tasksRoutes = {
  getAll: (list_id: string) => `/tasks/all/${list_id}`,
  getById: (id: string) => `/tasks/${id}`,
  create: (list_id: string) => `/tasks/${list_id}`,
  update: (id: string) => `/tasks/${id}`,
  delete: (id: string) => `/tasks/${id}`,
};
