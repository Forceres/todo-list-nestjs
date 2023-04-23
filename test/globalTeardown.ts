import { req, mockUserId } from './setupTest';
import { getAdminToken, removeUserByAdmin } from './utils';

const signOut = async () => {
  console.log(mockUserId);
  if (mockUserId) {
    const headersAdmin = { Accept: 'application/json ' };
    const result = await getAdminToken(req);
    headersAdmin['Authorization'] = result.token;
    await removeUserByAdmin(req, mockUserId, headersAdmin);
  }
  console.log('I have finished my task!');
};

export default async function globalTeardown() {
  console.log('Started');
  await signOut();
}
