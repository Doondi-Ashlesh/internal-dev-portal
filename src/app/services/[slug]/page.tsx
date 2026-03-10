import { AppShell } from "@/components/app-shell";
import { ServiceDetail } from "@/components/service-detail";
import { getServiceContext, getWorkspaceSnapshot } from "@/server/workspace";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getWorkspaceSnapshot();
  const context = await getServiceContext(slug);

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath={`/services/${slug}`}>
      <ServiceDetail
        service={context?.service ?? null}
        documents={context?.documents ?? []}
        activity={context?.activity ?? []}
      />
    </AppShell>
  );
}
