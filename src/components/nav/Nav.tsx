/**
 * Nav.tsx — Fixed top navigation bar with Terra.do logo and link.
 *
 * DESIGN:
 * A minimal, transparent nav that sits over the dark background.
 * Backdrop blur kicks in as the user scrolls. Terra.do logo on the
 * left, a subtle "About Terra Studio" link on the right.
 */

import { component$ } from "@builder.io/qwik";

export const Nav = component$(() => {
  return (
    <nav class="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/50">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
      {/* ── Terra.do logo (left) ────────────────────────────────── */}
      <a
        href="https://terra.do"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
      >
        <img
          src="/data/assets/logos/Terra.do Logo.webp"
          alt="Terra.do"
          class="h-8"
          width="120"
          height="32"
        />
      </a>

      {/* ── About Terra Studio link (right) ─────────────────────── */}
      <a
        href="https://www.terra.do/studio"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-slate-400 hover:text-white transition-colors"
      >
        About Terra Studio
      </a>
      </div>
    </nav>
  );
});
