// https://stackoverflow.com/questions/37200080/how-to-export-imported-object-in-es6
// https://github.com/cult-of-coders/grapher-boilerplate

import './links';

import { Items } from './items';
import { ListsHead, ListsBody } from './lists';
import { OpenOrdersHead, OpenOrdersBody } from './openorders';
import { OrdersHead, OrdersBody } from './orders';
import { Images } from './images';
import { Groups } from './groups';
import { UserFiles } from './userfiles';
import { Categories } from './categories';
import { Prices } from './prices';
import { PriceGroups } from './pricegroups';
import { Messages } from './messages';
import { InventoryHead, InventoryBody, InventoryItems, InventoryStorages } from './inventories'; 
import { Runtimes, Privacy, Settings, InboxAddresses, Logs, Cache, myCache, Progress, Invites } from './other';
import './users';
import { UserCategories } from './users';

export {
  Items,
  ListsHead,
  ListsBody,
  OpenOrdersHead,
  OpenOrdersBody,
  OrdersHead,
  OrdersBody,
  Images,
  Groups,
  UserFiles,
  Categories,
  Prices,
  PriceGroups,
  Runtimes,
  Privacy,
  Settings,
  InboxAddresses,
  Logs,
  Cache,
  myCache,
  Progress,
  InventoryHead,
  InventoryBody,
  InventoryItems,
  InventoryStorages,
  UserCategories,
  Invites,
  Messages
}

export const Bodies = {
  openorder: OpenOrdersBody,
  list: ListsBody,
  order: OrdersBody,
  items: Items
}

export const Heads = {
  openorder: OpenOrdersHead,
  list: ListsHead,
  order: OrdersHead
}

export function getPricesFilter({ filters, options, params }) {
  let group = params.group;
  if (!group && params.groupId) group = Groups.findOne({ _id: params.groupId });
  if (!group) return filters;
  // filters.$or = [{ groupId: { $exists: false }, priceGroupId: { $exists: false } }, { groupId: group._id }];
  filters.$or = [{ groupId: { $exists: false }, priceGroupId: { $exists: false }, userId: { $exists: false } }, { groupId: group._id }];
  if (group.priceGroupId) {
    filters.$or.push({ priceGroupId: group.priceGroupId });
  }
  // console.log('FILTERS', JSON.stringify(filters, false, 2));
  return filters;
}