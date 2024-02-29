import { getEnv } from '../utils/env'
import jwt, { JwtPayload } from 'jsonwebtoken'

const TOKEN_EXPIRE_DELAY = '1h'
export interface TokenPayload {
  id: number
  phone: string
}
export const sign = (data: TokenPayload): string => {
  const base64EncodedPrivateKey = getEnv('PRIVATE_KEY')
  const privateKey = Buffer.from(base64EncodedPrivateKey, 'base64').toString('utf-8');

  const token = jwt.sign(
    data,
    privateKey,
    { expiresIn: TOKEN_EXPIRE_DELAY, algorithm: 'RS256'}
  )

  return token
}

export const verify = (token: string): TokenPayload => {
  const base64EncodedPublicKey = getEnv('PUBLIC_KEY')
  const publicKey = Buffer.from(base64EncodedPublicKey, 'base64').toString('utf-8');

  const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload
  
  return {id: decoded.id, phone: decoded.phone}
}