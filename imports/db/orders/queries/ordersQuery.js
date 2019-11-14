import { OrdersBody } from '../index';
import { getPricesFilter } from '../../index';

export default OrdersBody.createQuery('ordersQuery', {
  $filter({filters, options, params}) {
    if(params.orderId) filters.list_id = params.orderId;
  },
  _id: 1,
  list_id: 1,
  row_id: 1,
  item_amount: 1,
  total_price: 1,
  unit: 1,
  currentItem: {
    supplier_id: 1,
    groupIds: 1,
    item_ref: 1,
    item_name: 1,
    categoryIds: 1,
    unit: 1,
    units: 1,
    price: 1,
    image_id: 1,
    image_url: 1,
    prices: {
      $filter(props) {
        filters = getPricesFilter(props);
      },
      itemId: 1,
      userId: 1,
      groupId: 1,
      priceInfo: 1,
      tag: 1
    },
    meta: 1,
    openOrderItems: {
      $filter({filters, options, params}) {
        if(params.currentOpenOrderId) filters.list_id = params.currentOpenOrderId;
      },
      _id: 1,
      item_amount: 1,
      unit: 1
    }
  },
  $options: {
    sort: { row_id: 1 }
  }
});