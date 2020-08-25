import { Dropbox } from 'dropbox';
import { AbstractMetadataProvider } from '@suite-types/metadata';
import { getMetadataOauthToken, getOauthReceiverUrl } from '@suite-utils/oauth';
import { METADATA } from '@suite-actions/constants';
import { getRandomId } from '@suite-utils/random';

class DropboxProvider implements AbstractMetadataProvider {
    client: Dropbox;
    connected = false;
    user: DropboxTypes.users.FullAccount | undefined;
    type: 'dropbox';

    constructor(token?: string) {
        this.client = new Dropbox({ clientId: METADATA.DROPBOX_CLIENT_ID });
        if (token) {
            // this.client.setAccessToken(token);
            this.client.setRefreshToken(token);
        }
        this.type = 'dropbox';
    }

    async connect() {
        const redirectUrl = await getOauthReceiverUrl();

        if (!redirectUrl) return false;

        const url = this.client.getAuthenticationUrl(
            redirectUrl,
            getRandomId(10),
            'code',
            'offline',
            undefined,
            "none",
            true,
        );

        const response = await getMetadataOauthToken(url);

        console.log('response', response);

        if (!response.code) return false;
        try {
            const accessToken = await this.client.getAccessTokenFromCode(response.code, redirectUrl);
            console.log('accessToken', accessToken);
            this.client.setAccessToken(accessToken);
        } catch (err) {
            console.log('err', err);
        }
        
        this.connected = true;
        return true;
    }

    async disconnect() {
        try {
            await this.client.authTokenRevoke();
            return true;
        } catch (error) {
            // todo: silent error, maybe ok here?
            return false;
        }
    }

    async getFileContent(file: string) {
        const exists = await this.client.filesSearch({
            path: '',
            query: `${file}.mtdt`,
        });
        if (exists && exists.matches.length > 0) {
            const file = await this.client.filesDownload({
                path: exists.matches[0].metadata.path_lower!,
            });
            // @ts-ignore: fileBlob not defined?
            const buffer = await file.fileBlob.arrayBuffer();
            return buffer;
        }
    }

    async setFileContent(file: string, content: Buffer) {
        const blob = new Blob([content], { type: 'text/plain;charset=UTF-8' });
        return this.client.filesUpload({
            path: `/Apps/TREZOR/${file}.mtdt`,
            contents: blob,
            // @ts-ignore "overwrite" !== string?
            mode: 'overwrite',
        });
    }

    isConnected() {
        return this.connected;
    }

    async getCredentials() {
        if (!this.client.getRefreshToken()) return;
        const account = await this.client.usersGetCurrentAccount();
        return {
            type: 'dropbox',
            token: this.client.getRefreshToken(),
            user: account.name.given_name,
        } as const;
    }
}

export default DropboxProvider;
