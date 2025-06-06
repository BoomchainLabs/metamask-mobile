import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import Engine from '../../core/Engine';
import type BN4 from 'bnjs4';

/**
 * Hook to handle the balance of ERC20 tokens
 * @property requestedTokenAddress Token contract address
 * @property userCurrentAddress Public address which holds the token
 * @returns Array that consists of `[balance, loading, error]`
 */

const useTokenBalance = (
  requestedTokenAddress: string,
  userCurrentAddress: string,
): [BN4 | null, boolean, boolean] => {
  // This hook should be only used with ERC20 tokens
  const [tokenBalance, setTokenBalance]: [
    BN4 | null,
    Dispatch<SetStateAction<BN4 | null>>,
  ] = useState<BN4 | null>(null);
  const [loading, setLoading]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState<boolean>(true);
  const [error, setError]: [boolean, Dispatch<SetStateAction<boolean>>] =
    useState<boolean>(false);
  // TODO: Replace "any" with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { AssetsContractController }: any = Engine.context;

  const fetchBalance = async (
    tokenAddress: string,
    userAddress: string,
  ): Promise<void> => {
    AssetsContractController.getERC20BalanceOf(tokenAddress, userAddress)
      .then((balance: BN4) => setTokenBalance(balance))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBalance(requestedTokenAddress, userCurrentAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTokenAddress, userCurrentAddress]);

  return [tokenBalance, loading, error];
};

export default useTokenBalance;
