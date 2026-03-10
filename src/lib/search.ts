import { getWorkspaceSnapshot } from "@/server/workspace";

export async function searchWorkspace(query: string) {
  const snapshot = await getWorkspaceSnapshot();
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return {
      services: snapshot.services,
      documents: snapshot.documents
    };
  }

  return {
    services: snapshot.services.filter((service) => {
      return [
        service.name,
        service.description,
        service.team,
        service.owner,
        service.repo,
        ...service.tags
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    }),
    documents: snapshot.documents.filter((document) => {
      return [document.title, document.excerpt, document.type, document.serviceSlug ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    })
  };
}
