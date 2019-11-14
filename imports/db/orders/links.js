import { OrdersHead, OrdersBody } from './index';
import { Items } from '../items';

OrdersBody.addLinks({
  'currentItem': {
    type: 'one',
    collection: Items,
    field: 'item',
    metadata: true
  }
})
