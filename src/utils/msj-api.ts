import axios from 'axios'
import { getEnv } from './env'

interface Agent {
  organization_name: string
  first_name: string
  last_name: string
  email: string
}

function getHeaders (): {
  Authorization: string
  'Content-type': 'application/json'
} {
  const username = getEnv('AGENTS_APP_BASIC_AUTH_USERNAME')
  const password = getEnv('AGENTS_APP_BASIC_AUTH_PASSWORD')

  return {
    Authorization:
      'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
    'Content-type': 'application/json'
  }
}

export async function getCpip (convictId: string | number): Promise<Agent> {
  const url = `${getEnv('AGENTS_APP_API_URL')}/convicts/${convictId}/cpip`

  const cpip = await axios.get(url, {
    headers: getHeaders()
  })

  return cpip.data
}

export async function validateInvitation (
  msjId: string | number
): Promise<void> {
  const url = `${getEnv('AGENTS_APP_API_URL')}/convicts/${msjId}/invitation`
  console.log('url api validation invitation', url)
  return await axios.patch(url, {}, { headers: getHeaders() })
}
