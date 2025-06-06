import { Hex } from '@metamask/utils';
import { renderHook } from '@testing-library/react-hooks';
import { BigNumber } from 'bignumber.js';
import {
  SimulationData,
  SimulationTokenBalanceChange,
  SimulationTokenStandard,
} from '@metamask/transaction-controller';
import { fetchTokenContractExchangeRates } from '@metamask/assets-controllers';

import { getTokenDetails } from '../../../util/address';
import { selectConversionRateByChainId } from '../../../selectors/currencyRateController';
import useBalanceChanges from './useBalanceChanges';
import { FIAT_UNAVAILABLE, AssetType } from './types';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockImplementation((callback) => callback()),
}));

jest.mock('../../../selectors/currencyRateController', () => ({
  selectConversionRateByChainId: jest.fn(),
  selectCurrentCurrency: jest.fn(),
}));

jest.mock('../../../selectors/networkController', () => ({
  selectChainId: jest.fn(),
}));

jest.mock('../../../util/address', () => ({
  getTokenDetails: jest.fn(),
}));

jest.mock('@metamask/assets-controllers', () => ({
  CodefiTokenPricesServiceV2: jest.fn(),
  fetchTokenContractExchangeRates: jest.fn(),
}));

// TODO: Replace "any" with type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelectConversionRate = selectConversionRateByChainId as any;
const mockGetTokenDetails = getTokenDetails as jest.Mock;
const mockFetchTokenContractExchangeRates =
  fetchTokenContractExchangeRates as jest.Mock;

const ETH_TO_FIAT_RATE = 3;
const NETWORK_CLIENT_ID_MOCK = 'mainnet';
const ERC20_TOKEN_ADDRESS_1_MOCK: Hex = '0x0erc20_1';
const ERC20_TOKEN_ADDRESS_2_MOCK: Hex = '0x0erc20_2';
const ERC20_TOKEN_ADDRESS_3_MOCK: Hex = '0x0erc20_3';
const ERC20_DECIMALS_1_MOCK = 3;
const ERC20_DECIMALS_2_MOCK = 4;
const ERC20_DECIMALS_INVALID_MOCK = null;
const ERC20_TO_FIAT_RATE_1_MOCK = 1.5;
const ERC20_TO_FIAT_RATE_2_MOCK = 6;

const NFT_TOKEN_ADDRESS_MOCK: Hex = '0x0nft';

const TOKEN_ID_1_MOCK: Hex = '0x123';

const DIFFERENCE_1_MOCK: Hex = '0x11';
const DIFFERENCE_2_MOCK: Hex = '0x2';
const DIFFERENCE_ETH_MOCK: Hex = '0x1234567890123456789';

const CHAIN_ID_MOCK = '0x123';

const dummyBalanceChange = {
  previousBalance: '0x0' as Hex,
  newBalance: '0x0' as Hex,
};

const PENDING_PROMISE = () =>
  new Promise(() => {
    /* unresolved promise */
  });

