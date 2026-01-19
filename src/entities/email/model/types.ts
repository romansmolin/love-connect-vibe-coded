export interface ContactUsRequest {
    name: string
    email: string
    message: string
}

export interface ContactUsResponse {
    success: boolean
    message?: string
}
