export const prepareGoogleAuthLink = (magicToken: string | null): string => {
    const responseType = 'code'
    const scope = 'openid email profile'

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || !process.env.NEXT_PUBLIC_API_URL) {
        console.warn('Missing env variables: check NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_API_URL')
    }

    console.log('magic:', magicToken)

    let googleOauthLinkBase =
        'https://accounts.google.com/o/oauth2/v2/auth' +
        `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${process.env.NEXT_PUBLIC_API_URL}/auth/callback/google` +
        `&response_type=${responseType}` +
        `&scope=${scope}` +
        `&prompt=select_account`

    if (magicToken) {
        googleOauthLinkBase += `&state=${encodeURIComponent(JSON.stringify({ magicToken }))}`
    }
    return googleOauthLinkBase
}
