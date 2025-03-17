import ManageMembers from '@/app/ui/isusu/manage-members';

interface PageProps {
    params: { isusuId: string };
}

export default function Page({ params }: PageProps) {
    return <ManageMembers isusuId={params.isusuId} />;
}
