import reducer, {
  initialState,
  setSourceAmount,
  setDestAmount,
  resetBridgeState,
} from '.';
import { SupportedCaipChainId } from '@metamask/multichain-network-controller';
import { TokenI } from '../../../../components/UI/Tokens/types';

describe('bridge slice', () => {
  const mockToken: TokenI = {
    address: '0x123',
    symbol: 'ETH',
    decimals: 18,
    image: 'https://example.com/eth.png',
    chainId: 'eip155:1' as SupportedCaipChainId,
    aggregators: [],
    name: 'Ethereum',
    balance: '100',
    balanceFiat: '100',
    isETH: true,
    isNative: true,
    logo: 'https://example.com/eth.png',
  };

  const mockDestToken: TokenI = {
    address: '0x456',
    symbol: 'USDC',
    decimals: 6,
    image: 'https://example.com/usdc.png',
    chainId: 'eip155:2' as SupportedCaipChainId,
    aggregators: [],
    name: 'USDC',
    balance: '100',
    balanceFiat: '100',
    isETH: false,
    isNative: false,
    logo: 'https://example.com/usdc.png',
  };

  describe('initial state', () => {
    it('should have the correct initial state', () => {
      expect(initialState).toEqual({
        sourceAmount: undefined,
        destAmount: undefined,
        destChainId: undefined,
        sourceToken: undefined,
        destToken: undefined,
      });
    });
  });

  describe('setSourceAmount', () => {
    it('should set the source amount', () => {
      const amount = '1.5';
      const action = setSourceAmount(amount);
      const state = reducer(initialState, action);

      expect(state.sourceAmount).toBe(amount);
    });

    it('should set source amount to undefined', () => {
      const action = setSourceAmount(undefined);
      const state = reducer(initialState, action);

      expect(state.sourceAmount).toBeUndefined();
    });
  });

  describe('setDestAmount', () => {
    it('should set the destination amount', () => {
      const amount = '100';
      const action = setDestAmount(amount);
      const state = reducer(initialState, action);

      expect(state.destAmount).toBe(amount);
    });

    it('should set dest amount to undefined', () => {
      const action = setDestAmount(undefined);
      const state = reducer(initialState, action);

      expect(state.destAmount).toBeUndefined();
    });
  });

  describe('resetBridgeState', () => {
    it('should reset the state to initial state', () => {
      const state = {
        ...initialState,
        sourceAmount: '1.5',
        destAmount: '100',
        sourceToken: mockToken,
        destToken: mockDestToken,
      };

      const action = resetBridgeState();
      const newState = reducer(state, action);

      expect(newState).toEqual(initialState);
    });
  });
});
