import React from 'react';
import { shallow } from 'enzyme';
import WatchAssetRequest from '.';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { backgroundState } from '../../../../../../util/test/initial-root-state';

const mockStore = configureMockStore();
const initialState = {
  engine: {
    backgroundState,
  },
};
const store = mockStore(initialState);

describe('WatchAssetRequest', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <WatchAssetRequest
          suggestedAssetMeta={{
            asset: { address: '0x2', symbol: 'TKN', decimals: 0 },
          }}
        />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
