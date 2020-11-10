import { Account } from '@wallet-types';
import { BuyTrade, BuyTradeQuoteRequest, BuyTradeFormResponse } from 'invity-api';
import { isDesktop } from '@suite-utils/env';
import { ELECTRON_RECEIVER_SERVER } from '@wallet-constants/coinmarket/buy';

export function createQuoteLink(request: BuyTradeQuoteRequest, account: Account): string {
    let hash: string;

    if (request.wantCrypto) {
        hash = `qc/${request.country}/${request.fiatCurrency}/${request.cryptoStringAmount}/${request.receiveCurrency}`;
    } else {
        hash = `qf/${request.country}/${request.fiatCurrency}/${request.fiatStringAmount}/${request.receiveCurrency}`;
    }

    const params = `offers/${account.symbol}/${account.accountType}/${account.index}/${hash}`;

    return `${ELECTRON_RECEIVER_SERVER}/buy-redirect?p=${encodeURIComponent(
        `/coinmarket-redirect/${params}`,
    )}`;
}

export function createTxLink(trade: BuyTrade, account: Account): string {
    const params = `detail/${account.symbol}/${account.accountType}/${account.index}/${trade.paymentId}`;

    return `${ELECTRON_RECEIVER_SERVER}/buy-redirect?p=${encodeURIComponent(
        `/coinmarket-redirect/${params}`,
    )}`;
}

export function submitRequestForm(tradeForm: BuyTradeFormResponse): void {
    if (!tradeForm || !tradeForm.form) return;
    // for IFRAME there is nothing to submit
    if (tradeForm.form.formMethod === 'IFRAME') return;

    if (tradeForm.form.formMethod === 'GET' && tradeForm.form.formAction) {
        window.open(tradeForm.form.formAction, isDesktop() ? '_blank' : '_self');
        return;
    }

    const { fields } = tradeForm.form;

    let params = `a=${encodeURIComponent(tradeForm.form.formAction)}`;
    Object.keys(fields).forEach(k => {
        params += `&${k}=${encodeURIComponent(fields[k])}`;
    });
    window.open(`${ELECTRON_RECEIVER_SERVER}/buy-post?${params}`, '_blank');
}
