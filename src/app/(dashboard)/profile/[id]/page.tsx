import { MemberProfilePage } from '@/views/member-profile-page'

export default async function MemberProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <MemberProfilePage id={Number(id)} />
}
