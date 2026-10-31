"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { S, type Ctx, type Field } from "./schema";
import { confirmDialog, edited, pickMedia, registerAuto, resolveDir, toast, ui, uploadOne } from "./store";
import { extOf, fileName, isUrl, parseYouTube, slugify, splitVideoId, toArr, videoLink, type Obj } from "./util";

/* Form widgets. Each control edits the plain data object directly, then calls edited(). */

interface P { f: Field; obj: Obj; ctx: Ctx }

const FULL_TYPES = new Set(["cover", "textarea", "list", "gallery", "videos", "group", "image", "file", "multi"]);
const DIV_LABEL = new Set(["cover", "list", "gallery", "videos", "multi", "image", "file", "bool"]);

export function Fields({ fields, obj, ctx }: { fields: Field[]; obj: Obj; ctx: Ctx }) {
  return (
    <div className="fields">
      {fields.map((f) => (
        <FieldView key={f.key} f={f} obj={obj} ctx={ctx} />
      ))}
    </div>
  );
}

/** One labelled field. `bare` renders just the control (used inside compact rows and panels). */
export function FieldView({ f, obj, ctx, bare = false }: P & { bare?: boolean }) {
  const id = useId();
  let control: ReactNode;
  switch (f.type) {
    case "text": case "url": case "number": case "slug": control = <InputCtl id={id} f={f} obj={obj} ctx={ctx} />; break;
    case "textarea": control = <TextareaCtl id={id} f={f} obj={obj} ctx={ctx} />; break;
    case "select": control = <SelectCtl id={id} f={f} obj={obj} ctx={ctx} />; break;
    case "multi": control = <MultiCtl f={f} obj={obj} ctx={ctx} />; break;
    case "bool": control = <label className="check"><input type="checkbox" checked={!!obj[f.key]} onChange={(e) => { obj[f.key] = e.target.checked; edited(); }} />{f.label}</label>; break;
    case "date": control = <input id={id} type="date" value={obj[f.key] || ""} required={f.required === true} aria-label={f.label} onChange={(e) => { obj[f.key] = e.target.value; edited(); }} />; break;
    case "eventdate": control = <EventDateCtl id={id} f={f} obj={obj} ctx={ctx} />; break;
    case "image": control = <AssetCtl f={f} obj={obj} ctx={ctx} kind="image" />; break;
    case "cover": control = <CoverCtl f={f} obj={obj} ctx={ctx} />; break;
    case "file": control = <AssetCtl f={f} obj={obj} ctx={ctx} kind="file" />; break;
    case "list": control = <ListCtl f={f} obj={obj} ctx={ctx} />; break;
    case "gallery": control = <GalleryCtl f={f} obj={obj} ctx={ctx} />; break;
    case "videos": control = <VideosCtl f={f} obj={obj} ctx={ctx} />; break;
    case "group": {
      const sub = (obj[f.key] = obj[f.key] || {});
      return (
        <fieldset className="group field full">
          <legend>{f.label}</legend>
          <Fields fields={f.fields!} obj={sub} ctx={ctx} />
        </fieldset>
      );
    }
  }
  if (bare) return <>{control}</>;
  const full = FULL_TYPES.has(f.type) || f.w === "full";
  const asDiv = DIV_LABEL.has(f.type);
  return (
    <div className={`field${full ? " full" : ""} t-${f.type}`}>
      {f.type !== "bool" && (asDiv ? <div className="lbl">{f.label}</div> : <label className="lbl" htmlFor={id}>{f.label}</label>)}
      {control}
      {f.help && <p className="help">{f.help}</p>}
    </div>
  );
}

/* ───────── single-value controls ───────── */

function InputCtl({ id, f, obj, ctx }: P & { id: string }) {
  const readonly = f.type === "slug" && !obj._new;
  useEffect(() => (f.type === "slug" && f.auto && obj._new ? registerAuto({ obj, f, ctx }) : undefined), [obj, f]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      id={id}
      ref={focusRef(obj, [f.key])}
      type={f.type === "number" ? "number" : "text"}
      className={f.type === "slug" || f.type === "url" ? "mono" : ""}
      value={obj[f.key] ?? ""}
      placeholder={f.placeholder}
      required={f.required === true}
      readOnly={readonly}
      title={readonly ? "Fixed once saved — changing it would break links and upload folders." : undefined}
      aria-label={f.label}
      onChange={(e) => {
        obj[f.key] = e.target.value;
        if (f.type === "slug") obj._idTouched = true;
        edited();
      }}
      onBlur={(e) => {
        if (f.type !== "slug" || readonly) return;
        const v = slugify(e.target.value);
        if (v !== obj[f.key]) {
          obj[f.key] = v;
          edited();
        }
      }}
    />
  );
}

