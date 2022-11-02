export default class HttpError extends Error {
  constructor (public message: string, public error: number) {
    super(message)
  }
}
