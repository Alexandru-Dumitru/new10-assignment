import HttpErrors from 'http-errors'
import axios from 'axios'

export const handleError = (e: unknown) => {
  if (HttpErrors.isHttpError(e)) {
    return {
      statusCode: e.statusCode,
      body: e.message,
    }
  }

  if (axios.isAxiosError(e)) {
    return {
      statusCode: Number(e.code),
      body: e.message,
    }
  }
  return {
    statusCode: 500,
    body: e instanceof Error ? JSON.stringify(e.stack) : JSON.stringify(e),
  }
}