function TextareaCtl({ id, f, obj }: P & { id: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.scrollHeight) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 2}px`;
    }
  });
  return <textarea id={id} ref={(el) => { ref.current = el; focusRef(obj, [f.key])(el); }} rows={3} value={obj[f.key] ?? ""} placeholder={f.placeholder} required={f.required === true} aria-label={f.label} onChange={(e) => { obj[f.key] = e.target.value; edited(); }} />;
}

function SelectCtl({ id, f, obj }: P & { id: string }) {
  const opts = f.options!();
  const cur = obj[f.key] ?? "";
  const known = opts.some((o) => o.value === cur);
  return (
    <select id={id} ref={focusRef(obj, [f.key])} value={cur} required={f.required === true} aria-label={f.label} onChange={(e) => { obj[f.key] = e.target.value; edited(); }}>
      {(!cur || !known) && <option value={cur}>{cur ? `${cur} (not in list)` : "Choose…"}</option>}
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function MultiCtl({ f, obj }: P) {
  const opts = f.options!();
  const cur = toArr(obj[f.key]);
  const unknown = cur.filter((v) => !opts.some((o) => o.value === v)).map((v) => ({ value: v, label: `${v} (not in list)`, bad: true }));
  return (
    <div className="chips" role="group" aria-label={f.label}>
      {[...opts.map((o) => ({ ...o, bad: false })), ...unknown].map((o) => {
        const on = cur.includes(o.value);
        return (
          <button key={o.value} type="button" className={`chip${on ? " on" : ""}${o.bad ? " bad" : ""}`} aria-pressed={on} onClick={() => { obj[f.key] = on ? cur.filter((x) => x !== o.value) : [...cur, o.value]; edited(); }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** The site stores event times as "2027-06-15T00:00:00+02:00" (midnight, Bratislava time). */
function bratislavaOffset(dateStr: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Bratislava", timeZoneName: "longOffset" }).formatToParts(new Date(`${dateStr}T12:00:00Z`));
    const m = /GMT([+-]\d{2}):?(\d{2})?/.exec(parts.find((p) => p.type === "timeZoneName")!.value);
    return m ? `${m[1]}:${m[2] || "00"}` : "+00:00";
  } catch {
    return "+01:00";
  }
}

function EventDateCtl({ id, f, obj }: P & { id: string }) {
  return (
    <input
      id={id} type="date" value={String(obj[f.key] || "").slice(0, 10)} required={f.required === true} aria-label={f.label}
      onChange={(e) => {
        const d = e.target.value;
        if (d && d === String(obj[f.key] || "").slice(0, 10)) return;
        obj[f.key] = d ? `${d}T00:00:00${bratislavaOffset(d)}` : "";
        edited();
      }}
    />
  );
}

/* ───────── image / file with upload ───────── */

function AssetCtl({ f, obj, ctx, kind }: P & { kind: "image" | "file" }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [broken, setBroken] = useState("");
  const v = String(obj[f.key] || "").trim();
  const set = (p: string) => { obj[f.key] = p; edited(); };

  async function doUpload(file: File) {
    const dir = resolveDir(f, ctx);
    if (!dir) return;
    const t = toast(`Uploading ${file.name}…`, "info", 0);
    try {
      set((await uploadOne(file, dir)).path);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      t.dismiss();
    }
  }
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) doUpload(e.dataTransfer.files[0]); };

  const thumb =
    kind === "image" ? (
      !v ? <div className="thumb empty">none</div> : broken === v ? <div className="thumb missing" title="This file isn’t in public/ yet">missing</div> : // eslint-disable-next-line @next/next/no-img-element
      <img className="thumb" src={v} alt="" onError={() => setBroken(v)} />
    ) : (
      <div className={`thumb docicon${v ? "" : " empty"}`}>{v ? (isUrl(v) ? "LINK" : extOf(v).toUpperCase().slice(0, 4) || "FILE") : "none"}</div>
    );

  return (
    <div className={`asset ${kind}${drag ? " drag" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
      <div className="thumb-wrap">{thumb}</div>
      <div className="asset-main">
        <div className="asset-actions">
          <button className="btn sm" onClick={() => input.current?.click()}>{kind === "image" ? "Upload image…" : "Upload file…"}</button>
          <button className="btn sm" onClick={async () => { const p = await pickMedia(kind === "image" ? "image" : "all"); if (p) set(p); }}>Choose existing</button>
          <button className="btn sm ghost" onClick={() => set("")}>Clear</button>
        </div>
        <input className="mono sm" ref={focusRef(obj, [f.key])} value={obj[f.key] || ""} aria-label={`${f.label} path`} placeholder={kind === "image" ? "/content/…  (optional)" : "/content/…   or   https://…"} onChange={(e) => set(e.target.value)} />
        <input ref={input} type="file" hidden accept={kind === "image" ? "image/*" : ".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.ods,.odp,.txt,.md,.csv,image/*"} onChange={(e) => { if (e.target.files?.length) doUpload(e.target.files[0]); e.target.value = ""; }} />
      </div>
    </div>
  );
}

