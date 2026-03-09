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

      {/* ── Right-side links ─────────────────────────────────────── */}
      <div class="flex items-center gap-5">
        <a
          href="/about"
          class="text-sm text-slate-400 hover:text-white transition-colors"
        >
          About
        </a>
        <a
          href="https://github.com/bodhicodes/m6-story"
          target="_blank"
          rel="noopener noreferrer"
          class="text-slate-500 hover:text-white transition-colors"
          aria-label="View source on GitHub"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
          </svg>
        </a>
        <a
          href="https://www.terra.do/studio"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block"
        >
          Terra Studio
        </a>
      </div>
      </div>
    </nav>
  );
});
