import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const InventoryHead = new Mongo.Collection('inventoryhead');

export const InventoryBody = new Mongo.Collection('inventorybody');

export const InventoryStorages = new Mongo.Collection('inventorystorages');

// InventoryHead.schema = new SimpleSchema({
//   userId: {
//     type: String,
//     min: 17,
//     max: 17
//   }
// });

// InventoryHead.attachSchema(InventoryHead.schema);

// InventoryBody.schema = new SimpleSchema({
// });

// InventoryBody.attachSchema(InventoryBody.schema);

// InventoryItems.itemSchema = new SimpleSchema({
//   item_ref: {
//     type: String,
//     label: "Item Ref",
//     max: 30
//   },
//   item_name: {
//     type: String,
//     label: "Item Name"
//   },
//   price: {
//     type: Number,
//     optional: true
//   },
//   units: {
//     type: Array,
//     optional: true,
//     blackbox: true
//   },
//   'units.$': {
//     type: Object,
//     optional: true,
//     blackbox: true
//   }
// });

// InventoryItems.schema = new SimpleSchema({
//   userId: { // who owns this item
//     type: String,
//     min: 17,
//     max: 17
//   },
//   storageIds: { // maybe set - the _id's of the associated storage(s)
//     type: Array,
//     optional: true
//   },
//   'storageIds.$': {
//     type: String,
//     optional: true
//   },
//   itemId: { // usually set - the itemId of the actual item from the Items collection
//     type: String,
//     min: 17,
//     max: 17,
//     optional: true
//   },
//   item: { // OR: self created item
//     type: InventoryItems.itemSchema,
//     optional: true
//   },
//   inventoryAmount: { // most current amount of item in inventory
//     type: Number,
//     optional: true
//   }
// });