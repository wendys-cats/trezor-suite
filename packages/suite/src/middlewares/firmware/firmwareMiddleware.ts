import TrezorConnect from 'trezor-connect';
import { MiddlewareAPI } from 'redux';

import { SUITE } from '@suite-actions/constants';
import * as firmwareActions from '@firmware-actions/firmwareActions';
import { AppState, Action, Dispatch } from '@suite-types';
import { FIRMWARE } from '@suite/actions/firmware/constants';

const firmware = (api: MiddlewareAPI<Dispatch, AppState>) => (next: Dispatch) => (
    action: Action,
): Action => {
    const prevApp = api.getState().router.app;

    // pass action
    next(action);

    const { status } = api.getState().firmware;

    switch (action.type) {
        case FIRMWARE.SET_UPDATE_STATUS: {
            const { device } = api.getState().suite;
            // device should always be connected here - button setting waiting-for-bootloader should be disabled when
            // device is not connected
            if (['waiting-for-bootloader', 'check-seed'].includes(action.payload) && device) {
                api.dispatch(firmwareActions.setTargetRelease(device.firmwareRelease));
            }
            break;
        }
        case SUITE.SELECT_DEVICE:
        case SUITE.UPDATE_SELECTED_DEVICE: // UPDATE_SELECTED_DEVICE is needed to handle if device is unacquired in SELECT_DEVICE
            // both saved and unsaved device
            // disconnected
            if (status === 'unplug' && (!action.payload || !action.payload?.connected)) {
                api.dispatch(firmwareActions.setStatus('reconnect-in-normal'));
            }

            // this if section takes care of incremental update, how does it work:
            // 1. I realize that I can't update to the latest firmware (see @trezor/rollout)
            // 2. I use special intermediary firmware instead of using normal one (see @trezor/rollout and trezor-connect)
            // 3. Intermediary firmware updates bootloader to the latest and keeps device in bootloader mode after reconnect
            // 4. This point happens here. After I reconnect the device, firmware middleware finds that the newly connected
            // 4. device does not have the latest firmware, proceed with subsequent updated automatically
            // todo: this is a 'client side' implementation. It would be nicer to have it in trezor-connect
            // todo: but this would require reworking the entire TRAKTOR
            if (
                // these 3 conditions cover any device reconnected in bootloader mode (possibly accidentally)
                status === 'reconnect-in-normal' &&
                action.payload?.connected &&
                action.payload?.mode === 'bootloader' &&
                // this one is the key, if reconnected device has firmware which is not latest, proceed with
                // subsequent updated automatically
                !action.payload?.firmwareRelease?.isLatest
            ) {
                api.dispatch(firmwareActions.firmwareUpdate());
                break;
            }

            if (
                action.payload &&
                action.payload.features &&
                ['reconnect-in-normal', 'wait-for-reboot'].includes(status)
            ) {
                // firmwareActions.firmwareUpdate method sends skipFinalReload parameter into trezor-connect, which results
                // in capabilities not being reloaded properly even after device reconnect. this is because messages definitions
                // which are required to parse incoming message from trezor are reloaded only before call to device starts and
                // after it ends (if there is no skipFinalReload flag). This does not apply for our case here, so we must
                // force features reload.
                TrezorConnect.getFeatures({
                    device: {
                        path: action.payload.path,
                    },
                    keepSession: false,
                });
                if (action.payload.firmware === 'valid') {
                    api.dispatch(firmwareActions.setStatus('done'));
                } else if (['outdated', 'required'].includes(action.payload.firmware)) {
                    api.dispatch(firmwareActions.setStatus('partially-done'));
                }
            }
            break;
        case SUITE.APP_CHANGED:
            if (prevApp === 'firmware' || prevApp === 'onboarding') {
                api.dispatch(firmwareActions.resetReducer());
            }
            break;
        default:
    }

    return action;
};
export default firmware;
