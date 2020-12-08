import React from 'react';
import { Router } from '@reach/router';

import Dashboard from '@dashboard-views';
import Notifications from '@suite-views/notifications/Container';
import Passwords from '@passwords-views';
import Portfolio from '@portfolio-views';

import Transactions from '@wallet-views/transactions/Container';
import Receive from '@wallet-views/receive/Container';
import Details from '@wallet-views/details/Container';
import Send from '@wallet-views/send';
import SignVerify from '@wallet-views/sign-verify/Container';

import CoinMarketBuy from '@wallet-views/coinmarket/buy';
import CoinMarketBuyDetail from '@wallet-views/coinmarket/buy/detail';
import CoinMarketBuyOffers from '@wallet-views/coinmarket/buy/offers';
import CoinMarketExchange from '@wallet-views/coinmarket/exchange';
import CoinMarketExchangeDetail from '@wallet-views/coinmarket/exchange/detail';
import CoinMarketExchangeOffers from '@wallet-views/coinmarket/exchange/offers';
import CoinMarketSpend from '@wallet-views/coinmarket/spend';
import CoinmarketRedirect from '@wallet-views/coinmarket/redirect';

import Settings from '@settings-views/Container';
import SettingsCoins from '@settings-views/coins/Container';
import SettingsDebug from '@settings-views/debug/Container';
import SettingsDevice from '@settings-views/device/Container';

const AppRouter = () => (
    <Router>
        <Dashboard path="/" />
        {/* Accounts */}
        <Transactions path="accounts" />
        <Details path="accounts/details" />
        <Receive path="accounts/receive" />
        <Send path="accounts/send" />
        <SignVerify path="accounts/sign-verify" />
        {/* Coinmarket */}
        <CoinMarketBuy path="accounts/coinmarket" />
        <CoinMarketBuy path="accounts/coinmarket/buy" />
        <CoinMarketBuyDetail path="accounts/coinmarket/buy/detail" />
        <CoinMarketBuyOffers path="accounts/coinmarket/buy/offers" />
        <CoinMarketExchange path="accounts/coinmarket/exchange" />
        <CoinMarketExchangeDetail path="accounts/coinmarket/exchange/detail" />
        <CoinMarketExchangeOffers path="accounts/coinmarket/exchange/offers" />
        <CoinMarketSpend path="accounts/coinmarket/spend" />
        {/* Backup (modal) */}
        {/* Bridge (modal) */}
        {/* Coinmarket Redirect */}
        <CoinmarketRedirect path="coinmarket-redirect" />
        {/* Firmware (modal) */}
        {/* Notifications */}
        <Notifications path="notifications" />
        {/* Onboarding (modal) */}
        {/* Passwords */}
        <Passwords path="passwords" />
        {/* Portfolio */}
        <Portfolio path="portfolio" />
        {/* Recovery (modal) */}
        {/* Settings */}
        <Settings path="settings" />
        <SettingsCoins path="settings/coins" />
        <SettingsDebug path="settings/debug" />
        <SettingsDevice path="settings/device" />
        {/* Version */}
    </Router>
);

export default AppRouter;
