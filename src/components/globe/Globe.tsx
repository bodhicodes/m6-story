/**
 * Globe.tsx — D3 orthographic projection rendered on an HTML Canvas.
 *
 * HOW IT WORKS:
 * 1. We use D3's orthographic projection to render a 3D-looking globe.
 * 2. The globe rotates to center on the ecosystem's coordinates.
 * 3. A highlighted bounding-box region glows in the ecosystem's accent color.
 * 4. Land masses are drawn with subtle outlines on a dark background.
 * 5. A graticule (grid lines) adds depth and a "scientific" feel.
 *
 * WHY CANVAS (not SVG)?
 * Canvas is faster for the kind of full-redraw rendering we do here.
 * Globe rotation animations are smoother on Canvas. SVG would create
 * hundreds of DOM nodes for country paths, which is expensive.
 *
 * QWIK NOTES:
 * - `useVisibleTask$` runs only in the browser (never on the server).
 *   This is critical because D3 needs access to the DOM/Canvas API.
 * - `useSignal` gives us a reactive ref to the <canvas> element.
 */

import {
  component$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoGraticule10 } from "d3-geo";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GlobeProps {
  /** [longitude, latitude] — where to center the globe */
  center: [number, number];
  /** Hex color for the highlighted region */
  color: string;
  /** Hex color for the glow effect */
  glowColor: string;
  /** Bounding box to highlight: [[west, south], [east, north]] */
  highlightBounds: [[number, number], [number, number]];
  /** Whether the globe is currently visible (triggers entrance animation) */
  isVisible?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Globe = component$<GlobeProps>((props) => {
  const canvasRef = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    // Re-run when visibility changes (triggers entrance animation)
    track(() => props.isVisible);

    const canvas = canvasRef.value;
    if (!canvas) return;

    const size = 480; // logical pixel size (CSS scales it responsively)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // ── Projection setup ──────────────────────────────────────────────
    const projection = geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(size / 2.2)
      .clipAngle(90); // only show the front hemisphere

    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();

    // ── Load world topology data ──────────────────────────────────────
    fetch("/data/world-110m.json")
      .then((res) => res.json())
      .then((world: Topology) => {
        const land = topojson.feature(
          world,
          world.objects.land as any,
        ) as any;
        const countries = topojson.feature(
          world,
          world.objects.countries as any,
        ) as any;

        // Bounding box for the highlight region
        const [[w, s], [e, n]] = props.highlightBounds;

        // Pre-generate scattered dot positions within the region
        // using a seeded RNG for deterministic placement across renders
        const rng = mulberry32(42);
        const dotCount = 30;
        const dots: [number, number][] = [];
        for (let i = 0; i < dotCount; i++) {
          dots.push([w + rng() * (e - w), s + rng() * (n - s)]);
        }

        // ── Animation: rotate globe to target center ────────────────
        // Start from a neutral position and smoothly rotate
        const startRotation: [number, number] = [0, -20];
        const endRotation: [number, number] = [
          -props.center[0],
          -props.center[1],
        ];
        const duration = props.isVisible ? 1200 : 0;
        const startTime = performance.now();

        function draw(currentTime: number) {
          if (!ctx) return;

          // Interpolate rotation
          const elapsed = currentTime - startTime;
          const t = Math.min(elapsed / Math.max(duration, 1), 1);
          // Ease-out cubic for smooth deceleration
          const eased = 1 - Math.pow(1 - t, 3);

          const rotation: [number, number] = [
            startRotation[0] +
              (endRotation[0] - startRotation[0]) * eased,
            startRotation[1] +
              (endRotation[1] - startRotation[1]) * eased,
          ];
          projection.rotate([rotation[0], rotation[1]]);

          // Clear canvas
          ctx.clearRect(0, 0, size, size);

          // ── 1. Globe background (dark sphere) ───────────────────
          ctx.beginPath();
          path({ type: "Sphere" });
          ctx.fillStyle = "rgba(15, 23, 42, 0.6)"; // slate-900 translucent
          ctx.fill();

          // ── 2. Outer glow effect ────────────────────────────────
          ctx.beginPath();
          path({ type: "Sphere" });
          ctx.strokeStyle = props.glowColor;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = props.glowColor;
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.shadowBlur = 0; // reset

          // ── 3. Graticule (grid lines for depth) ─────────────────
          ctx.beginPath();
          path(graticule);
          ctx.strokeStyle = "rgba(148, 163, 184, 0.08)"; // very subtle
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // ── 4. Land masses ──────────────────────────────────────
          ctx.beginPath();
          path(land);
          ctx.fillStyle = "rgba(148, 163, 184, 0.15)"; // subtle land fill
          ctx.fill();

          // Country borders
          ctx.beginPath();
          path(countries);
          ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // ── 5. Soft radial glow at the ecosystem center ──────────
          // Instead of a hard rectangular region, we paint a soft
          // radial glow centered on the ecosystem's location.
          const centerProjected = projection(props.center);
          if (centerProjected) {
            const gradient = ctx.createRadialGradient(
              centerProjected[0],
              centerProjected[1],
              0,
              centerProjected[0],
              centerProjected[1],
              size / 3.5,
            );
            gradient.addColorStop(0, props.color + "30"); // ~19% opacity
            gradient.addColorStop(0.6, props.color + "15"); // ~8% opacity
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
          }

          // ── 6. Glowing dots scattered across the region ───────
          // Scattered data points create the NYT "hotspot" aesthetic.
          // Each dot has a subtle glow halo for the dark-theme look.
          for (let i = 0; i < dots.length; i++) {
            const [lon, lat] = dots[i];
            const projected = projection([lon, lat]);
            if (projected) {
              // Only draw dots on the visible hemisphere
              const dist = d3.geoDistance(
                [lon, lat],
                [-rotation[0], -rotation[1]],
              );
              if (dist < Math.PI / 2) {
                // Outer glow halo
                ctx.beginPath();
                ctx.arc(projected[0], projected[1], 5, 0, 2 * Math.PI);
                ctx.fillStyle = props.color + "20"; // faint halo
                ctx.fill();

                // Inner bright dot
                ctx.beginPath();
                ctx.arc(projected[0], projected[1], 2, 0, 2 * Math.PI);
                ctx.fillStyle = props.color;
                ctx.shadowColor = props.color;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            }
          }

          // Continue animation until complete
          if (t < 1) {
            requestAnimationFrame(draw);
          }
        }

        requestAnimationFrame(draw);
      });
  });

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={480}
      class="mx-auto w-full max-w-[480px] h-auto"
      aria-label="Interactive globe showing ecosystem location"
      role="img"
    />
  );
});

// ---------------------------------------------------------------------------
// Utility: Seeded random number generator (Mulberry32)
// Ensures dot positions are deterministic across renders.
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
