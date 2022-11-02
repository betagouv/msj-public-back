import * as dotenv from 'dotenv'

dotenv.config()

export function getEnv (varName: string, defaultValue?: string): string {
  const value = process.env[varName]
  if (value == null && defaultValue == null) {
    throw new Error(`missing env variable ${varName}`)
  }

  return value || defaultValue!
}
