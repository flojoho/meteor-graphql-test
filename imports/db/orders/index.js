import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { Items } from '../items';

export const OrdersHead = new Mongo.Collection('ordershead');
export const OrdersBody = new Mongo.Collection('ordersbody');

if(Meteor.isServer) {
  Meteor.startup(() => {
    OrdersHead._ensureIndex({ 'supplier_id': 1 });
    OrdersHead._ensureIndex({ 'group_id': 1 });
    OrdersHead._ensureIndex({ 'supplier_id': 1, 'group_id': 1, 'num': -1 });
    OrdersHead._ensureIndex({ '_id': 1, 'datetime': 1 });
    OrdersBody._ensureIndex({ 'list_id': 1, 'datetime': 1 });
  });
}

OrdersHead.schema = new SimpleSchema({
  num: {
    type: Number,
    label: "num"
  },
  name: {
    type: String,
    label: "List Name"
  },
  edi_name: {
    type: String,
    optional: true
  },
  // delete later!
  buyer_id: {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  group_id: {
    type: String,
    min: 17,
    max: 17
  },
  user_id: {
    type: String,
    min: 17,
    max: 17
  },
  userIds: { // for saving all the userIds currently in this group
    type: Array,
    optional: true
  },
  'userIds.$': {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  supplier_id: {
    type: String,
    min: 17,
    max: 17,
  },
  datetime: {
    type: Date,
    label: "datetime"
  },
  delivery_method: {
    type: String,
    label: "Delivery method",
    optional: true
  },
  delivery_date: {
    type: Date,
    label: "Delivery date",
    optional: true
  },
  item_count: {
    type: Number,
    label: "Item count"
  },
  notes: {
    type: String,
    label: "Notes",
    optional: true,
    max: 1000
  },
  olx_downloads: {
    type: Number,
    label: "OLX Downloads",
    optional: true
  },
  canceled: {
    type: Boolean,
    defaultValue: false
  },
  source: {
    type: String,
    optional: true
  },
  meta: {
    type: Object,
    optional: true
  }
});

OrdersHead.attachSchema(OrdersHead.schema);

Items.orderSchema = new SimpleSchema({
  _id: {
    type: String,
    label: "_id",
    min: 17,
    max: 17
  },
  item_ref: {
    type: String,
    label: "Item Ref",
    max: 30
  },
  item_name: {
    type: String,
    label: "Item Name"
  },
  ean: {
    type: String,
    optional: true
  },
  price: {
    type: Number,
    optional: true
  },
  unit: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

OrdersBody.schema = new SimpleSchema({
  list_id: {
    type: String,
    label: "List Id",
    min: 17,
    max: 17
  },
  item_amount: {
    type: Number,
    label: "Item Amount",
    min: 0,
    max: 99999
  },
  row_id: {
    type: Number,
    label: "Row Id",
    optional: true
  },
  item: {
    type: Items.orderSchema
  },
  unit: {
    type: String,
    optional: true
  },
  single_price: {
    type: Number,
    optional: true
  },
  total_price: {
    type: Number,
    optional: true
  },
  datetime: {
    type: Date,
    optional: true
  }
});

OrdersBody.attachSchema(OrdersBody.schema);