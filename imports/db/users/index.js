import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

// Meteor.users --> https://github.com/aldeed/meteor-collection2#attach-a-schema-to-meteorusers

export const UserCategories = new Mongo.Collection('usercategories');

if(Meteor.isServer) {
  Meteor.users.rawCollection().createIndex({
    '_id': 1,
    'updatedAt': 1
  });
  Meteor.users.allow({
    'update': allowUsersEdit,
    'insert': allowUsersEdit,
    'remove': allowUsersEdit
  });
  Meteor.users.deny({
    'update': denyUsersEdit,
    'insert': denyUsersEdit,
    'remove': denyUsersEdit
  });
  function allowUsersEdit(userId, doc, fields, modifier) {
    if(fields.indexOf('roles') !== -1) return false;
    if(fields.indexOf('internal') !== -1) return false;
    return doc._id === userId || Roles.userIsInRole(userId, 'admin') || false;
  }
  function denyUsersEdit(userId, doc, fields, modifier) {
    return fields.indexOf('roles') !== -1;
  }
  UserCategories.allow({
    'update': allowUserCategoriesEdit,
    'insert': allowUserCategoriesEdit,
    'remove': allowUserCategoriesEdit
  });
  function allowUserCategoriesEdit(userId, doc, fields, modifier) {
    return Roles.userIsInRole(userId, 'admin') || false;
  }
}

UserCategories.schema = new SimpleSchema({
  emoji: {
    type: String,
    optional: true
  },
  name: {
    type: String
  }
});

UserCategories.attachSchema(UserCategories.schema);