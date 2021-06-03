import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import PandaBridge from 'pandasuite-bridge';
import { Button, Alert } from 'pandasuite-bridge-react/lib/ui';
import safeParse from '../utils/safeParse';

const renderPrice = (intl, price) => {
  let str = intl.formatNumber(price.unit_amount / 100, { style: 'currency', currency: price.currency });
  const { recurring } = price;

  if (recurring) {
    if (recurring.interval_count === 1) {
      str += ' / ';
    } else {
      str += ` ${intl.formatMessage({ id: 'format.price.every' })} ${recurring.interval_count}`;
    }
    str += ` ${intl.formatMessage({ id: `format.price.${recurring.interval}` })}`;
  }
  return str;
};

function Configuration(props) {
  const intl = useIntl();
  const [state, setState] = useState({
    loading: false,
    error: false,
  });
  const {
    properties, setProperty,
  } = props;
  const {
    [PandaBridge.UNIQUE_ID]: unitId,
    [PandaBridge.PANDASUITE_HOST_WITH_SCHEME]: host,
    data,
  } = properties;
  const mode = properties.subscription ? 'subscription' : 'payment';

  const doRequest = () => {
    setState({ loading: true });

    fetch(`${host}mo/stripe/${unitId}/prices/${mode}`).then(async (response) => {
      if (response.ok) {
        const body = await response.text();
        setProperty('data', body);
        setState({ loading: false });
      } else if (response.status === '401') {
        setState({ loading: false, error: intl.formatMessage({ id: 'request.error.401' }) });
      } else {
        setState({ loading: false, error: intl.formatMessage({ id: 'request.error.generic' }) });
      }
    }).catch(() => {
      setState({ loading: false, error: intl.formatMessage({ id: 'request.error.generic' }) });
    });
  };

  const parsed = safeParse(data);

  return (
    <>
      <Button className="my-5" loading={state.loading} onClick={doRequest}>
        {intl.formatMessage({ id: 'request.button.title' })}
      </Button>
      {state.error && (
        <Alert className="mb-5" type="danger">{state.error}</Alert>
      )}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {intl.formatMessage({ id: 'response.column.product' })}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {intl.formatMessage({ id: 'response.column.price' })}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {intl.formatMessage({ id: 'response.column.id' })}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsed.map((price) => (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded" src={price.product.images[0]} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {price.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {price.product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {renderPrice(intl, price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {price.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Configuration.defaultProps = {
  setProperty: () => null,
};

Configuration.propTypes = {
  properties: PropTypes.oneOfType([PropTypes.object]).isRequired,
  setProperty: PropTypes.func,
};

export default Configuration;
