const keystone = require('keystone');

keystone.init({
  name: 'daisy',
  mongo: 'mongodb://localhost/daisy',
  port: 3000,
  'cookie secret': 'secret',
  'user model': 'User',
  session: true,
  auth: true,
  'auto update': true,
});

keystone.import('models');

keystone.set('routes', require('./routes'))

keystone.set('nav', {
  user: 'User',
});

keystone.start();