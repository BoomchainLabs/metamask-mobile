import Matchers from '../../../utils/Matchers';
import Gestures from '../../../utils/Gestures';
import {
  ImportTokenViewSelectorsIDs,
  ImportTokenViewSelectorsText,
} from '../../../selectors/wallet/ImportTokenView.selectors';

class ImportTokensView {
  get searchTokenResult() {
    return Matchers.getElementByID(
      ImportTokenViewSelectorsIDs.SEARCH_TOKEN_RESULT,
    );
  }

  get nextButton() {
    return Matchers.getElementByID(ImportTokenViewSelectorsIDs.NEXT_BUTTON);
  }

  get networkInput() {
    return Matchers.getElementByID(
      ImportTokenViewSelectorsIDs.SELECT_NETWORK_BUTTON,
    );
  }

  get symbolInput() {
    return Matchers.getElementByID(ImportTokenViewSelectorsIDs.SYMBOL_INPUT);
  }

  get tokenSymbolText() {
    return Matchers.getElementByText(ImportTokenViewSelectorsText.TOKEN_SYMBOL);
  }

  get addressInput() {
    return Matchers.getElementByID(ImportTokenViewSelectorsIDs.ADDRESS_INPUT);
  }

  get customTokenTab() {
    return Matchers.getElementByText(
      ImportTokenViewSelectorsText.CUSTOM_TOKEN_TAB,
    );
  }

  get searchTokenBar() {
    return Matchers.getElementByID(ImportTokenViewSelectorsIDs.SEARCH_BAR);
  }

  async tapSymbolInput() {
    await Gestures.waitAndTap(this.symbolInput);
  }

  async tapTokenSymbolText() {
    await Gestures.waitAndTap(this.tokenSymbolText);
  }

  async scrollDownOnImportCustomTokens() {
    await Gestures.swipe(this.symbolInput, 'up', 'slow', 0.6);
  }

  async typeTokenAddress(address) {
    await Gestures.typeTextAndHideKeyboard(this.addressInput, address);
  }

  async switchToCustomTab() {
    await Gestures.waitAndTap(this.customTokenTab);
  }

  async searchToken(tokenName) {
    await Gestures.typeTextAndHideKeyboard(this.searchTokenBar, tokenName);
  }

  async tapOnToken() {
    await Gestures.tapAtIndex(this.searchTokenResult, 0);
  }

  async tapOnNextButton() {
    await Gestures.waitAndTap(this.nextButton);
  }

  async tapOnNetworkInput() {
    await Gestures.waitAndTap(this.networkInput);
  }

  async tapNetworkOption(networkName) {
    await Gestures.waitAndTap(Matchers.getElementByText(networkName));
  }
}

export default new ImportTokensView();
