import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Dropdown, useTheme } from '@trezor/components';
import { Card, QuestionTooltip } from '@suite-components';
import { Section } from '@dashboard-components';
import * as accountUtils from '@wallet-utils/accountUtils';
import { useDiscovery } from '@suite-hooks';
import { useFastAccounts, useFiatValue } from '@wallet-hooks';
import { goto } from '@suite-actions/routerActions';
import ContentLoader from 'react-content-loader';

import Header from './components/Header';
import Exception from './components/Exception';
import EmptyWallet from './components/EmptyWallet';
import DashboardGraph from './components/DashboardGraph/Container';
import GraphScaleDropdownItem from '@suite-components/TransactionsGraph/components/GraphScaleDropdownItem';

const PortfolioCardSkeleton = () => {
    const theme = useTheme();
    return (
        <ContentLoader
            viewBox="0 0 900 330"
            foregroundColor={theme.BG_GREY}
            backgroundColor="#E8E8E8"
            style={{ flex: 1 }}
        >
            <rect x="0" y="0" width="100%" height="100%" />
        </ContentLoader>
    );
};

const StyledCard = styled(Card)`
    flex-direction: column;
    min-height: 400px;
    overflow: hidden;
`;

const Body = styled.div`
    display: flex;
    align-items: center;
    /* padding: 0px 20px; */
    flex: 1;
`;

const PortfolioCard = React.memo(() => {
    const dispatch = useDispatch();
    // const waitingForDevice = !useSelector(state => state.suite.device)?.state;
    const { fiat, localCurrency } = useFiatValue();
    const { discovery, getDiscoveryStatus } = useDiscovery();
    const accounts = useFastAccounts();

    const isDeviceEmpty = useMemo(() => accounts.every(a => a.empty), [accounts]);
    const portfolioValue = accountUtils
        .getTotalFiatBalance(accounts, localCurrency, fiat.coins)
        .toString();

    const discoveryStatus = getDiscoveryStatus();

    // TODO: DashboardGraph will get mounted twice (thus triggering data processing twice)
    // 1. DashboardGraph gets mounted
    // 2. Discovery starts, DashboardGraph is unmounted, Loading mounts
    // 3. Discovery stops (no accounts added), Loading unmounted, new instance of DashboardGraph gets mounted

    let body = null;
    if (discoveryStatus && discoveryStatus.status === 'exception') {
        body = <Exception exception={discoveryStatus} discovery={discovery} />;
    } else if (discoveryStatus && discoveryStatus.status === 'loading') {
        body = <PortfolioCardSkeleton />;
    } else {
        body = isDeviceEmpty ? <EmptyWallet /> : <DashboardGraph accounts={accounts} />;
    }

    const isWalletEmpty = !discoveryStatus && isDeviceEmpty;
    const isWalletLoading = discoveryStatus?.status === 'loading' ?? false;
    const isWalletError = discoveryStatus?.status === 'exception' ?? false;
    const showGraphControls = !isWalletEmpty && !isWalletLoading && !isWalletError;

    const showMissingDataTooltip =
        showGraphControls &&
        !!accounts.find(a => a.networkType === 'ethereum' || a.networkType === 'ripple');

    return (
        <Section
            heading={
                <QuestionTooltip
                    size={18}
                    label="TR_MY_PORTFOLIO"
                    tooltip={showMissingDataTooltip ? 'TR_GRAPH_MISSING_DATA' : undefined}
                    iconStyle={{ marginBottom: 2, marginLeft: 4 }}
                />
            }
            actions={
                showGraphControls ? (
                    <Dropdown
                        alignMenu="right"
                        items={[
                            {
                                key: 'group1',
                                label: 'Graph View',
                                options: [
                                    {
                                        noHover: true,
                                        key: 'graphView',
                                        label: <GraphScaleDropdownItem />,
                                        callback: () => false,
                                    },
                                ],
                            },
                        ]}
                    />
                ) : undefined
            }
        >
            <StyledCard noPadding>
                <Header
                    portfolioValue={portfolioValue}
                    localCurrency={localCurrency}
                    isWalletEmpty={isWalletEmpty}
                    isWalletLoading={isWalletLoading}
                    isWalletError={isWalletError}
                    receiveClickHandler={() => dispatch(goto('wallet-receive'))}
                />
                <Body>{body}</Body>
            </StyledCard>
        </Section>
    );
});

export default PortfolioCard;
