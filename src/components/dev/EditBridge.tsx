"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { installEditBridge } from "./bridge-core";

/**
 * Connects the site to the content editor (admin/) when shown in its preview pane.
 * Rendered only in development (see layout.tsx) and inert outside an iframe.
 */
export function EditBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(
    () =>
      installEditBridge({
        navigate: (path) => routerRef.current.push(path),
        refresh: () => routerRef.current.refresh(),
      }),
    [],
  );

  useEffect(() => {
    if (window.parent !== window) window.parent.postMessage({ source: "lnx-bridge", type: "path", path: pathname }, "*");
  }, [pathname]);

  return null;
}
