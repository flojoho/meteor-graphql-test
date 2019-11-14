import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


export const Items = new Mongo.Collection('items');

if(Meteor.isServer) {
  Meteor.startup(() => {
    // for finding exact items via ref and units.alias
    Items.rawCollection().createIndex({
      '_id': 1,
      'supplier_id': 1,
      'item_ref': 1,
      'item_name': 1,
      'units.alias': 1
    }, {
      background: true,
      name: 'itemsImportIndex'
    });
    // for finding items in cat
    Items.rawCollection().createIndex({
      '_id': 1,
      'supplier_id': 1,
      'categoryIds': 1,
      'item_ref': 1,
      'item_name': 1,
      'meta.ftx.acl': 1,
      'meta.promo': 1
    }, {
      background: true
    });
    // for image matching - https://stackoverflow.com/questions/42329806/mongodb-query-to-slow-when-using-or-operator
    Items.rawCollection().createIndex({
      'supplier_id': 1,
      'item_ref': 1,
    }, {
      background: true,
      name: 'itemsImageMatchingIndex1'
    });
    Items.rawCollection().createIndex({
      'supplier_id': 1,
      'ean': 1,
    }, {
      background: true,
      name: 'itemsImageMatchingIndex2'
    });
    Items.rawCollection().createIndex({
      'supplier_id': 1,
      'units.ean': 1
    }, {
      background: true,
      name: 'itemsImageMatchingIndex3'
    });
    Items.rawCollection().createIndex({
      'supplier_id': 1,
      'image_name': 1
    }, {
      background: true,
      name: 'itemsImageMatchingIndex4'
    });
  });
}

Items.schema = new SimpleSchema({
  supplier_id: {
    type: String,
    label: "Supplier Id",
    min: 17,
    max: 17
  },
  groupIds: {
    type: Array,
    optional: true
  },
  'groupIds.$': {
    type: String,
    optional: true
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
  image_id: {
    type: String,
    label: "Standard Image Id",
    optional: true,
    min: 17,
    max: 17
  },
  image_url: {
    type: String,
    label: "Image Url",
    optional: true
  },
  image_name: {
    type: String,
    optional: true
  },
  created_at: {
    type: Date,
    optional: true
  },
  updated_at: {
    type: Date,
    optional: true
  },
  units: {
    type: Array,
    optional: true,
    blackbox: true
  },
  'units.$': {
    type: Object,
    optional: true,
    blackbox: true
  },
  unit: {
    type: Object,
    optional: true,
    blackbox: true
  },
  categoryId: {
    type: String,
    optional: true
  },
  categoryIds: {
    type: Array,
    optional: true
  },
  'categoryIds.$': {
    type: String,
    optional: true
  },
  // group: {
  //   type: Object,
  //   defaultValue: {},
  //   optional: true,
  //   blackbox: true
  // },
  group: SimpleSchema.oneOf({
    type: Object,
    optional: true,
    blackbox: true
  }, {
    type: String,
    optional: true
  }),
  meta: {
    type: Object,
    defaultValue: {},
    optional: true,
    blackbox: true
  },
  just_updated: {
    type: Boolean,
    optional: true
  },
  just_reset_units: {
    type: Boolean,
    optional: true
  }
});

Items.attachSchema(Items.schema);