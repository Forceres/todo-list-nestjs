import * as supertest from 'supertest';
import { config } from 'dotenv';

config();

const host = `localhost:${process.env.PORT}`;
const _request = supertest(host);

export default _request;
