export default class HttpError extends Error {
  public originalError : Error | undefined
  constructor (public message: string, public code: number, public originalError?: Error, public sendToSentry?: boolean) {
    super(message)
    this.originalError =  originalError instanceof Error ? originalError : undefined
  }
}
