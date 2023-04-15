import { QueryInterface } from 'sequelize';

import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';

import { CRYPT_SALT } from '../../environments/env';

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const userPassword = await hash('justuser', CRYPT_SALT);
    const moderatorPassword = await hash('moderator', CRYPT_SALT);
    const adminPassword = await hash('administrator', CRYPT_SALT);
    const userId = randomUUID();
    const moderatorId = randomUUID();
    const adminId = randomUUID();
    await queryInterface.bulkInsert('user', [
      {
        id: userId,
        username: 'JustUser',
        password: userPassword,
        tasks_quantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: moderatorId,
        username: 'Moderator',
        password: moderatorPassword,
        tasks_quantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: adminId,
        username: 'Administrator',
        password: adminPassword,
        tasks_quantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.sequelize.query(`
      UPDATE "user" SET role_id = (
        SELECT id FROM role WHERE title = 'ADMIN'
      ) WHERE username = 'Administrator';
    
      UPDATE "user" SET role_id = (
        SELECT id FROM role WHERE title = 'MODERATOR'
      ) WHERE username = 'Moderator';
    
      UPDATE "user" SET role_id = (
        SELECT id FROM role WHERE title = 'USER'
      ) WHERE username = 'JustUser';
    `);
    return;
  },

  async down(queryInterface: QueryInterface): Promise<object | number> {
    return await queryInterface.bulkDelete('user', null, {});
  },
};
