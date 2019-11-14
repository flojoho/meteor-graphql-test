import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Messages = new Mongo.Collection('messages');

if(Meteor.isServer) {
  Meteor.startup(() => {
    Messages._ensureIndex({
      _id: 1,
      groupId: 1,
      chatId: 1,
      userId: 1,
      datetime: 1
    });
  });
}

Messages.schema = new SimpleSchema({
  groupId: {
    type: String,
    optional: true
  },
  chatId: {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  userId: {
    type: String,
    min: 17,
    max: 17
  },
  datetime: {
    type: Date
  },
  type: {
    type: String,
    defaultValue: 'text'
  },
  orderId: {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  content: {
    type: SimpleSchema.oneOf(String, Object),
    defaultValue: '',
    optional: true
  }
});

Messages.attachSchema(Messages.schema);

// Messages.allow({
//   'update': allowPriceGroupEdit,
//   'insert': allowPriceGroupEdit
// });

// function allowPriceGroupEdit(userId, doc, fieldNames, modifier) {
//   if(Roles.userIsInRole(userId, 'admin') || supplierId == userId) {
//     return true;
//   } else {
//     return false;
//   }
// }