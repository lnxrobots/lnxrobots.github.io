"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { clearNewFlags, datasetValues, dirtyDatasets, loadAll, loadMedia, markSaved, NAV_DATASETS, S, snapshot, sortedAchievements, validate } from "./schema";
import { bump, closeDialog, confirmDialog, edited, openLightbox, ui, toast, useStore, type DialogSpec } from "./store";
import { api, dirOf, extOf, fileName, fmtBytes, isImagePath } from "./util";
import { normPath, pathForRoute } from "./inspect";
import Preview, { navigatePreview, refreshPreview, selectEntry } from "./Preview";
import { ChangesView, CompetitionsView, Home, MediaView, ResultsView, SiteView, SponsorsView, TeamsView, TextsView, titleFor } from "./views";

const TABS: { name: string; label: string }[] = [
  { name: "home", label: "Start" },
  { name: "site", label: "Site" },
  { name: "texts", label: "Texts" },
  { name: "teams", label: "Teams" },
  { name: "results", label: "Results" },
  { name: "sponsors", label: "Sponsors" },
  { name: "competitions", label: "Competitions" },
  { name: "media", label: "Media" },
  { name: "changes", label: "Review" },
];

export default function App() {
  const version = useStore();
  const [ready, setReady] = useState(false);
  const [fatal, setFatal] = useState("");
  const [hash, setHash] = useState("");
  const [problems, setProblems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [width, setWidth] = useState(460);
  const [resizing, setResizing] = useState(false);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    S.shrink = localStorage.getItem("shrink") !== "0";
    ui.autosave = localStorage.getItem("autosave") === "1";
    setWidth(Number(localStorage.getItem("panelWidth")) || 460);
    Promise.all([api<typeof S.meta>("/api/meta"), loadAll(), loadMedia().catch(() => undefined)]).then(
      ([meta]) => { S.meta = meta; setReady(true); },
      (e) => setFatal(e.message),
    );
  }, []);

  useEffect(() => {
    const on = () => setHash(location.hash);
    on();
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  // Opening something in the panel shows its page in the preview (unless the preview itself caused the change).
  useEffect(() => {
    if (!ready) return;
    if (ui.suppressFollow) { ui.suppressFollow = false; return; }
    ui.selection = null;
    if (ui.follow) {
      const p = pathForRoute(S.data, hash);
      if (p && normPath(p) !== normPath(ui.pagePath)) {
        ui.followNav = normPath(p);
        setTimeout(() => { if (ui.followNav === normPath(p)) ui.followNav = null; }, 4000);
        navigatePreview(p);
      }
    }
    bump();
  }, [hash, ready]);

  useEffect(() => { if (!ui.focus) body.current?.scrollTo({ top: 0 }); }, [hash]);

  const dirty = ready ? dirtyDatasets() : [];
  const issues = ready ? validate() : [];
  const errors = issues.filter((i) => i.level === "error");

  async function save() {
    if (errors.length) return setProblems(true);
    if (!dirty.length) return;
    S.data.achievements = sortedAchievements();
    const values = Object.assign({}, ...dirty.map(datasetValues));
    setSaving(true);
    try {
      const res = await api<{ versions: Record<string, string>; changedFiles: string[] }>("/api/save", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values, base: S.versions }),
      });
      Object.assign(S.versions, res.versions);
      clearNewFlags(S.data);
      markSaved(S.data);
      for (const ds of dirty) S.snap[ds] = snapshot(ds);
      if (!ui.autosave) toast(res.changedFiles.length ? `Saved ${res.changedFiles.join(", ")}` : "Nothing needed rewriting", "success");
      setTimeout(refreshPreview, 350); // the site's dev server picks the change up; make sure the page re-renders
      bump();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }
  const saveRef = useRef(save);
  saveRef.current = save;

  // Optional live preview: save automatically a moment after you stop typing (only when everything is valid).
  useEffect(() => {
    if (!ui.autosave || !dirty.length || errors.length || saving) return;
    const t = setTimeout(() => saveRef.current(), 900);
    return () => clearTimeout(t);
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps

  async function discard() {
    if (!(await confirmDialog({ title: "Discard unsaved changes?", body: "Your edits since the last save are lost. Files you already uploaded stay in public/content.", ok: "Discard", danger: true }))) return;
    await loadAll();
    ui.selection = null;
    bump();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveRef.current(); }
    };
    const onUnload = (e: BeforeUnloadEvent) => { if (dirtyDatasets().length) e.preventDefault(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("beforeunload", onUnload); };
  }, []);

  function startResize(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
    const move = (ev: PointerEvent) => setWidth(Math.min(760, Math.max(340, ev.clientX)));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setResizing(false);
      setWidth((w) => (localStorage.setItem("panelWidth", String(w)), w));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  if (fatal) return <div className="fatal"><h1>The editor couldn’t start</h1><p>{fatal}</p><p>Check that this folder contains the website’s <code>src/data</code> files, then reload.</p></div>;
  if (!ready) return <div className="fatal"><p>Loading…</p></div>;

  const [name = "home", key] = hash.replace(/^#\//, "").split("/");
  let view: ReactNode;
  switch (name) {
    case "site": view = <SiteView />; break;
    case "texts": view = <TextsView />; break;
    case "teams": view = <TeamsView k={key} />; break;
    case "results": view = <ResultsView k={key} />; break;
    case "sponsors": view = <SponsorsView />; break;
    case "competitions": view = <CompetitionsView />; break;
    case "media": view = <MediaView />; break;
    case "changes": view = <ChangesView />; break;
    default: view = <Home />;
  }
  const warnCount = issues.length - errors.length;
  const sel = ui.selection;

  return (
    <div className={`shell${resizing ? " resizing" : ""}`}>
      <header className="topbar">
        <a className="wordmark" href="#/"><span className="logo">LNX</span><span>content editor</span></a>
        <span className="grow" />
        <label className="check live" title="Saves automatically a moment after you stop typing (only when everything is valid), so the preview updates as you edit.">
          <input type="checkbox" checked={ui.autosave} onChange={(e) => { ui.autosave = e.target.checked; localStorage.setItem("autosave", e.target.checked ? "1" : "0"); bump(); }} />
          Live preview
        </label>
        {issues.length > 0 && <button className={`pill ${errors.length ? "error" : "warn"}`} onClick={() => setProblems(true)}>{errors.length ? `${errors.length} problem${errors.length > 1 ? "s" : ""}` : `${warnCount} warning${warnCount > 1 ? "s" : ""}`}</button>}
        {dirty.length > 0 && <button className="btn ghost" onClick={discard}>Discard changes</button>}
        <span className={`via ${dirty.length ? "dirty" : "clean"}`} aria-hidden="true" />
        <button className="btn primary" disabled={!dirty.length || saving} onClick={save} title={errors.length ? "Fix the problems first" : "Ctrl/⌘ + S"}>{saving ? "Saving…" : dirty.length ? "Save changes" : "All saved"}</button>
      </header>

      <div className="split" style={{ gridTemplateColumns: `${width}px 6px minmax(0, 1fr)` }}>
        <aside className="editor" aria-label="Editor">
          <nav className="tabs" aria-label="Sections">
            {TABS.map((t) => {
              const isDirty = (NAV_DATASETS[t.name] || []).some((ds) => dirty.includes(ds));
              const active = t.name === name || (t.name === "home" && !TABS.some((x) => x.name === name));
              return <a key={t.name} href={`#/${t.name === "home" ? "" : t.name}`} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{t.label}{isDirty && <span className="via dirty" title="Unsaved changes" />}</a>;
            })}
          </nav>
          <div className="editor-body" ref={body}>
            {sel && (
              <div className="selection" role="status">
                <span className="sel-dot" aria-hidden="true" />
                <div className="sel-main">
                  <small>{sel.container ? "Selected block on the page" : "Selected on the page"}</small>
                  <strong>{sel.label}</strong>
                  {sel.alternatives.length > 0 && (
                    <div className="alts">
                      <small>Same text also appears in:</small>
                      {sel.alternatives.slice(0, 4).map((a, i) => (
                        <button key={i} className="chip" onClick={() => selectEntry({ entry: a, alternatives: [], candIndex: -1, container: false })}>{a.label}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="icon" aria-label="Dismiss" onClick={() => { ui.selection = null; bump(); }}>✕</button>
              </div>
            )}
            <h1 className="panel-title">{titleFor(name, key)}</h1>
            {view}
          </div>
        </aside>
        <div className="resizer" role="separator" aria-orientation="vertical" aria-label="Resize the editor panel" onPointerDown={startResize} />
        <Preview />
      </div>

      {problems && <ProblemsDialog onClose={() => setProblems(false)} />}
      {ui.dialogs.map((d) => <DialogView key={d.id} d={d} />)}
      {ui.lightbox && <LightboxDialog />}
      <div id="toasts" aria-live="polite">
        {ui.toasts.map((t) => <div key={t.id} className={`toast ${t.kind}`} role={t.kind === "error" ? "alert" : "status"}>{t.message}</div>)}
      </div>
    </div>
  );
}

/* ───────── dialogs ───────── */

function useModal() {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (ref.current && !ref.current.open) ref.current.showModal(); }, []);
  return ref;
}

function ProblemsDialog({ onClose }: { onClose: () => void }) {
  const ref = useModal();
  const issues = validate();
  return (
    <dialog ref={ref} className="dlg wide" onClose={onClose}>
      <h2>{issues.some((i) => i.level === "error") ? "Fix these before saving" : "Things to check"}</h2>
      {!issues.length && <p>Nothing to fix.</p>}
      <ul className="issues">
        {issues.map((i, n) => (
          <li key={n} className={i.level}>
            <a href={i.route} onClick={() => ref.current?.close()}><strong>{i.where}</strong><span>{i.msg}</span></a>
          </li>
        ))}
      </ul>
      <div className="dlg-actions"><button className="btn" onClick={() => ref.current?.close()}>Close</button></div>
    </dialog>
  );
}

function DialogView({ d }: { d: DialogSpec }) {
  return d.kind === "confirm" ? <ConfirmDialog d={d} /> : <PickerDialog d={d} />;
}

function ConfirmDialog({ d }: { d: Extract<DialogSpec, { kind: "confirm" }> }) {
  const ref = useModal();
  const answer = useRef(false);
  return (
    <dialog ref={ref} className="dlg small" onClose={() => { d.resolve(answer.current); closeDialog(d); }}>
      <h2>{d.title}</h2>
      {d.body && <p>{d.body}</p>}
      <div className="dlg-actions">
        <button className="btn" onClick={() => ref.current?.close()}>Cancel</button>
        <button className={`btn ${d.danger ? "danger-solid" : "primary"}`} onClick={() => { answer.current = true; ref.current?.close(); }}>{d.ok}</button>
      </div>
    </dialog>
  );
}

function PickerDialog({ d }: { d: Extract<DialogSpec, { kind: "picker" }> }) {
  const ref = useModal();
  const chosen = useRef<string[] | null>(null);
  const [term, setTerm] = useState("");
  const [folder, setFolder] = useState("");
  const [newest, setNewest] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const last = useRef<string | null>(null);

  const desc = (path: string): string => S.data.mediaDescriptions?.[path] ?? "";
  const files = S.media.filter((m) => d.mediaKind !== "image" || isImagePath(m.path));
  const folders = [...new Set(files.map((m) => dirOf(m.path)))].filter(Boolean).sort();
  let shown = files.filter((m) => {
    const dir = dirOf(m.path);
    const inFolder = !folder || dir === folder || dir.startsWith(`${folder}/`);
    return inFolder && (!term.trim() || `${m.path} ${desc(m.path)}`.toLowerCase().includes(term.trim().toLowerCase()));
  });
  if (newest) shown = [...shown].sort((a, b) => b.mtime - a.mtime);
  const already = new Set(d.already);
  const selectable = shown.filter((m) => !already.has(m.path));
  const images = shown.filter((m) => isImagePath(m.path));

  const finish = (paths: string[]) => { chosen.current = paths; ref.current?.close(); };
  function click(path: string, e: { shiftKey: boolean }) {
    if (already.has(path)) return;
    if (!d.multiple) return finish([path]);
    if (e.shiftKey && last.current) {
      // shift-click: select everything between the last click and this one
      const a = selectable.findIndex((x) => x.path === last.current);
      const b = selectable.findIndex((x) => x.path === path);
      if (a >= 0 && b >= 0) {
        const range = selectable.slice(Math.min(a, b), Math.max(a, b) + 1).map((x) => x.path);
        setSel((s) => [...new Set([...s, ...range])]);
        last.current = path;
        return;
      }
    }
    last.current = path;
    setSel((s) => (s.includes(path) ? s.filter((x) => x !== path) : [...s, path]));
  }

  return (
    <dialog ref={ref} className="dlg wide" onClose={() => { d.resolve(chosen.current); closeDialog(d); }}>
      <h2>{d.multiple ? "Choose photos" : "Choose an uploaded file"}</h2>
      <div className="picker-tools">
        <input type="search" autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Filter by file, folder or description…" aria-label="Filter files" />
        <select value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Folder">
          <option value="">All folders</option>
          {folders.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <label className="check"><input type="checkbox" checked={newest} onChange={(e) => setNewest(e.target.checked)} />Newest first</label>
      </div>
      {d.multiple && <p className="help">Click to select several photos · Shift-click selects a range · ⤢ shows a photo larger.</p>}
      <div className="picker-grid">
        {!shown.length && <p className="empty">{files.length ? "Nothing matches." : "No files uploaded yet."}</p>}
        {shown.map((m) => {
          const isSel = sel.includes(m.path);
          const isAlready = already.has(m.path);
          const img = isImagePath(m.path);
          return (
            <div key={m.path} className={`pick${isSel ? " selected" : ""}${isAlready ? " already" : ""}`}>
              <button className="pick-main" title={desc(m.path) ? `${m.path} — ${desc(m.path)}` : m.path} aria-pressed={d.multiple ? isSel : undefined} disabled={isAlready} onClick={(e) => click(m.path, e)}>
                {img ? // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.path} loading="lazy" alt="" /> : <div className="docicon">{extOf(m.path).toUpperCase()}</div>}
                <span className="pname">{fileName(m.path)}</span>
                <span className="pdir">{desc(m.path) || dirOf(m.path)}</span>
              </button>
              {d.multiple && !isAlready && <span className="pick-check" aria-hidden="true">{isSel ? "✓" : ""}</span>}
              {isAlready && <span className="pick-badge">Already added</span>}
              {img && (
                <button className="pick-zoom" title="View larger" aria-label={`View ${fileName(m.path)} larger`} onClick={() => openLightbox(images.map((x) => ({ src: x.path })), images.findIndex((x) => x.path === m.path))}>⤢</button>
              )}
            </div>
          );
        })}
      </div>
      <div className="dlg-actions spread">
        {d.multiple ? (
          <div className="pick-count">
            <strong>{sel.length}</strong> selected
            <button className="btn sm ghost" onClick={() => setSel(selectable.map((x) => x.path))} disabled={!selectable.length}>Select all shown ({selectable.length})</button>
            <button className="btn sm ghost" onClick={() => setSel([])} disabled={!sel.length}>Clear</button>
          </div>
        ) : <span />}
        <div className="dlg-buttons">
          <button className="btn" onClick={() => ref.current?.close()}>Cancel</button>
          {d.multiple && <button className="btn primary" disabled={!sel.length} onClick={() => finish(sel)}>{sel.length ? `Add ${sel.length} photo${sel.length > 1 ? "s" : ""}` : "Add"}</button>}
        </div>
      </div>
    </dialog>
  );
}

/** A photo at full size, with arrow-key navigation and its (shared) description. */
function LightboxDialog() {
  const ref = useModal();
  const lb = ui.lightbox!;
  const n = lb.items.length;
  const item = lb.items[lb.index];
  const lib: Record<string, string> = (S.data.mediaDescriptions ||= {});
  const file = S.media.find((m) => m.path === item.src);
  const step = (dir: number) => { ui.lightbox = { ...lb, index: (lb.index + dir + n) % n }; bump(); };
  const isImage = isImagePath(item.src) || /^https?:/.test(item.src);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (n < 2 || (e.target instanceof HTMLInputElement)) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <dialog ref={ref} className="lightbox" aria-label="Photo viewer" onClose={() => { ui.lightbox = null; bump(); }} onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}>
      <div className="lb-stage" onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}>
        {n > 1 && <button className="lb-nav" aria-label="Previous photo" onClick={() => step(-1)}>‹</button>}
        {isImage ? // eslint-disable-next-line @next/next/no-img-element
          <img className="lb-img" src={item.src} alt={lib[item.src] ?? item.alt ?? ""} /> : <div className="stage-msg">No preview for this file type.</div>}
        {n > 1 && <button className="lb-nav" aria-label="Next photo" onClick={() => step(1)}>›</button>}
      </div>
      <div className="lb-bar">
        <div className="lb-info">
          <strong>{fileName(item.src)}</strong>
          <span>{[dirOf(item.src), file ? fmtBytes(file.size) : "", n > 1 ? `${lb.index + 1} of ${n}` : ""].filter(Boolean).join(" · ")}</span>
        </div>
        {isImage && (
          <input
            className="lb-desc" value={lib[item.src] ?? item.alt ?? ""} placeholder="Describe this photo (shared everywhere it’s used)" aria-label="Photo description"
            onChange={(e) => { lib[item.src] = e.target.value; edited(); }}
          />
        )}
        <a className="btn sm" href={item.src} target="_blank" rel="noreferrer">Open original ↗</a>
        <button className="btn sm" autoFocus onClick={() => ref.current?.close()}>Close</button>
      </div>
    </dialog>
  );
}
