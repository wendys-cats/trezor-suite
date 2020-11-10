import { Account } from '@wallet-types';
import { BuyTrade, BuyTradeQuoteRequest, BuyTradeFormResponse } from 'invity-api';
import { isDesktop } from '@suite-utils/env';

export function createQuoteLink(request: BuyTradeQuoteRequest, account: Account): string {
    const assetPrefix = process.env.assetPrefix || '';
    let hash: string;

    if (request.wantCrypto) {
        hash = `qc/${request.country}/${request.fiatCurrency}/${request.cryptoStringAmount}/${request.receiveCurrency}`;
    } else {
        hash = `qf/${request.country}/${request.fiatCurrency}/${request.fiatStringAmount}/${request.receiveCurrency}`;
    }

    const params = `offers/${account.symbol}/${account.accountType}/${account.index}/${hash}`;

    return `${window.location.origin}${assetPrefix}/coinmarket-redirect#${params}`;
}

export function createTxLink(trade: BuyTrade, account: Account): string {
    const assetPrefix = process.env.assetPrefix || '';
    const params = `detail/${account.symbol}/${account.accountType}/${account.index}/${trade.paymentId}`;

    return `${window.location.origin}${assetPrefix}/coinmarket-redirect#${params}`;
}

function addHiddenFieldToForm(form: any, fieldName: string, fieldValue: any) {
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = fieldName;
    hiddenField.value = fieldValue;
    form.appendChild(hiddenField);
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
    const form = document.createElement('form');
    form.method = tradeForm.form.formMethod;
    form.action = tradeForm.form.formAction;
    Object.keys(fields).forEach(k => {
        addHiddenFieldToForm(form, k, fields[k]);
    });

    if (!document.body) return;
    document.body.appendChild(form);
    form.submit();
}
