"use client";

import { useEffect } from "react";

const MM = 96 / 25.4;
const PAGE_W = 210;
const PAGE_H = 297;
const MIN_ZOOM = 0.8;

/**
 * Keeps a resume on one A4 page when it is only a little too long: shrinks the
 * whole page evenly (never below 80%) instead of spilling onto a second page.
 * Longer resumes keep their size and run onto full extra pages, with the
 * sidebar color reaching the bottom of the last page.
 * Sets body[data-fit-ready] when done (the PDF renderer waits for it).
 */
export function FitToPage() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await document.fonts?.ready;
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>("[data-resume-page]");
      if (el) fit(el);
      document.body.dataset.fitReady = "1";
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

function apply(el: HTMLElement, zoom: number, pages = 1) {
  el.style.zoom = String(zoom);
  el.style.width = `${PAGE_W / zoom}mm`;
  el.style.maxWidth = "none";
  el.style.minWidth = "0";
  el.style.minHeight = `${(PAGE_H * pages) / zoom}mm`;
}

function fit(el: HTMLElement) {
  const pageH = PAGE_H * MM;
  apply(el, 1);
  const height = el.getBoundingClientRect().height;
  if (height <= pageH + 1) return;

  for (let zoom = 0.98; zoom >= MIN_ZOOM - 0.001; zoom -= 0.02) {
    apply(el, zoom);
    if (el.getBoundingClientRect().height <= pageH + 1) return;
  }
  apply(el, 1, Math.ceil(height / pageH));
}
