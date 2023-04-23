import { shouldBeUser } from './utils';
import request from './lib/supertest';
import { signUpUser } from './utils/signUpUser';

let mockUserId: string | undefined;
const req = request;

const signUp = async () => {
  if (shouldBeUser) {
    const result = await signUpUser(req);
    mockUserId = result.mockUserId;
    return mockUserId;
  }
};

export default async function globalSetup() {
  mockUserId = await signUp();
}

export { mockUserId, req };
