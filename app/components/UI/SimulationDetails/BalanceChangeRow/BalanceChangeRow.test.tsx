import React from 'react';
import { render } from '@testing-library/react-native';
import { BigNumber } from 'bignumber.js';

import BalanceChangeRow from './BalanceChangeRow';
import { AssetType, BalanceChange } from '../types';

jest.mock('../AmountPill/AmountPill', () => 'AmountPill');
jest.mock('../AssetPill/AssetPill', () => 'AssetPill');
jest.mock('../FiatDisplay/FiatDisplay', () => ({
  IndividualFiatDisplay: 'IndividualFiatDisplay',
}));

const CHAIN_ID_MOCK = '0x123';

const balanceChangeMock: BalanceChange = {
  asset: {
    type: AssetType.ERC20,
    address: '0xabc123',
    chainId: CHAIN_ID_MOCK,
  },
  amount: new BigNumber(100),
  fiatAmount: 0,
} as BalanceChange;

describe('BalanceChangeList', () => {
  it('renders a balance change row', () => {
    const { getByText, getByTestId } = render(
      <BalanceChangeRow
        label="You received"
        balanceChange={balanceChangeMock}
      />,
    );

    expect(getByText('You received')).toBeDefined();
    expect(getByTestId('balance-change-row-label')).toBeDefined();
    expect(getByTestId('balance-change-row-amount-pill')).toBeDefined();
    expect(getByTestId('balance-change-row-asset-pill')).toBeDefined();
  });

  it("doesn't render label if not defined", () => {
    const { getByTestId, queryByTestId } = render(
      <BalanceChangeRow balanceChange={balanceChangeMock} />,
    );

    expect(queryByTestId('balance-change-row-label')).toBeNull();
    expect(getByTestId('balance-change-row-amount-pill')).toBeDefined();
    expect(getByTestId('balance-change-row-asset-pill')).toBeDefined();
  });

  it('renders IndividualFiatDisplay when showFiat is true', () => {
    const { queryByTestId } = render(
      <BalanceChangeRow showFiat balanceChange={balanceChangeMock} />,
    );

    const container = queryByTestId('balance-change-row-fiat-display');

    expect(container).not.toBeNull();
  });

  it('does not render IndividualFiatDisplay when showFiat is false', () => {
    const { queryByTestId } = render(
      <BalanceChangeRow showFiat={false} balanceChange={balanceChangeMock} />,
    );

    const container = queryByTestId('balance-change-row-fiat-display');

    expect(container).toBeNull();
  });

  it('EditRowValue component is included if enableEdit is true and onUpdate is defined', () => {
    const { getByTestId } = render(
      <BalanceChangeRow
        showFiat={false}
        balanceChange={balanceChangeMock}
        enableEdit
        editTexts={{
          title: 'Edit approval limit',
          description:
            'Enter the amount that you feel comfortable being spent on your behalf.',
        }}
        onUpdate={() => undefined}
      />,
    );

    expect(getByTestId('edit-amount-button-icon')).toBeTruthy();
  });
});
