import { HdKeyring } from '@metamask/eth-hd-keyring';
import { Json } from '@metamask/eth-query';
import { EthKeyring } from '@metamask/keyring-internal-api';
import { wordlist } from '@metamask/scure-bip39/dist/wordlists/english';
import ExtendedKeyringTypes from '../../constants/keyringTypes';
import Engine from '../../core/Engine';

export async function importNewSecretRecoveryPhrase(mnemonic: string) {
  const { KeyringController } = Engine.context;

  // Convert input mnemonic to codepoints
  const mnemonicWords = mnemonic.toLowerCase().split(' ');
  const inputCodePoints = new Uint16Array(
    mnemonicWords.map((word) => wordlist.indexOf(word)),
  );

  const hdKeyrings = (await KeyringController.getKeyringsByType(
    ExtendedKeyringTypes.hd,
  )) as HdKeyring[];

  // TODO: This is temporary and will be removed once https://github.com/MetaMask/core/issues/5411 is resolved.
  const alreadyImportedSRP = hdKeyrings.some((keyring) => {
    // Compare directly with stored codepoints
    const storedCodePoints = new Uint16Array(
      // The mnemonic will not be undefined because there will be a keyring.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Buffer.from(keyring.mnemonic!).buffer,
    );

    if (inputCodePoints.length !== storedCodePoints.length) return false;

    return inputCodePoints.every(
      (code, index) => code === storedCodePoints[index],
    );
  });

  if (alreadyImportedSRP) {
    throw new Error('This mnemonic has already been imported.');
  }

  const newKeyring = (await KeyringController.addNewKeyring(
    ExtendedKeyringTypes.hd,
    {
      mnemonic,
      numberOfAccounts: 1,
    },
  )) as EthKeyring<Json>;
  const [newAccountAddress] = await newKeyring.getAccounts();
  return Engine.setSelectedAddress(newAccountAddress);
}

export async function createNewSecretRecoveryPhrase() {
  const { KeyringController } = Engine.context;
  const newHdkeyring = (await KeyringController.addNewKeyring(
    ExtendedKeyringTypes.hd,
  )) as HdKeyring;

  const newAccountAddress = (await newHdkeyring.getAccounts())[0];
  return Engine.setSelectedAddress(newAccountAddress);
}
