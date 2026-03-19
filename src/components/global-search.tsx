"use client";

import { useDeferredValue, useEffect, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpenText, CornerDownLeft, Layers3, Search, ShieldCheck, Sparkles } from "lucide-react";

import { SearchResultItem, SearchResultsPayload } from "@/lib/types";

const emptyResults: SearchResultsPayload = {
  query: "",
  services: [],
  documents: [],
  teams: [],
  shortcuts: [],
  total: 0
};

const sectionMeta = {
  shortcuts: { label: "Shortcuts", icon: Sparkles },
  services: { label: "Services", icon: Layers3 },
  documents: { label: "Docs and Runbooks", icon: BookOpenText },
  teams: { label: "Teams", icon: ShieldCheck }
} as const;

const sectionOrder: Array<keyof Omit<SearchResultsPayload, "query" | "total">> = ["shortcuts", "services", "documents", "teams"];

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultsPayload>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);

  const sections = sectionOrder
    .map((key) => ({
      key,
      ...sectionMeta[key],
      items: results[key]
    }))
    .filter((section) => section.items.length > 0);

  const flatResults = sections.flatMap((section) => section.items);

  function closeSearch() {
    startTransition(() => {
      setOpen(false);
      setQuery("");
      setActiveIndex(0);
    });
  }

  function openSearch() {
    setOpen(true);
  }

  function navigateToResult(item: SearchResultItem) {
    closeSearch();
    router.push(item.href as Parameters<typeof router.push>[0]);
  }

  useEffect(() => {
    function handleGlobalKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
        return;
      }

      if (!open && event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        openSearch();
        return;
      }

      if (open && event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
    }

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(deferredQuery.trim())}`, {
      signal: controller.signal,
      cache: "no-store"
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Search request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as SearchResultsPayload;
        startTransition(() => {
          setResults(payload);
          setActiveIndex(0);
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error(error);
        startTransition(() => {
          setResults(emptyResults);
          setActiveIndex(0);
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [deferredQuery, open]);

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!flatResults.length) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % flatResults.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + flatResults.length) % flatResults.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const item = flatResults[activeIndex];
      if (item) {
        navigateToResult(item);
      }
    }
  }

  let flatIndex = -1;

  return (
    <>
      <button
        type="button"
        className="search-bar search-trigger"
        onClick={openSearch}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-search-open={open ? "true" : "false"}
      >
        <Search size={18} className="muted" />
        <span className="search-placeholder">Search services, docs, runbooks, owners...</span>
        <span className="search-shortcut">Ctrl K</span>
      </button>

      {open ? (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Global search">
          <button type="button" className="search-backdrop" aria-label="Close search" onClick={closeSearch} />
          <div className="search-dialog card">
            <div className="search-input-shell">
              <Search size={18} className="muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search services, docs, runbooks, teams, and shortcuts..."
                aria-label="Global search input"
              />
              <span className="search-shortcut">Esc</span>
            </div>

            <div className="search-panel-meta">
              <span className="muted tiny">
                {loading ? "Searching workspace..." : results.total ? `${results.total} results` : "No matching results"}
              </span>
              <span className="muted tiny">Use arrow keys and enter to navigate</span>
            </div>

            <div className="search-results">
              {sections.length ? (
                sections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <section key={section.key} className="search-section stack">
                      <div className="row" style={{ justifyContent: "flex-start" }}>
                        <Icon size={16} className="muted" />
                        <span className="section-label">{section.label}</span>
                      </div>
                      <div className="stack">
                        {section.items.map((item) => {
                          flatIndex += 1;
                          const currentIndex = flatIndex;
                          const isActive = currentIndex === activeIndex;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              className="search-result"
                              data-active={isActive}
                              onMouseEnter={() => setActiveIndex(currentIndex)}
                              onClick={() => navigateToResult(item)}
                            >
                              <div className="stack" style={{ gap: 6 }}>
                                <div className="row">
                                  <strong>{item.title}</strong>
                                  {item.badge ? <span className="pill">{item.badge}</span> : null}
                                </div>
                                <span className="muted tiny search-result-copy">{item.description}</span>
                                {item.meta ? <span className="muted tiny">{item.meta}</span> : null}
                              </div>
                              <CornerDownLeft size={14} className="muted" />
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              ) : (
                <div className="search-empty stack">
                  <strong>No matching results</strong>
                  <span className="muted tiny">
                    Try a service name, an owner, a runbook title, or jump to a product area from the shortcuts list.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
