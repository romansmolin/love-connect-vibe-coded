const isDevelopmentEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'

export const selectStripeUrl = (prodValue?: string, devValue?: string) =>
    isDevelopmentEnvironment ? (devValue ?? prodValue) : prodValue
