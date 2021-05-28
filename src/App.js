import React, { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import fnv1a from '@sindresorhus/fnv1a';

import PandaBridge from 'pandasuite-bridge';
import { usePandaBridge } from 'pandasuite-bridge-react';

import Stripe from './components/Stripe';
import safeParse from './utils/safeParse';
import { checkoutPricesUrl, updateAllPrices, updateByPriceId } from './utils/prices';

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

function App() {
  const { properties, setProperty, addActions } = usePandaBridge({});
  const {
    [PandaBridge.UNIQUE_ID]: unitId,
    [PandaBridge.PANDASUITE_HOST_WITH_SCHEME]: host,
  } = properties || {};

  useEffect(() => {
    let socket;

    if (unitId && host) {
      socket = socketIOClient(host, { path: '/mo/socket.io' });

      socket.on(fnv1a(unitId).toString(16), (data) => {
        const { name, body = {} } = data || {};

        if (name) {
          if (name === 'onSuccess') {
            customer = body;
            sendQueryable();
          }
          PandaBridge.send(name, [body]);
        }
      });
    }
    return () => socket && socket.disconnect();
  }, [unitId, host]);

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
      const checkoutUrl = checkoutPricesUrl(properties, prices, params);

      if (checkoutUrl) {
        PandaBridge.openUrl(checkoutUrl);
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
