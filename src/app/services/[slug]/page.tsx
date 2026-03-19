import { AppShell } from "@/components/app-shell";
import { ServiceDetail } from "@/components/service-detail";
import { WorkspaceUnavailableState } from "@/components/workspace-unavailable-state";
import { getPageWorkspaceContext } from "@/server/access";
import { getServiceContext, getWorkspaceSnapshot, WorkspaceDataUnavailableError } from "@/server/workspace";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const access = await getPageWorkspaceContext();

  try {
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
  } catch (error) {
    if (error instanceof WorkspaceDataUnavailableError) {
      return <WorkspaceUnavailableState workspaceName={access.workspaceName} currentPath={`/services/${slug}`} />;
    }

    throw error;
  }
}
