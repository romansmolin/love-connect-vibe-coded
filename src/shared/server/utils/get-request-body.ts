export const getRequestBody = async (request: Request) => {
    try {
        return await request.json()
    } catch {
        return null
    }
}
