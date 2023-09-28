import https from 'https'
import querystring from 'node:querystring'
import { getEnv } from '../utils/env'

class SMSService {
  public username: string
  public password: string
  public host: string
  public sendPath: string

  constructor (private readonly smsData: any) {
    this.username = getEnv('LM_ACCOUNT')
    this.password = getEnv('LM_PWD')
    this.host = getEnv('LM_HOST')
    this.sendPath = getEnv('LM_SEND_PATH')
  }

  buildPostData (): string {
    return querystring.stringify(this.smsData)
  }

  send (): void {
    const req = https.request(
      {
        host: this.host,
        path: this.sendPath,
        method: 'POST',
        auth: `${this.username}:${this.password}`
      },
      (res) => {
        console.log(`STATUS: ${res.statusCode ?? ''}`)
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
        res.setEncoding('utf8')
        res.on('data', (chunk: string) => {
          console.log(`BODY: ${chunk}`)
        })
        res.on('error', (error) => {
          console.log(error)
        })
      }
    )

    req.setHeader(
      'content-type',
      'application/x-www-form-urlencoded; charset=UTF-8'
    )
    req.write(this.buildPostData())
    req.end()
  }
}

export default SMSService
