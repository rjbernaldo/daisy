const keystone = require('keystone');
const Inquiry = keystone.List('Inquiry');
const { Types } = keystone.Field;
Inquiry.add({
  query: { type: String },
});
Inquiry.defaultColumns = 'query';
Inquiry.register();