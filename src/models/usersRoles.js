module.exports = (sequelize, DataTypes) => {
  const UsersRoles = sequelize.define(
    'UsersRoles',
    {
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: {
          model: sequelize.User,
          key: 'id'
        }
      },
      roleId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: {
          model: sequelize.Role,
          key: 'id'
        }
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      underscored: true,
      tableName: 'users_roles',
      createdAt: 'created',
      updatedAt: false
    }
  );

  UsersRoles.associate = function (models) {
    this.belongsTo(models.User, { foreignKey: 'UserId' });
    this.belongsTo(models.Role, { foreignKey: 'RoleId' });
  };

  return UsersRoles;
};
