import { useCallback, useMemo } from 'react';
import {
  GasFeeEstimateType,
  TransactionEnvelopeType,
  type TransactionMeta,
  type GasPriceGasFeeEstimates,
} from '@metamask/transaction-controller';
import { type GasFeeEstimates } from '@metamask/gas-fee-controller';
import { strings } from '../../../../../../locales/i18n';
import { updateTransactionGasFees } from '../../../../../util/transaction-controller';
import { useTransactionMetadataRequest } from '../transactions/useTransactionMetadataRequest';
import { useGasFeeEstimates } from './useGasFeeEstimates';
import { useFeeCalculations } from './useFeeCalculations';
import { type GasOption } from '../../types/gas';
import { EMPTY_VALUE_STRING, GasOptionIcon } from '../../constants/gas';

const HEX_ZERO = '0x0';

export const useGasPriceEstimateOption = ({
  handleCloseModals,
}: {
  handleCloseModals: () => void;
}): GasOption[] => {
  const transactionMeta = useTransactionMetadataRequest() as TransactionMeta;
  const { calculateGasEstimate } = useFeeCalculations(transactionMeta);

  const {
    gasFeeEstimates,
    id,
    networkClientId,
    userFeeLevel,
    txParams: { type: transactionEnvelopeType },
  } = transactionMeta;

  const { gasFeeEstimates: networkGasFeeEstimates } = useGasFeeEstimates(
    networkClientId,
  ) as {
    gasFeeEstimates: GasFeeEstimates;
  };

  const transactionGasFeeEstimates = gasFeeEstimates as GasPriceGasFeeEstimates;

  const isGasPriceEstimateSelected = useMemo(
    () =>
      userFeeLevel === 'medium' &&
      transactionGasFeeEstimates?.type === GasFeeEstimateType.GasPrice,
    [userFeeLevel, transactionGasFeeEstimates],
  );

  const shouldIncludeGasPriceEstimateOption = useMemo(
    () =>
      transactionGasFeeEstimates?.type === GasFeeEstimateType.GasPrice &&
      networkGasFeeEstimates,
    [transactionGasFeeEstimates, networkGasFeeEstimates],
  );

  const onGasPriceEstimateLevelClick = useCallback(() => {
    let gasPropertiesToUpdate;
    if (transactionEnvelopeType === TransactionEnvelopeType.legacy) {
      gasPropertiesToUpdate = {
        gasPrice: transactionGasFeeEstimates?.gasPrice,
      };
    } else {
      gasPropertiesToUpdate = {
        maxFeePerGas: transactionGasFeeEstimates?.gasPrice,
        maxPriorityFeePerGas: transactionGasFeeEstimates?.gasPrice,
      };
    }

    updateTransactionGasFees(id, {
      userFeeLevel: 'medium',
      ...gasPropertiesToUpdate,
    });
    handleCloseModals();
  }, [
    id,
    transactionGasFeeEstimates,
    transactionEnvelopeType,
    handleCloseModals,
  ]);

  const options = useMemo((): GasOption[] => {
    if (!shouldIncludeGasPriceEstimateOption) {
      return [];
    }

    let feePerGas = HEX_ZERO;
    let gasPrice = HEX_ZERO;
    const gas = transactionMeta.gasLimitNoBuffer || HEX_ZERO;
    let shouldUseEIP1559FeeLogic = false;
    let priorityFeePerGas = HEX_ZERO;

    if (transactionEnvelopeType === TransactionEnvelopeType.legacy) {
      gasPrice = transactionGasFeeEstimates?.gasPrice;
    } else {
      feePerGas = transactionGasFeeEstimates?.gasPrice;
      priorityFeePerGas = transactionGasFeeEstimates?.gasPrice;
      shouldUseEIP1559FeeLogic = true;
    }

    const { currentCurrencyFee, preciseNativeCurrencyFee } =
      calculateGasEstimate({
        feePerGas,
        priorityFeePerGas,
        gas,
        shouldUseEIP1559FeeLogic,
        gasPrice,
      });

    return [
      {
        emoji: GasOptionIcon.GAS_PRICE,
        estimatedTime: undefined,
        isSelected: isGasPriceEstimateSelected,
        key: 'gasPrice',
        name: strings(`transactions.gas_modal.network_suggested`),
        onSelect: () => onGasPriceEstimateLevelClick(),
        value: preciseNativeCurrencyFee || EMPTY_VALUE_STRING,
        valueInFiat: currentCurrencyFee || EMPTY_VALUE_STRING,
      },
    ];
  }, [
    shouldIncludeGasPriceEstimateOption,
    transactionMeta.gasLimitNoBuffer,
    transactionEnvelopeType,
    transactionGasFeeEstimates?.gasPrice,
    calculateGasEstimate,
    isGasPriceEstimateSelected,
    onGasPriceEstimateLevelClick,
  ]);

  return options;
};
