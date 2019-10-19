const keystone = require('keystone');
const User = keystone.List('User');
const { Types } = keystone.Field;
User.add({
  displayName: { type: String, initial: true, required: true },
  email: { type: Types.Email, initial: true, required: true },
  password: { type: Types.Password, initial: true, required: true },
});
User.schema.virtual('canAccessKeystone').get(function () {
  return true;
});
User.defaultColumns = 'email, password';
User.register();