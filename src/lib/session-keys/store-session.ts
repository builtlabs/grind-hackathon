import { SessionConfig } from '@abstract-foundation/agw-client/sessions';
import { Address, Hex } from 'viem';
import { getEncryptionKey } from './get-encryption-key';
import { encrypt } from './encrypt-session';
import { LOCAL_STORAGE_KEY_PREFIX } from './constants';

export async function storeSession(
  address: Address,
  data: { session: SessionConfig; privateKey: Hex }
) {
  const key = await getEncryptionKey(address);
  const encryptedData = await encrypt(
    JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
    key
  );

  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${address}`, encryptedData);
}
