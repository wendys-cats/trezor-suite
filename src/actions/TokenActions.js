/* @flow */


import * as TOKEN from 'actions/constants/token';

import type {
    GetState, AsyncAction, Action, Dispatch,
} from 'flowtype';
import type { State, Token } from 'reducers/TokensReducer';
import type { Account } from 'reducers/AccountsReducer';
import type { NetworkToken } from 'reducers/LocalStorageReducer';
import { getTokenInfoAsync, getTokenBalanceAsync } from './Web3Actions';

export type TokenAction = {
    type: typeof TOKEN.FROM_STORAGE,
    payload: State
} | {
    type: typeof TOKEN.ADD,
    payload: Token
} | {
    type: typeof TOKEN.REMOVE,
    token: Token
} | {
    type: typeof TOKEN.SET_BALANCE,
    payload: State
}


// action from component <reactSelect>
export const load = (input: string, network: string): AsyncAction => async (dispatch: Dispatch, getState: GetState): Promise<any> => {
    if (input.length < 1) input = '0x';

    const tokens = getState().localStorage.tokens[network];
    const value = input.toLowerCase();
    const result = tokens.filter(t => t.symbol.toLowerCase().indexOf(value) >= 0
        || t.address.toLowerCase().indexOf(value) >= 0
        || t.name.toLowerCase().indexOf(value) >= 0);

    if (result.length > 0) {
        // TODO: Temporary fix for async select
        // async react-select starts getting very laggy
        // when options is a large list (>200 items)
        return result.slice(0, 100);
    }
    const web3instance = getState().web3.find(w3 => w3.network === network);
    if (!web3instance) return;

    const info = await getTokenInfoAsync(web3instance.erc20, input);
    if (info) {
        return [info];
    }
    //await resolveAfter(300000);
    //await resolveAfter(3000);
};

export const setBalance = (tokenAddress: string, ethAddress: string, balance: string): AsyncAction => async (dispatch: Dispatch, getState: GetState): Promise<void> => {
    const newState: Array<Token> = [...getState().tokens];
    const token: ?Token = newState.find(t => t.address === tokenAddress && t.ethAddress === ethAddress);
    if (token) {
        token.loaded = true;
        token.balance = balance;
    }

    dispatch({
        type: TOKEN.SET_BALANCE,
        payload: newState,
    });
};

export const add = (token: NetworkToken, account: Account): AsyncAction => async (dispatch: Dispatch, getState: GetState): Promise<void> => {
    const web3instance = getState().web3.find(w3 => w3.network === account.network);
    if (!web3instance) return;

    const tkn: Token = {
        loaded: false,
        deviceState: account.deviceState,
        network: account.network,
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        ethAddress: account.address,
        decimals: token.decimals,
        balance: '0',
    };

    dispatch({
        type: TOKEN.ADD,
        payload: tkn,
    });

    const tokenBalance = await getTokenBalanceAsync(web3instance.erc20, tkn);
    dispatch(setBalance(token.address, account.address, tokenBalance));
};

export const remove = (token: Token): Action => ({
    type: TOKEN.REMOVE,
    token,
});