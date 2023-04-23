import { req, mockUserId } from './setupTest';
import { getAdminToken, removeUserByAdmin } from './utils';

const signOut = async () => {
  if (mockUserId) {
    const headersAdmin = { Accept: 'application/json ' };
    const result = await getAdminToken(req);
    headersAdmin['Authorization'] = result.token;
    await removeUserByAdmin(req, mockUserId, headersAdmin);
  }
};

export default async function globalTeardown() {
  await signOut();
}
