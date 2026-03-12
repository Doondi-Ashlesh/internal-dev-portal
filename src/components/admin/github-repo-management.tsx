import { GithubRepositorySummary, RepositoryRelationship, ServiceSummary } from "@/lib/types";
import { deleteRepositoryLink, importGithubRepositoriesAction, saveRepositoryLink } from "@/server/actions";

const relationshipOptions: RepositoryRelationship[] = ["primary", "worker", "docs", "infra", "library", "other"];

export function GithubRepoManagement({
  workspaceId,
  services,
  repositories,
  canImport,
  canManage
}: {
  workspaceId: string;
  services: ServiceSummary[];
  repositories: GithubRepositorySummary[];
  canImport: boolean;
  canManage: boolean;
}) {
  return (
    <div className="stack-lg">
      <article className="info-card stack-lg admin-card">
        <div className="row">
          <div className="section-copy">
            <div className="section-label">Repository import</div>
            <p className="muted tiny" style={{ maxWidth: 620 }}>
              Sync the latest repositories from the signed-in GitHub account, then link each repository to one or more services.
            </p>
          </div>
          <span className="pill">{repositories.length} imported</span>
        </div>
        {!canManage ? (
          <span className="badge" data-tone="warning">
            Repository sync is read-only for your current role
          </span>
        ) : canImport ? (
          <form action={importGithubRepositoriesAction}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <button className="button-link" type="submit">Import repositories from GitHub</button>
          </form>
        ) : (
          <span className="badge" data-tone="warning">
            Sign out and sign back in with GitHub if repository import is unavailable
          </span>
        )}
      </article>

      {repositories.length ? (
        repositories.map((repository) => (
          <article key={repository.id} className="info-card stack-lg admin-card">
            <div className="row">
              <div>
                <strong>{repository.fullName}</strong>
                <div className="muted tiny" style={{ marginTop: 6 }}>
                  {repository.isPrivate ? "Private" : "Public"}
                  {repository.defaultBranch ? ` | ${repository.defaultBranch}` : ""}
                </div>
              </div>
              <a className="button-link secondary" href={repository.url} target="_blank" rel="noreferrer">
                Open GitHub repo
              </a>
            </div>

            <div className="stack-lg">
              <div className="section-copy">
                <div className="section-label">Current Links</div>
                <p className="muted tiny" style={{ maxWidth: 620 }}>
                  Repositories can support multiple services and relationship types, which keeps the portal realistic for monorepos and infra-adjacent systems.
                </p>
              </div>
              {repository.links.length ? (
                <div className="stack">
                  {repository.links.map((link) => (
                    <div key={`${repository.id}-${link.serviceId}`} className="info-card stack">
                      <div className="row">
                        <strong>{link.serviceName}</strong>
                        <span className="pill">{link.relationshipType}</span>
                      </div>
                      {canManage ? (
                        <form action={deleteRepositoryLink}>
                          <input type="hidden" name="repositoryId" value={repository.id} />
                          <input type="hidden" name="serviceId" value={link.serviceId} />
                          <button className="button-link secondary" type="submit">Remove link</button>
                        </form>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state stack">
                  <strong>No service links yet</strong>
                  <span className="muted tiny">Map this repository to a service to route ownership and activity correctly.</span>
                </div>
              )}
            </div>

            {canManage ? (
              <form action={saveRepositoryLink} className="stack-lg">
                <input type="hidden" name="repositoryId" value={repository.id} />
                <div className="form-grid form-grid-two">
                  <label className="field-stack">
                    <span className="field-label">Service</span>
                    <select name="serviceId" defaultValue="">
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-stack">
                    <span className="field-label">Relationship</span>
                    <select name="relationshipType" defaultValue="primary">
                      {relationshipOptions.map((relationship) => (
                        <option key={relationship} value={relationship}>
                          {relationship}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <button className="button-link" type="submit">Add or update link</button>
                </div>
              </form>
            ) : null}
          </article>
        ))
      ) : (
        <article className="empty-state stack">
          <strong>No repositories imported yet</strong>
          <span className="muted tiny">
            Import GitHub repositories to start linking them to services and preparing for webhook-driven activity sync.
          </span>
        </article>
      )}
    </div>
  );
}