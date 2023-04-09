import { randomUUID } from 'crypto';
import { QueryInterface } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const userId = randomUUID();
    const moderatorId = randomUUID();
    const adminId = randomUUID();
    await queryInterface.bulkInsert('role', [
      {
        id: userId,
        title: 'USER',
        description: 'Basic Access',
      },
      {
        id: moderatorId,
        title: 'MODERATOR',
        description: 'Advanced Access',
      },
      {
        id: adminId,
        title: 'ADMIN',
        description: 'Full Access',
      },
    ]);
    return
  },

  async down(queryInterface: QueryInterface): Promise<object | number> {
    return await queryInterface.bulkDelete('role', null, {});
  },
};
