import * as dotenv from 'dotenv'

dotenv.config()

export function getEnv (varName: string, defaultValue?: string): string {
  const envValue = process.env[varName]
  const value = envValue ?? defaultValue
  if (value === undefined) {
    throw new Error(`missing env variable ${varName}`)
  }

  return value
}