/* ───────── "selected on the page" → scroll to the field and flash it ───────── */

function flash(el: HTMLElement | null) {
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.focus?.({ preventScroll: true });
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 1800);
}

/** Ref callback: if the preview selected this object + one of these keys, bring it into view. key "" = the whole record. */
export const focusRef = (obj: Obj, keys: string[], sel?: string) => (el: HTMLElement | null) => {
  const f = ui.focus;
  if (!el || !f || f.obj !== obj || !keys.includes(f.key)) return;
  ui.focus = null;
  setTimeout(() => flash(sel ? el.querySelector<HTMLElement>(sel) ?? el : el), 80);
};

/* ───────── cover image: one picture ({ src, alt }) with its shared description ───────── */

function CoverCtl({ f, obj, ctx }: P) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [broken, setBroken] = useState("");
  const cur: Obj | undefined = obj[f.key];
  const src = String(cur?.src ?? "").trim();
  const lib = (): Obj => (S.data.mediaDescriptions ||= {});
  const setSrc = (p: string) => {
    if (!p.trim()) delete obj[f.key];
    else {
      const c: Obj = (obj[f.key] ||= {});
      c.src = p;
      c.alt = lib()[p.trim()] ?? ""; // the image's description from the media library
    }
    edited();
  };

  async function doUpload(file: File) {
    const dir = resolveDir(f, ctx);
    if (!dir) return;
    const t = toast(`Uploading ${file.name}…`, "info", 0);
    try {
      setSrc((await uploadOne(file, dir)).path);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      t.dismiss();
    }
  }

  return (
    <div
      className={`asset image cover${drag ? " drag" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) doUpload(e.dataTransfer.files[0]); }}
    >
      <div className="thumb-wrap">
        {!src ? <div className="thumb wide empty">none</div> : broken === src ? <div className="thumb wide missing" title="This file isn’t in public/ yet">missing</div> : // eslint-disable-next-line @next/next/no-img-element
          <img className="thumb wide" src={src} alt="" onError={() => setBroken(src)} />}
      </div>
      <div className="asset-main">
        <div className="asset-actions">
          <button className="btn sm" onClick={() => input.current?.click()}>{src ? "Replace…" : "Upload image…"}</button>
          <button className="btn sm" onClick={async () => { const p = await pickMedia("image"); if (p) setSrc(p); }}>Choose existing</button>
          {src && <button className="btn sm ghost" onClick={() => setSrc("")}>Remove</button>}
        </div>
        <input className="mono sm" ref={cur ? focusRef(cur, ["", "src", "alt"]) : undefined} value={cur?.src ?? ""} aria-label={`${f.label} path`} placeholder="/content/…  (none)" onChange={(e) => setSrc(e.target.value)} />
        {src && (
          <input
            className={`desc${String(cur?.alt ?? "").trim() ? "" : " empty"}`} value={cur?.alt ?? ""} placeholder="Describe the picture (for screen readers)" aria-label={`${f.label} description`}
            title="Saved with the image in the media library: the same description is used everywhere this picture appears."
            onChange={(e) => { lib()[src] = e.target.value; if (cur) cur.alt = e.target.value; edited(); }}
          />
        )}
        <input ref={input} type="file" hidden accept="image/*" onChange={(e) => { if (e.target.files?.length) doUpload(e.target.files[0]); e.target.value = ""; }} />
      </div>
    </div>
  );
}

/* ───────── stable keys & shared bits ───────── */

const keys = new WeakMap<object, number>();
let keySeq = 0;
const keyOf = (o: object) => keys.get(o) ?? (keys.set(o, ++keySeq), keySeq);

/** Focuses the first field of a freshly-added item. */
const focusNew = (item: Obj, sel = "input:not([readonly]),textarea,select") => (el: HTMLElement | null) => {
  if (!el || !item._focus) return;
  delete item._focus;
  setTimeout(() => el.querySelector<HTMLElement>(sel)?.focus(), 0);
};

function Move({ arr, i, onRemove }: { arr: unknown[]; i: number; onRemove: () => void }) {
  const move = (d: number) => { [arr[i], arr[i + d]] = [arr[i + d], arr[i]]; edited(); };
  const stop = (fn: () => void) => (e: { preventDefault(): void }) => { e.preventDefault(); fn(); };
  return (
    <div className="ctl">
      <button className="icon" title="Move up" aria-label="Move up" disabled={i === 0} onClick={stop(() => move(-1))}>↑</button>
      <button className="icon" title="Move down" aria-label="Move down" disabled={i === arr.length - 1} onClick={stop(() => move(1))}>↓</button>
      <button className="icon danger" title="Remove" aria-label="Remove" onClick={stop(onRemove)}>✕</button>
    </div>
  );
}

/* ───────── photo gallery ───────── */

function GalleryCtl({ f, obj, ctx }: P) {
  const arr: Obj[] = (obj[f.key] = obj[f.key] || []);
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  async function addFiles(files: File[]) {
    const dir = resolveDir(f, ctx);
    if (!dir) return;
    const imgs = files.filter((x) => x.type.startsWith("image/"));
    if (!imgs.length) return void toast("Only image files can be added to a gallery.", "error");
    const t = toast(`Uploading ${imgs.length} photo${imgs.length > 1 ? "s" : ""}…`, "info", 0);
    let n = 0;
    for (const file of imgs) {
      try {
        const up = await uploadOne(file, dir);
        arr.push({ src: up.path, alt: S.data.mediaDescriptions?.[up.path] ?? "", _focus: n === 0 });
        n++;
        edited();
      } catch (e) {
        toast(`${file.name}: ${(e as Error).message}`, "error");
      }
    }
    t.dismiss();
    if (n) toast(`Added ${n} photo${n > 1 ? "s" : ""}. Give each a short description.`, "success");
  }

  return (
    <div className={`gallery${drag ? " drag" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles([...e.dataTransfer.files]); }}>
      <div className="tiles">
        {arr.map((img, i) => (
          <Tile key={keyOf(img)} img={img} i={i} arr={arr} />
        ))}
      </div>
      <div className="gallery-add">
        <button className="btn" onClick={() => input.current?.click()}>Add photos…</button>
        <button className="btn" onClick={async () => { const p = await pickMedia("image"); if (p) { arr.push({ src: p, alt: S.data.mediaDescriptions?.[p] ?? "", _focus: true }); edited(); } }}>Choose existing</button>
        <span className="hint">or drop image files here · descriptions are shared with the media library</span>
        {arr.length > 0 && <span className="count">{arr.length} photo{arr.length === 1 ? "" : "s"}</span>}
      </div>
      <input ref={input} type="file" hidden multiple accept="image/*" onChange={(e) => { addFiles([...(e.target.files || [])]); e.target.value = ""; }} />
    </div>
  );
}

