import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { Items } from '../items';

export const ListsHead = new Mongo.Collection('listshead');
export const ListsBody = new Mongo.Collection('listsbody');

// https://docs.meteor.com/api/collections.html#Mongo-Cursor-observeChanges
// keep track of added or removed body items on special lists

// NOT IDEAL! Can be quite CPU heavy and is also run on server startup - not good!

// const serverEnv = process.env.SERVER_ENV;
// if(Meteor.isServer && (serverEnv == 'dev' || serverEnv == 'prod1' || serverEnv == 'test')) { // only one prod, no workers
//   const specialListBodyItemsCursor = ListsBody.find({ list_special: { $in: ['whitelist', 'blacklist'] } });
//   specialListBodyItemsCursor.observe({
//     added(doc) {
//       if(Meteor.isDevelopment) console.log('specialListBodyItemsCursor added()', doc);
//       ListsHead.update({ _id: doc.list_id }, { $set: { updated_at: new Date() } }, err => { if(err) console.error(err) });
//     },
//     removed(doc) {
//       if(Meteor.isDevelopment) console.log('specialListBodyItemsCursor removed()', doc);
//       ListsHead.update({ _id: doc.list_id }, { $set: { updated_at: new Date() } }, err => { if(err) console.error(err) });
//     }
//   });
// }

if (Meteor.isServer) {
  Meteor.startup(() => {
    ListsHead._ensureIndex({
      'groupIds': 1,
      'supplier_id': 1,
      'special': 1
    });
    ListsBody._ensureIndex({
      '_id': 1,
      'list_id': 1,
      'itemId': 1
    });
    ListsBody._ensureIndex({
      "list_id": 1,
      "row_id": 1,
      "item_amount": 1,
      "unit": 1,
      "itemId": 1
    });
  });
}

ListsHead.schema = new SimpleSchema({
  name: {
    type: String,
    label: "List Name",
    min: 1,
    max: 99,
    optional: true
  },
  user_id: {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  // delete later!
  buyer_id: {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  groupIds: {
    type: Array,
    optional: true
  },
  'groupIds.$': {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  supplier_id: {
    type: String,
    min: 17,
    max: 17
  },
  categories: { // this is used to define whole categories in lists for this supplier - e.g. whitelist or blacklist
    type: Array,
    optional: true
  },
  'categories.$': {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  item_count: {
    type: Number,
    label: "Item count",
    optional: true
  },
  datetime: {
    type: Date,
    label: "datetime"
  },
  updated_at: {
    type: Date,
    optional: true
  },
  intelligent: {
    type: Boolean,
    optional: true
  },
  // settings
  supplierDraft: {
    type: Boolean,
    optional: true
  },
  editable: {
    type: Boolean,
    optional: true
  },
  deleteable: {
    type: Boolean,
    optional: true
  },
  special: {
    type: String,
    optional: true
  },
  linked: { // == true for whitelists and blacklists
    type: Boolean,
    optional: true
  },
  hidden: {
    type: Boolean,
    defaultValue: false,
    optional: true
  }
});

ListsHead.attachSchema(ListsHead.schema);

ListsBody.schema = new SimpleSchema({
  list_id: {
    type: String,
    label: "List Id",
    min: 17,
    max: 17
  },
  row_id: {
    type: Number,
    label: "Row Id",
    optional: true
  },
  itemId: {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  unit: {
    type: String,
    optional: true
  }
});

ListsBody.attachSchema(ListsBody.schema);

if (Meteor.isServer) {

  ListsHead.allow({
    'update': allowListsHeadEdit,
    'insert': allowListsHeadEdit,
    'remove': allowListsHeadEdit
  });

  function allowListsHeadEdit(userId, list, fields, modifier) {
    return true
  }

  ListsBody.allow({
    'update': allowListsBodyEdit,
    'insert': allowListsBodyEdit,
    'remove': allowListsBodyEdit
  });

  function allowListsBodyEdit(userId, listItem, fields, modifier) {
    return true
  }

}