/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import find from 'lodash/find';
import each from 'lodash/each';

import PandaBridge from 'pandasuite-bridge';
import { compact, map } from 'lodash';

export const updateByPriceId = (prices, priceId, quantity, type) => {
  if (prices) {
    const price = find(prices, { id: priceId });

    if (price) {
      if (type === 'inc') {
        price.quantity += quantity;
      } else if (type === 'dec') {
        price.quantity -= quantity;
      } else {
        price.quantity = quantity;
      }
    }
  }
  return prices;
};

export const updateAllPrices = (prices, quantity, type) => {
  if (prices) {
    each(prices, (price) => {
      if (price) {
        if (type === 'inc') {
          price.quantity += quantity;
        } else if (type === 'dec') {
          price.quantity -= quantity;
        } else {
          price.quantity = quantity;
        }
      }
    });
  }
  return prices;
};

export const checkoutPricesUrl = (uniqueId, properties = {}, prices, params) => {
  const {
    [PandaBridge.UNIQUE_ID]: unitId,
    [PandaBridge.PANDASUITE_HOST_WITH_SCHEME]: host,
  } = properties;
  const mode = properties.subscription ? 'subscription' : 'payment';

  if (prices) {
    const items = JSON.stringify(compact(map(prices, (price) => {
      if (price.quantity > 0) {
        return { price: price.id, quantity: price.quantity };
      }
      return null;
    })));

    let url = `${host}mo/stripe/${unitId}/checkout/${uniqueId}?mode=${mode}&line_items=${encodeURIComponent(items)}`;

    each(['customer', 'customer_email', 'submit_type', 'billing_address_collection'], (param) => {
      if (params[param]) {
        url += `&${param}=${params[param]}`;
      }
    });

    return url;
  }
  return null;
};
