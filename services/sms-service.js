const https = require('https')
const querystring = require('node:querystring')

class SMSService {
  constructor (smsData) {
    this.username = process.env.LM_ACCOUNT
    this.password = process.env.LM_PWD
    this.host = process.env.LM_HOST
    this.send_path = process.env.LM_SEND_PATH
    this.smsData = smsData
  }

  buildPostData () {
    return querystring.stringify(this.smsData)
  }

  send () {
    const req = https.request({
      host: 'europe.ipx.com',
      path: this.send_path,
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

    req.setHeader('content-type', 'application/x-www-form-urlencoded; charset=UTF-8')
    req.write(this.buildPostData())
    req.end()
  }
}

module.exports = SMSService
