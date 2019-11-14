import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Runtimes = new Mongo.Collection('runtimes');

export const Settings = new Mongo.Collection('settings');

export const Privacy = new Mongo.Collection('privacy');

export const InboxAddresses = new Mongo.Collection('inboxaddresses');

export const Logs = new Mongo.Collection('logs');

export const Invites = new Mongo.Collection('invites');

export const Cache = new Mongo.Collection('cache');

export const Progress = new Mongo.Collection('progress');

Privacy.schema = new SimpleSchema({
  type: String,
  createdUserId: String,
  createdUsername: String,
  creatingUserId: String,
  creatingUsername: String,
  date: Date,
  meta: {
    type: Object,
    optional: true,
    blackbox: true
  }
});
Privacy.attachSchema(Privacy.schema);

InboxAddresses.schema = new SimpleSchema({
  buyerId: {
    type: String,
    min: 17,
    max: 17
  },
  supplierId: {
    type: String,
    min: 17,
    max: 17
  },
  address: {
    type: String,
    optional: true
  },
  active: {
    type: Boolean,
    defaultValue: false
  }
});
InboxAddresses.attachSchema(InboxAddresses.schema);

Logs.schema = new SimpleSchema({
  type: String,
  affectedUser: String,
  executedBy: String,
  date: Date,
  meta: {
    type: Object,
    optional: true,
    blackbox: true
  },
  log: {
    type: Object,
    optional: true,
    blackbox: true
  }
});
Logs.attachSchema(Logs.schema);

Invites.schema = new SimpleSchema({
  code: String,
  groupId: String,
  createdAt: Date,
  createdBy: String,
  sentAt: { type: Date, optional: true },
  method: { type: String, optional: true },
  accepted: { type: Boolean, defaultValue: false },
  acceptedAt: { type: Date, optional: true },
  acceptedBy: { type: String, optional: true }
});
Invites.attachSchema(Invites.schema);

if(Meteor.isServer) {
  Meteor.startup(() => {
    Cache._ensureIndex({
      '_id': 1,
      'key': 1,
      'type': 1,
      'meta': 1
    });
    Progress._ensureIndex({
      'jobId': 1,
      'userId': 1
    });
  });
}

export const myCache = {
  put(match, val) {
    if(!match.meta) {
      match.meta = { $exists: false };
    }
    return Cache.upsert(match, { $set: { value: val, date: new Date() } });
  },
  get(match) {
    if(!match.meta) {
      match.meta = { $exists: false };
    }
    return Cache.findOne(match);
  },
  del(match) {
    if(!match.meta) {
      match.meta = { $exists: false };
    }
    return Cache.remove(match);
  },
  delAll(match) {
    if(match.key && typeof match.key == 'string') {
      match.key = new RegExp(`^${match.key}.*`,'ig');
    }
    return Cache.remove(match);
  }
}