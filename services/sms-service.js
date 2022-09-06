const http = require('http')

class SMSService {
  constructor (smsData) {
    this.username = process.env.LM_ACCOUNT
    this.password = process.env.LM_PWD
    this.host = process.env.LM_HOST
    this.path = process.env.LM_PATH
    this.smsData = smsData
  }

  buildPostDate () {
    return JSON.stringify(this.smsData)
  }

  send () {
    const req = http.request({
      hostname: this.host,
      path: this.path,
      method: 'POST',
      auth: `${this.username}:${this.password}`
    },
    (res) => {
      console.log('STATUS: ' + res.statusCode)
      console.log('HEADERS: ' + JSON.stringify(res.headers))
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        console.log('BODY: ' + chunk)
      })
      res.on('error', (error) => {
        // Send to sentry
        console.log(error)
      })
    })
    req.write(this.buildPostDate())
    req.end()
  }
}

export default SMSService