function Tile({ img, i, arr }: { img: Obj; i: number; arr: Obj[] }) {
  const [broken, setBroken] = useState(false);
  const empty = !String(img.alt || "").trim();
  return (
    <figure className="tile" ref={(el) => { focusNew(img, ".alt")(el); focusRef(img, ["", "src", "alt"], ".alt")(el); }}>
      {broken ? <div className="tile-missing" title={img.src}>missing file</div> : // eslint-disable-next-line @next/next/no-img-element
        <img src={img.src} alt="" loading="lazy" onError={() => setBroken(true)} />}
      <input className={`alt${empty ? " empty" : ""}`} value={img.alt || ""} placeholder="Describe the photo" aria-label={`Description of ${fileName(img.src)}`} onChange={(e) => { (S.data.mediaDescriptions ||= {})[img.src] = e.target.value; img.alt = e.target.value; edited(); }} title="Saved with the image in the media library: the same description is used everywhere this photo appears." />
      <div className="tile-ctl">
        <button className="icon" title="Move earlier" aria-label="Move earlier" disabled={i === 0} onClick={() => { [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]]; edited(); }}>↑</button>
        <button className="icon" title="Move later" aria-label="Move later" disabled={i === arr.length - 1} onClick={() => { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; edited(); }}>↓</button>
        <button className="icon danger" title="Remove from gallery (the file stays in public/)" aria-label="Remove photo" onClick={() => { arr.splice(i, 1); edited(); }}>✕</button>
      </div>
    </figure>
  );
}

/* ───────── YouTube videos ───────── */

