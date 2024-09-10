export default class HttpError extends Error {
  public originalError : Error | undefined
  constructor (public message: string, public code: number, originalError?: unknown, public sendToSentry?: boolean) {
    super(message)
    this.originalError =  originalError instanceof Error ? originalError : undefined
  }
}
