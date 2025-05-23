/* eslint-disable no-script-url */
import isLinkSafe from './linkCheck';

// Mock the phishing detection utils instead of Engine
jest.mock('./phishingDetection', () => ({
  getPhishingTestResult: jest.fn((origin) => {
    if (origin === 'http://phishing.com') return { result: true };
    return { result: false };
  }),
  isProductSafetyDappScanningEnabled: jest.fn().mockReturnValue(false),
}));

jest.mock('../store', () => ({
  store: {
    getState: jest.fn(() => ({
      settings: { basicFunctionalityEnabled: true },
    })),
  },
}));

jest.mock('../store', () => ({
  store: {
    getState: jest.fn(() => ({
      settings: { basicFunctionalityEnabled: true },
    })),
  },
}));

describe('linkCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly check links for safety', () => {
    expect(isLinkSafe('example.com')).toEqual(false);
    expect(isLinkSafe('htps://ww.example.com/')).toEqual(false);
    expect(isLinkSafe('https://ww.example.com/')).toEqual(true);
    expect(isLinkSafe('http://example com/page?id=123')).toEqual(false);
    expect(isLinkSafe('https://www.example.com/')).toEqual(true);
    expect(isLinkSafe('http://phishing.com')).toEqual(false);
    expect(
      isLinkSafe(
        'https://metamask.app.link/send/pay-Contract-Address@chain-id/transfer?address=Receiver-Address&uint256=1e21',
      ),
    ).toEqual(false);

    expect(isLinkSafe('javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('j&Tab;avascript:alert(1);')).toEqual(false);
    expect(isLinkSafe('&Tab;javascript:alert(1);&tab;')).toEqual(false);
    expect(isLinkSafe('javas\x00cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x07cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x0Dcript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x0Acript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x08cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x02cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x03cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x04cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x01cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x05cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x0Bcript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x09cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x06cript:javascript:alert(1)')).toEqual(false);
    expect(isLinkSafe('javas\x0Ccript:javascript:alert(1)')).toEqual(false);
  });
});
