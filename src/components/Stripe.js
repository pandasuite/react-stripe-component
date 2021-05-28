import React from 'react';
import PropTypes from 'prop-types';

import PandaBridge from 'pandasuite-bridge';

import Configuration from './Configuration';
import usePrevious from '../hooks/usePrevious';

function Stripe(props) {
  const {
    properties, setProperty,
  } = props;
  const prevSubscription = usePrevious(properties.subscription);

  if (!PandaBridge.isStudio) {
    return null;
  }

  if (prevSubscription !== undefined && prevSubscription !== properties.subscription) {
    setProperty('data', '[]');
  }

  return (
    <Configuration
      properties={properties}
      setProperty={setProperty}
    />
  );
}

Stripe.defaultProps = {
  setProperty: () => null,
};

Stripe.propTypes = {
  properties: PropTypes.oneOfType([PropTypes.object]).isRequired,
  setProperty: PropTypes.func,
};

export default Stripe;
