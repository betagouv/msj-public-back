export default class HttpError extends Error {
  constructor (public message: string, public code: number, public originalError?: Error, public sendToSentry?: boolean) {
    super(message)
  }
}