describe('useBalanceChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTokenDetails.mockImplementation((address: Hex) => {
      const decimalMap: Record<Hex, number | string> = {
        [ERC20_TOKEN_ADDRESS_1_MOCK]: ERC20_DECIMALS_1_MOCK,
        [ERC20_TOKEN_ADDRESS_2_MOCK]: ERC20_DECIMALS_2_MOCK,
        [ERC20_TOKEN_ADDRESS_3_MOCK]:
          ERC20_DECIMALS_INVALID_MOCK as unknown as number,
      };
      if (decimalMap[address]) {
        return Promise.resolve({
          decimals: decimalMap[address]?.toString() ?? undefined,
        });
      }
      return Promise.reject(new Error('Unable to determine token standard'));
    });
    mockSelectConversionRate.mockReturnValue(ETH_TO_FIAT_RATE);
    mockFetchTokenContractExchangeRates.mockResolvedValue({
      [ERC20_TOKEN_ADDRESS_1_MOCK]: ERC20_TO_FIAT_RATE_1_MOCK,
      [ERC20_TOKEN_ADDRESS_2_MOCK]: ERC20_TO_FIAT_RATE_2_MOCK,
    });
  });

  describe('pending states', () => {
    it('returns pending=true if no simulation data', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useBalanceChanges({
          chainId: CHAIN_ID_MOCK,
          simulationData: undefined,
          networkClientId: NETWORK_CLIENT_ID_MOCK,
        }),
      );
      expect(result.current).toEqual({ pending: true, value: [] });
      await waitForNextUpdate();
    });

    it('returns pending=true while fetching token decimals', async () => {
      mockGetTokenDetails.mockImplementation(PENDING_PROMISE);
      const simulationData: SimulationData = {
        nativeBalanceChange: undefined,
        tokenBalanceChanges: [
          {
            ...dummyBalanceChange,
            difference: DIFFERENCE_1_MOCK,
            isDecrease: true,
            address: ERC20_TOKEN_ADDRESS_1_MOCK,
            standard: SimulationTokenStandard.erc20,
          },
        ],
      };
      const { result, unmount, waitForNextUpdate } = renderHook(() =>
        useBalanceChanges({
          chainId: CHAIN_ID_MOCK,
          simulationData,
          networkClientId: NETWORK_CLIENT_ID_MOCK,
        }),
      );

      await waitForNextUpdate();

      expect(result.current).toEqual({ pending: true, value: [] });
      unmount();
    });

    it('returns pending=true while fetching token fiat rates', async () => {
      mockFetchTokenContractExchangeRates.mockImplementation(PENDING_PROMISE);
      const simulationData: SimulationData = {
        nativeBalanceChange: undefined,
        tokenBalanceChanges: [
          {
            ...dummyBalanceChange,
            difference: DIFFERENCE_1_MOCK,
            isDecrease: true,
            address: ERC20_TOKEN_ADDRESS_1_MOCK,
            standard: SimulationTokenStandard.erc20,
          },
        ],
      };
      const { result, unmount } = renderHook(() =>
        useBalanceChanges({
          chainId: CHAIN_ID_MOCK,
          simulationData,
          networkClientId: NETWORK_CLIENT_ID_MOCK,
        }),
      );

      expect(result.current).toEqual({ pending: true, value: [] });
      unmount();
    });
  });

  describe('with token balance changes', () => {
    const setupHook = (
      tokenBalanceChanges: SimulationData['tokenBalanceChanges'],
    ) => {
      const simulationData: SimulationData = {
        nativeBalanceChange: undefined,
        tokenBalanceChanges,
      };
      return renderHook(() =>
        useBalanceChanges({
          chainId: CHAIN_ID_MOCK,
          simulationData,
          networkClientId: NETWORK_CLIENT_ID_MOCK,
        }),
      );
    };

    it('maps token balance changes correctly', async () => {
      const { result, waitForNextUpdate } = setupHook([
        {
          ...dummyBalanceChange,
          difference: '0x11',
          isDecrease: true,
          address: ERC20_TOKEN_ADDRESS_1_MOCK,
          standard: SimulationTokenStandard.erc20,
        },
      ]);

      await waitForNextUpdate();

      const changes = result.current.value;
      expect(changes).toEqual([
        {
          asset: {
            address: ERC20_TOKEN_ADDRESS_1_MOCK,
            type: AssetType.ERC20,
            tokenId: undefined,
            chainId: CHAIN_ID_MOCK,
          },
          balance: new BigNumber(0),
          decimals: 3,
          amount: new BigNumber('-0.017'),
          fiatAmount: -0.0255,
          tokenSymbol: undefined,
        },
      ]);
      expect(changes[0].amount.toString()).toBe('-0.017');
    });

    it('returns balance, tokenSymbol if previous values are defined', async () => {
      const { result, waitForNextUpdate } = setupHook([
        {
          previousBalance: '0x5' as Hex,
          newBalance: '0x0' as Hex,
          difference: '0x11',
          isDecrease: true,
          address: ERC20_TOKEN_ADDRESS_1_MOCK,
          standard: SimulationTokenStandard.erc20,
          tokenSymbol: 'ETH',
        } as SimulationTokenBalanceChange,
      ]);

      await waitForNextUpdate();

      const changes = result.current.value;
      expect(changes).toEqual([
        {
          asset: {
            address: ERC20_TOKEN_ADDRESS_1_MOCK,
            type: AssetType.ERC20,
            tokenId: undefined,
            chainId: CHAIN_ID_MOCK,
          },
          balance: new BigNumber('0.005'),
          decimals: 3,
          amount: new BigNumber('-0.017'),
          fiatAmount: -0.0255,
          tokenSymbol: 'ETH',
        },
      ]);
      expect(changes[0].amount.toString()).toBe('-0.017');
    });

    it('handles multiple token balance changes', async () => {
      const { result, waitForNextUpdate } = setupHook([
        {
          ...dummyBalanceChange,
          difference: DIFFERENCE_1_MOCK,
          isDecrease: true,
          address: ERC20_TOKEN_ADDRESS_1_MOCK,
          standard: SimulationTokenStandard.erc20,
        },
        {
          ...dummyBalanceChange,
          difference: DIFFERENCE_2_MOCK,
          isDecrease: false,
          address: ERC20_TOKEN_ADDRESS_2_MOCK,
          standard: SimulationTokenStandard.erc20,
        },
      ]);

      await waitForNextUpdate();

      const changes = result.current.value;
      expect(changes).toHaveLength(2);
      expect(changes[0].amount.toString()).toBe('-0.017');
      expect(changes[0].fiatAmount).toBe(Number('-0.0255'));
      expect(changes[1].amount.toString()).toBe('0.0002');
      expect(changes[1].fiatAmount).toBe(Number('0.0012'));
    });

    it('handles non-ERC20 tokens', async () => {
      const { result, waitForNextUpdate } = setupHook([
        {
          ...dummyBalanceChange,
          difference: '0x1',
          isDecrease: true,
          address: NFT_TOKEN_ADDRESS_MOCK,
          standard: SimulationTokenStandard.erc721,
          id: TOKEN_ID_1_MOCK,
        },
      ]);

      await waitForNextUpdate();

      expect(result.current.value).toEqual([
        {
          asset: {
            address: NFT_TOKEN_ADDRESS_MOCK,
            type: AssetType.ERC721,
            tokenId: TOKEN_ID_1_MOCK,
            chainId: CHAIN_ID_MOCK,
          },
          balance: new BigNumber(0),
          decimals: 0,
          amount: new BigNumber('-1'),
          fiatAmount: FIAT_UNAVAILABLE,
          tokenSymbol: undefined,
        },
      ]);
    });

    it('uses default decimals when token details not found', async () => {
      const { result, waitForNextUpdate } = setupHook([
        {
          ...dummyBalanceChange,
          difference: DIFFERENCE_1_MOCK,
          isDecrease: true,
          address: '0x0unknown',
          standard: SimulationTokenStandard.erc20,
        },
      ]);

      await waitForNextUpdate();

      expect(result.current.value[0].amount.decimalPlaces()).toBe(18);
    });

    it('uses default decimals when token details are not valid numbers', async () => {
      const { result, waitForNextUpdate } = setupHook([
        {
          ...dummyBalanceChange,
          difference: DIFFERENCE_1_MOCK,
          isDecrease: true,
          address: ERC20_TOKEN_ADDRESS_3_MOCK,
          standard: SimulationTokenStandard.erc20,
        },
      ]);

      await waitForNextUpdate();

      expect(result.current.value[0].amount.decimalPlaces()).toBe(18);
    });

    it('handles token fiat rate with more than 15 significant digits', async () => {
      mockFetchTokenContractExchangeRates.mockResolvedValue({
        [ERC20_TOKEN_ADDRESS_1_MOCK]: 0.1234567890123456,
      });
      const { result, waitForNextUpdate } = setupHook([
        {
          ...dummyBalanceChange,
          difference: DIFFERENCE_1_MOCK,
          isDecrease: true,
          address: ERC20_TOKEN_ADDRESS_1_MOCK,
          standard: SimulationTokenStandard.erc20,
        },
      ]);

      await waitForNextUpdate();

      expect(result.current.value[0].fiatAmount).toBe(-0.002098765413209875);
    });
  });

  describe('with native balance change', () => {
    const setupHook = (
      nativeBalanceChange?: SimulationData['nativeBalanceChange'],
    ) => {
      const simulationData: SimulationData = {
        nativeBalanceChange,
        tokenBalanceChanges: [],
      };
      return renderHook(() =>
        useBalanceChanges({
          chainId: CHAIN_ID_MOCK,
          simulationData,
          networkClientId: NETWORK_CLIENT_ID_MOCK,
        }),
      );
    };

    it('maps native balance change correctly', async () => {
      const { result, waitForNextUpdate } = setupHook({
        ...dummyBalanceChange,
        difference: DIFFERENCE_ETH_MOCK,
        isDecrease: true,
      });

      await waitForNextUpdate();

      const changes = result.current.value;
      expect(changes).toEqual([
        {
          asset: {
            type: AssetType.Native,
            chainId: CHAIN_ID_MOCK,
          },
          amount: new BigNumber('-5373.003641998677469065'),
          fiatAmount: Number('-16119.010925996032'),
        },
      ]);
    });

    it('handles native fiat rate with more than 15 significant digits', async () => {
      mockSelectConversionRate.mockReturnValue(0.1234567890123456);
      const { result, waitForNextUpdate } = setupHook({
        ...dummyBalanceChange,
        difference: DIFFERENCE_ETH_MOCK,
        isDecrease: true,
      });

      await waitForNextUpdate();

      expect(result.current.value[0].fiatAmount).toBe(-663.3337769927953);
    });

    it('handles no native balance change', async () => {
      const { result, waitForNextUpdate } = setupHook(undefined);
      await waitForNextUpdate();
      expect(result.current.value).toEqual([]);
    });
  });

  it('combines native and token balance changes', async () => {
    const simulationData: SimulationData = {
      nativeBalanceChange: {
        ...dummyBalanceChange,
        difference: DIFFERENCE_ETH_MOCK,
        isDecrease: true,
      },
      tokenBalanceChanges: [
        {
          ...dummyBalanceChange,
          difference: DIFFERENCE_2_MOCK,
          isDecrease: false,
          address: ERC20_TOKEN_ADDRESS_1_MOCK,
          standard: SimulationTokenStandard.erc20,
        },
      ],
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useBalanceChanges({
        chainId: CHAIN_ID_MOCK,
        simulationData,
        networkClientId: NETWORK_CLIENT_ID_MOCK,
      }),
    );

    await waitForNextUpdate();

    const changes = result.current.value;
    expect(changes).toHaveLength(2);
    expect(changes[0].asset).toEqual({
      type: AssetType.Native,
      chainId: CHAIN_ID_MOCK,
    });
    expect(changes[0].amount).toEqual(
      new BigNumber('-5373.003641998677469065'),
    );
    expect(changes[0].fiatAmount).toBe(Number('-16119.010925996032'));
    expect(changes[1].asset).toEqual({
      address: ERC20_TOKEN_ADDRESS_1_MOCK,
      type: AssetType.ERC20,
      chainId: CHAIN_ID_MOCK,
    });
    expect(changes[1].amount).toEqual(new BigNumber('0.002'));
  });
});
