import { getPrefixedURL } from '@suite-utils/router';
import { METADATA } from '@suite-actions/constants';
import { Deferred, createDeferred } from '@suite-utils/deferred';
import { urlHashParams, urlSearchParams } from '@suite-utils/metadata';
/**
 * For desktop, always use oauth_receiver.html from trezor.io
 * For web, use oauth_receiver.html hosted on the same origin (localhost/sldev/trezor.io)
 */
export const getOauthReceiverUrl = (): Promise<string> | string => {
    // @ts-ignore
    if (!window.ipcRenderer) {
        return `${window.location.origin}${getPrefixedURL('/static/oauth/oauth_receiver.html')}`;
    }

    // for desktop
    // start ouath-receiver http service and wait for address
    return new Promise((resolve, reject) => {
        // @ts-ignore
        ipcRenderer.send('oauth-receiver-start');
        // @ts-ignore
        ipcRenderer.on('oauth-receiver-address', (_sender: any, message: string) => {
            console.log('data in javascript', message);
            if (message) {
                return resolve(message);
            }
            return reject(new Error('no response'));
        });
    });
};

type Params = { [param: string]: string };

export const getMetadataOauthToken = (url: string) => {
    console.log('getMetadataOauthToken', url);
    const originalParams = urlHashParams(url);

    const dfd: Deferred<Params> = createDeferred();

    const props = METADATA.AUTH_WINDOW_PROPS;

    const onMessage = (e: MessageEvent) => {
        // filter non oauth messages
        if (
            ![
                'herokuapp.com', // todo: remove
                'wallet.trezor.io',
                'beta-wallet.trezor.io',
                window.location.origin,
            ].includes(e.origin)
        ) {
            return;
        }

        if (typeof e.data !== 'string') return;

        let params: Params;

        if (e.data.startsWith('#')) {
            params = urlHashParams(e.data);
        } else {
            params = urlSearchParams(e.data);
        }

        console.log('params', params);

        if (originalParams.state && params.state !== originalParams.state) {
            return;
        }


        if (params) {
            dfd.resolve(params);
        } else {
            dfd.reject(new Error('Cancelled'));
        }
    };

    // @ts-ignore
    const { ipcRenderer } = global;
    if (ipcRenderer) {
        // const onIpcMessage = (_sender: any, message: any) => {
        //     onMessage({ ...message, origin: 'herokuapp.com' });
        //     ipcRenderer.off('oauth', onIpcMessage);
        // };
        // ipcRenderer.on('oauth', onIpcMessage);

        ipcRenderer.on(
            'oauth-receiver-response',
            (_sender: any, message: { [key: string]: string }) => {
                console.log('oauth-receiver-response', message);
                if (message && message.code) {
                    dfd.resolve(message);
                }
            },
        );
    } else {
        window.addEventListener('message', onMessage);
    }

    window.open(url, METADATA.AUTH_WINDOW_TITLE, props);

    return dfd.promise;
};
