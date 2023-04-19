import * as supertest from 'supertest';
import { config } from 'dotenv';

config();

const host = `localhost:${process.env.PORT || 4000}`;
const _request = supertest(host);

export default _request;
