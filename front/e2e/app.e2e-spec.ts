import { CryptoMallPage } from './app.po';

describe('crypto-mall App', function() {
  let page: CryptoMallPage;

  beforeEach(() => {
    page = new CryptoMallPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
