import React from 'react';
import socketIOClient from 'socket.io-client';
import fnv1a from '@sindresorhus/fnv1a';

import PandaBridge from 'pandasuite-bridge';
import { usePandaBridge } from 'pandasuite-bridge-react';

import Stripe from './components/Stripe';
import safeParse from './utils/safeParse';
import {
  checkoutPricesUrl, customerPortalUrl, updateAllPrices, updateByPriceId,
} from './utils/prices';

require('isomorphic-fetch');

let prices;
let customer;

const sendQueryable = () => {
  PandaBridge.send(PandaBridge.UPDATED, {
    queryable: {
      prices,
      customer,
    },
  });
};

const waitForSocket = (properties, uniqueId) => {
  const {
    [PandaBridge.PANDASUITE_HOST_WITH_SCHEME]: host,
  } = properties || {};

  const socket = socketIOClient(host, { path: '/mo/socket.io' });

  socket.on(fnv1a(uniqueId).toString(16), (data) => {
    const { name, body = {} } = data || {};

    if (name) {
      if (name === 'onSuccess') {
        customer = body;
        sendQueryable();
      }
      PandaBridge.send(name, [body]);
      socket.disconnect();
    }
  });
};

function App() {
  const { properties, setProperty, addActions } = usePandaBridge({});

  if (properties === undefined) {
    return null;
  }

  addActions({
    set: ({ price: priceId, quantity }) => {
      updateByPriceId(prices, priceId, quantity);
      sendQueryable();
    },
    increment: ({ price: priceId, quantity }) => {
      updateByPriceId(prices, priceId, quantity, 'inc');
      sendQueryable();
    },
    decrement: ({ price: priceId, quantity }) => {
      updateByPriceId(prices, priceId, quantity, 'dec');
      sendQueryable();
    },
    removeAll: () => {
      updateAllPrices(prices, 0);
      sendQueryable();
    },
    purchase: (params) => {
      const uniqueId = Math.random().toString(36).substring(2);
      const checkoutUrl = checkoutPricesUrl(uniqueId, properties, prices, params);

      if (checkoutUrl) {
        waitForSocket(properties, uniqueId);
        PandaBridge.openUrl(checkoutUrl);
      }
    },
    open: (params) => {
      const customerlUrl = customerPortalUrl(properties, params);

      if (customerlUrl) {
        PandaBridge.openUrl(customerlUrl);
      }
    },
  }, true);

  if (!prices) {
    const { data } = properties || {};
    prices = safeParse(data);
  }
  if (prices) {
    sendQueryable();
  }

  return (
    <Stripe
      properties={properties}
      setProperty={setProperty}
    />
  );
}

export default App;
