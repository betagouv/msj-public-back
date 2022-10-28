import * as dotenv from 'dotenv'

dotenv.config()

export function getEnv (varName: string) {
  return process.env[varName]
}
