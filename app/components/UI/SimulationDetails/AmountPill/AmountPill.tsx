/* eslint-disable react/prop-types */
import React from 'react';
import { BigNumber } from 'bignumber.js';
import { AssetIdentifier, AssetType } from '../types';
import { formatAmount, formatAmountMaxPrecision } from '../formatAmount';
import I18n, { strings } from '../../../../../locales/i18n';
import styleSheet from './AmountPill.styles';
import { View, ViewProps } from 'react-native';
import Text, {
  TextVariant,
} from '../../../../component-library/components/Texts/Text';
import { useStyles } from '../../../hooks/useStyles';
import { hexToDecimal } from '../../../../util/conversions';

interface AmountPillProperties extends ViewProps {
  asset: AssetIdentifier;
  amount: BigNumber;
  isApproval?: boolean;
  isAllApproval?: boolean;
  isUnlimitedApproval?: boolean;
}
/**
 * Displays a pill with an amount and a background color indicating whether the amount
 * is an increase or decrease.
 *
 * @param props
 * @param props.asset
 * @param props.amount
 */
const AmountPill: React.FC<AmountPillProperties> = ({
  asset,
  amount,
  style,
  isApproval,
  isAllApproval,
  isUnlimitedApproval,
  ...props
}) => {
  const { styles } = useStyles(styleSheet, {
    style,
    isApproval: isApproval ?? false,
    isNegative: amount.isNegative(),
  });
  const amountParts: string[] = [];
  const tooltipParts: string[] = [];

  if (!isApproval) {
    amountParts.push(amount.isNegative() ? '-' : '+');
  }

  // ERC721 amounts are always 1 and are not displayed.
  if (asset.type !== AssetType.ERC721 && !isAllApproval) {
    const formattedAmount = isUnlimitedApproval
      ? strings('confirm.unlimited')
      : formatAmount(I18n.locale, amount.abs());
    const fullPrecisionAmount = formatAmountMaxPrecision(
      I18n.locale,
      amount.abs(),
    );

    amountParts.push(formattedAmount);
    tooltipParts.push(fullPrecisionAmount);
  }

  if (asset.tokenId) {
    const tokenIdPart = `#${hexToDecimal(asset.tokenId)}`;

    amountParts.push(tokenIdPart);
    tooltipParts.push(tokenIdPart);
  }

  if (isAllApproval) {
    amountParts.push(strings('confirm.all'));
    tooltipParts.push(strings('confirm.all'));
  }

  return (
    <View
      testID="simulation-details-amount-pill"
      style={styles.base}
      {...props}
    >
      <Text
        ellipsizeMode="tail"
        variant={TextVariant.BodyMD}
        style={styles.label}
      >
        {amountParts.join(' ')}
      </Text>
    </View>
  );
};

export default AmountPill;
