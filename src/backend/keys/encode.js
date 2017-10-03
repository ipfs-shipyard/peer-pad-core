import { encode } from 'bs58'

export default function encodeKey (key) {
  return encode(Buffer.from(key))
}
