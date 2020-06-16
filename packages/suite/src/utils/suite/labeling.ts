import crypto from 'crypto';
import TrezorConnect from 'trezor-connect';
// @ts-ignore
import * as base58check from 'bs58check';
// note we only need base58 conversion fn from base58check, other functions from there might
// be supplemented from crypto module

const CIPHER_TYPE = 'aes-256-gcm';
const CIPHER_IVSIZE = 96 / 8;

export const getMasterKey = async () => {
    const key = 'Enable labeling?';
    const value = 'fedcba98765432100123456789abcdeffedcba98765432100123456789abcdef';

    const response = await TrezorConnect.cipherKeyValue({
        useEmptyPassphrase: true,
        path: [2147493663, 2147483648],
        key,
        value,
        encrypt: true,
        askOnDecrypt: true,
        askOnEncrypt: true,
    });
    if (!response.success) {
        return null;
    }
    return response.payload.value;
};

export const deriveMetadataKey = async (masterKey: string, xpub: string) => {
    const hmac = crypto.createHmac('sha256', Buffer.from(masterKey, 'hex'));
    hmac.update(xpub);
    const hash = hmac.digest();
    return base58check.encode(hash);
};

const deriveHmac = (metadataKey: string) => {
    const hmac = crypto.createHmac('sha512', metadataKey);
    const buf = Buffer.from('0123456789abcdeffedcba9876543210', 'hex');
    hmac.update(buf);
    return hmac.digest();
};

export const deriveAesKey = (metadataKey: string) => {
    const hash = deriveHmac(metadataKey);
    if (hash.length !== 64 && Buffer.byteLength(hash) !== 64) {
        throw new Error(
            `Strange buffer length when deriving account hmac ${hash.length} ; ${Buffer.byteLength(
                hash,
            )}`,
        );
    }
    const secondHalf = hash.slice(32, 64);
    return secondHalf.toString('hex');
};

export const deriveFilename = (metadataKey: string) => {
    const hash = deriveHmac(metadataKey);
    const firstHalf = hash.slice(0, 32);
    return firstHalf.toString('hex');
};

const getRandomIv = () => {
    return new Promise((resolve, reject) => {
        try {
            crypto.randomBytes(CIPHER_IVSIZE, (err, buf) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buf);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

export const encrypt = async (input: Record<string, any>, key: string | Buffer) => {
    if (typeof key === 'string') {
        key = Buffer.from(key, 'hex');
    }
    const iv = await getRandomIv();
    const stringified = JSON.stringify(input);
    const buffer = Buffer.from(stringified, 'utf8');
    // @ts-ignore
    const cipher = crypto.createCipheriv(CIPHER_TYPE, key, iv);
    const startCText = cipher.update(buffer);
    const endCText = cipher.final();
    // tag is always 128-bits
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, startCText, endCText]);
};

export const decrypt = (input: Buffer, key: string | Buffer) => {
    if (typeof key === 'string') {
        key = Buffer.from(key, 'hex');
    }
    try {
        const ivsize = CIPHER_IVSIZE;
        const iv = input.slice(0, ivsize);
        // tag is always 128-bits
        const authTag = input.slice(ivsize, ivsize + 128 / 8);
        const cText = input.slice(ivsize + 128 / 8);
        const decipher = crypto.createDecipheriv(CIPHER_TYPE, key, iv);
        const start: Buffer = decipher.update(cText);

        // throws when tampered
        decipher.setAuthTag(authTag);
        const end: Buffer = decipher.final();

        const res: Buffer = Buffer.concat([start, end]);
        const stringified = res.toString('utf8');
        return Promise.resolve(JSON.parse(stringified));
    } catch (e) {
        return Promise.reject(e);
    }
};