function VideosCtl({ f, obj }: P) {
  const arr: Obj[] = (obj[f.key] = obj[f.key] || []);
  return (
    <div className="videos">
      {arr.length ? arr.map((v, i) => <VideoRow key={keyOf(v)} v={v} i={i} arr={arr} />) : <p className="empty">No videos. Upload the video to YouTube first, then paste its link here.</p>}
      <button className="btn add" onClick={() => { arr.push({ id: "", title: "Match video", _focus: true }); edited(); }}>Add video</button>
    </div>
  );
}

function VideoRow({ v, i, arr }: { v: Obj; i: number; arr: Obj[] }) {
  const [draft, setDraft] = useState(videoLink(v.id));
  const [msg, setMsg] = useState("");
  const { id } = splitVideoId(v.id);
  const commit = () => {
    const p = parseYouTube(draft);
    if (!p) return setMsg(draft.trim() ? "That doesn’t look like a YouTube link." : "");
    setMsg("");
    v.id = p.id + (p.t ? `?t=${p.t}` : "");
    setDraft(videoLink(v.id));
    edited();
  };
  return (
    <div className="video-row" ref={(el) => { focusNew(v)(el); focusRef(v, ["", "id", "title"], ".video-main input:nth-of-type(2)")(el); }}>
      <div className="thumb-wrap">
        {id ? <img className="vthumb" src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" /> : <div className="vthumb empty">no video</div>}
      </div>
      <div className="video-main">
        <input className={`mono${msg ? " bad" : ""}`} value={draft} placeholder="Paste a YouTube link, e.g. https://youtu.be/…" aria-label="YouTube link" onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} />
        <input value={v.title || ""} placeholder="Title, e.g. Final match" aria-label="Video title" onChange={(e) => { v.title = e.target.value; edited(); }} />
        {msg && <p className="help bad-msg">{msg}</p>}
      </div>
      <Move arr={arr} i={i} onRemove={() => { arr.splice(i, 1); edited(); }} />
    </div>
  );
}

/* ───────── generic list of objects ───────── */

function ListCtl({ f, obj, ctx }: P) {
  const arr: Obj[] = (obj[f.key] = obj[f.key] || []);

  const remove = async (i: number) => {
    const item = arr[i];
    const blocked = f.canRemove?.(item);
    if (blocked) return void toast(blocked, "error");
    if (f.confirmRemove) {
      const ok = await confirmDialog({ title: `Remove “${f.title?.(item) || "this item"}”?`, body: "It disappears from the site when you save. Files already uploaded stay in public/.", ok: "Remove", danger: true });
      if (!ok) return;
    }
    arr.splice(i, 1);
    edited();
  };
  const add = () => {
    const item = { ...f.template!(ctx), _focus: true };
    if (f.addTop) arr.unshift(item);
    else arr.push(item);
    edited();
  };

  return (
    <div className="list-wrap">
      <div className={`list list-${f.layout}`}>
        {!arr.length && <p className="empty">{f.empty || "Nothing here yet."}</p>}
        {arr.map((item, i) => {
          const ictx = { ...ctx, item };
          const ctl = <Move arr={arr} i={i} onRemove={() => remove(i)} />;
          if (f.layout === "rows") {
            return (
              <div className="row" key={keyOf(item)} ref={(el) => { focusNew(item)(el); focusRef(item, [""])(el); }}>
                {f.item!.map((sf) => <FieldView key={sf.key} f={sf} obj={item} ctx={ictx} bare />)}
                {ctl}
              </div>
            );
          }
          if (f.layout === "collapse") {
            return (
              <details className="coll" key={keyOf(item)} open={!!item._open} ref={(el) => { focusNew(item)(el); focusRef(item, [""])(el); }} onToggle={(e) => { item._open = e.currentTarget.open; }}>
                <summary>
                  <span className="item-title">{f.title?.(item)}</span>
                  {f.badge && <span className="badge">{f.badge(item) || ""}</span>}
                  {ctl}
                </summary>
                <div className="coll-body"><Fields fields={f.item!} obj={item} ctx={ictx} /></div>
              </details>
            );
          }
          return (
            <div className="card-item" key={keyOf(item)} ref={(el) => { focusNew(item)(el); focusRef(item, [""])(el); }}>
              <div className="card-head"><span className="item-title">{f.title?.(item)}</span>{ctl}</div>
              <Fields fields={f.item!} obj={item} ctx={ictx} />
            </div>
          );
        })}
      </div>
      <button className="btn add" onClick={add}>{f.addLabel || "Add"}</button>
    </div>
  );
}
