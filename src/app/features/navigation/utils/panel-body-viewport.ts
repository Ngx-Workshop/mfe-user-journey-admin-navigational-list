import type { DestroyRef } from '@angular/core';

/** Fit public panel content to its owned workspace without styling private panel internals. */
export function observePanelBody(
  host: HTMLElement,
  body: HTMLElement,
  destroyRef: DestroyRef,
  setHeight: (height: number | null) => void
): void {
  const panel = body.closest('ngx-panel')!;
  const viewport = host.ownerDocument.defaultView!;
  let frame = 0;
  const measure = () => {
    if (viewport.innerWidth <= 900) {
      setHeight(null);
      return;
    }
    const chrome =
      panel.getBoundingClientRect().height -
      body.getBoundingClientRect().height;
    setHeight(
      Math.max(
        0,
        Math.floor(host.getBoundingClientRect().height - chrome)
      )
    );
  };
  const schedule = () => {
    viewport.cancelAnimationFrame(frame);
    frame = viewport.requestAnimationFrame(measure);
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(host);
  observer.observe(panel);
  observer.observe(body);
  viewport.addEventListener('resize', schedule);
  measure();
  destroyRef.onDestroy(() => {
    observer.disconnect();
    viewport.cancelAnimationFrame(frame);
    viewport.removeEventListener('resize', schedule);
  });
}
