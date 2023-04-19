import { QueryInterface } from 'sequelize';
import { DataType } from 'sequelize-typescript';

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('role', {
      id: {
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
      },

      title: { type: DataType.STRING, allowNull: false, unique: true },
      description: { type: DataType.STRING, allowNull: false, unique: false },
    });

    await queryInterface.createTable('user', {
      id: {
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: DataType.UUIDV4,
      },

      username: { type: DataType.STRING, allowNull: false, unique: true },
      password: { type: DataType.STRING, allowNull: false, unique: false },
      tasks_quantity: {
        type: DataType.INTEGER,
        unique: false,
        defaultValue: 0,
      },

      createdAt: {
        type: DataType.DATE,
        allowNull: false,
        get() {
          const date = this.getDataValue('createdAt');
          const formattedDate = new Date(date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          });
          return formattedDate;
        },
        defaultValue: DataType.NOW,
      },

      updatedAt: {
        type: DataType.DATE,
        allowNull: false,
        get() {
          const date = this.getDataValue('updateAt');
          const formattedDate = new Date(date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          });
          return formattedDate;
        },
        defaultValue: DataType.NOW,
      },

      role_id: {
        type: DataType.UUID,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('user', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'user_role_id_fkey',
      references: {
        table: 'role',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.createTable('list', {
      id: {
        type: DataType.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
      },

      title: { type: DataType.STRING, unique: false, allowNull: false },
      tasks_quantity: {
        type: DataType.INTEGER,
        unique: false,
        defaultValue: 0,
      },

      createdAt: {
        type: DataType.DATE,
        allowNull: false,
        get() {
          const date = this.getDataValue('createdAt');
          const formattedDate = new Date(date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          });
          return formattedDate;
        },
        defaultValue: DataType.NOW,
      },

      updatedAt: {
        type: DataType.DATE,
        allowNull: false,
        get() {
          const date = this.getDataValue('updateAt');
          const formattedDate = new Date(date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          });
          return formattedDate;
        },
        defaultValue: DataType.NOW,
      },

      user_id: {
        type: DataType.UUID,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('list', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'list_user_id_fkey',
      references: {
        table: 'user',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.createTable('task', {
      id: {
        type: DataType.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
      },

      title: { type: DataType.STRING, unique: false, allowNull: false },

      description: { type: DataType.TEXT, unique: false, allowNull: false },

      urgency: {
        type: DataType.STRING,
        unique: false,
        allowNull: false,
        defaultValue: 'LOW',
      },

      isDone: {
        type: DataType.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        type: DataType.DATE,
        allowNull: false,
        get() {
          const date = this.getDataValue('createdAt');
          const formattedDate = new Date(date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          });
          return formattedDate;
        },
        defaultValue: DataType.NOW,
      },

      updatedAt: {
        type: DataType.DATE,
        allowNull: false,
        get() {
          const date = this.getDataValue('updateAt');
          const formattedDate = new Date(date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          });
          return formattedDate;
        },
        defaultValue: DataType.NOW,
      },

      list_id: {
        type: DataType.UUID,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('task', {
      fields: ['list_id'],
      type: 'foreign key',
      name: 'task_list_id_fkey',
      references: {
        table: 'list',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeConstraint('task', 'task_list_id_fkey');
    await queryInterface.dropTable('task');
    await queryInterface.removeConstraint('list', 'list_user_id_fkey');
    await queryInterface.dropTable('list');
    await queryInterface.removeConstraint('user', 'user_role_id_fkey');
    await queryInterface.dropTable('user');
    await queryInterface.dropTable('role');
  },
};
