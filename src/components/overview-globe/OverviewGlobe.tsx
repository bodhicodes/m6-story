/**
 * OverviewGlobe.tsx — Large hero globe showing ALL ecosystem tipping points
 * at once, with labels and color-coded regions.
 *
 * DESIGN INSPIRATION:
 * The NYT article opens with a single large globe that shows every tipping
 * point labeled on it — permafrost, Greenland ice, coral, rainforest,
 * monsoon, currents — all visible at once. This gives readers the big
 * picture before diving into individual sections.
 *
 * We replicate this with a slowly auto-rotating globe that displays all
 * five ecosystem hotspots simultaneously, each in its own accent color
 * with a floating label.
 *
 * IMPLEMENTATION:
 * - Uses a larger canvas (600px) for visual impact
 * - Slowly rotates to show all regions
 * - Each ecosystem gets its own colored dots + label
 * - Labels are drawn on the canvas (not DOM) to move with the globe
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
import { ecosystems } from "~/data/ecosystems";

export const OverviewGlobe = component$(() => {
  const canvasRef = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {

    const canvas = canvasRef.value;
    if (!canvas) return;

    const size = 600;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // ── Projection ──────────────────────────────────────────────
    const projection = geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(size / 2.2)
      .clipAngle(90)
      .rotate([-20, -20]); // Start showing Atlantic/Africa view

    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();

    // ── Pre-generate dots for each ecosystem ────────────────────
    const rng = mulberry32(99);
    const ecosystemDots = ecosystems.map((eco) => {
      const [[w, s], [e, n]] = eco.globe.highlightBounds;
      const dots: [number, number][] = [];
      const count = 15;
      for (let i = 0; i < count; i++) {
        dots.push([w + rng() * (e - w), s + rng() * (n - s)]);
      }
      return { ...eco, dots };
    });

    // ── Load world data ─────────────────────────────────────────
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

        // ── Slow auto-rotation ──────────────────────────────────
        let rotation = -20;
        const rotationSpeed = 0.08; // degrees per frame

        function draw() {
          if (!ctx) return;

          rotation += rotationSpeed;
          projection.rotate([rotation, -20]);

          ctx.clearRect(0, 0, size, size);

          // 1. Globe sphere
          ctx.beginPath();
          path({ type: "Sphere" });
          ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
          ctx.fill();

          // 2. Outer glow
          ctx.beginPath();
          path({ type: "Sphere" });
          ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
          ctx.lineWidth = 1;
          ctx.shadowColor = "rgba(100, 116, 139, 0.3)";
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 3. Graticule
          ctx.beginPath();
          path(graticule);
          ctx.strokeStyle = "rgba(148, 163, 184, 0.06)";
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // 4. Land
          ctx.beginPath();
          path(land);
          ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
          ctx.fill();

          ctx.beginPath();
          path(countries);
          ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
          ctx.lineWidth = 0.3;
          ctx.stroke();

          // 5. Ecosystem hotspots — all five at once
          for (const eco of ecosystemDots) {
            // Radial glow
            const centerProj = projection(eco.globe.center);
            if (centerProj) {
              const dist = d3.geoDistance(
                eco.globe.center,
                [-(rotation), 20],
              );
              if (dist < Math.PI / 2) {
                const gradient = ctx.createRadialGradient(
                  centerProj[0], centerProj[1], 0,
                  centerProj[0], centerProj[1], size / 6,
                );
                gradient.addColorStop(0, eco.globe.color + "25");
                gradient.addColorStop(1, "transparent");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, size, size);
              }
            }

            // Dots
            for (const [lon, lat] of eco.dots) {
              const projected = projection([lon, lat]);
              if (projected) {
                const dist = d3.geoDistance(
                  [lon, lat],
                  [-(rotation), 20],
                );
                if (dist < Math.PI / 2) {
                  // Halo
                  ctx.beginPath();
                  ctx.arc(projected[0], projected[1], 4, 0, 2 * Math.PI);
                  ctx.fillStyle = eco.globe.color + "18";
                  ctx.fill();
                  // Dot
                  ctx.beginPath();
                  ctx.arc(projected[0], projected[1], 1.5, 0, 2 * Math.PI);
                  ctx.fillStyle = eco.globe.color;
                  ctx.shadowColor = eco.globe.color;
                  ctx.shadowBlur = 6;
                  ctx.fill();
                  ctx.shadowBlur = 0;
                }
              }
            }

            // Label at ecosystem center
            if (centerProj) {
              const dist = d3.geoDistance(
                eco.globe.center,
                [-(rotation), 20],
              );
              if (dist < Math.PI / 2.5) {
                // Fade labels near the edge
                const alpha = Math.max(0, 1 - dist / (Math.PI / 2.5));
                ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
                ctx.fillStyle = eco.globe.color;
                ctx.globalAlpha = alpha * 0.9;
                ctx.textAlign = "center";

                // Label with uppercase name
                const label = eco.name.toUpperCase();
                ctx.fillText(label, centerProj[0], centerProj[1] - 14);

                ctx.globalAlpha = 1;
              }
            }
          }

          requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);
      });
  }, { strategy: 'document-ready' });

  return (
    <section class="relative flex flex-col items-center justify-center py-6 px-4">
      {/* ── Globe ───────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        class="w-full max-w-[480px] h-auto"
        aria-label="Overview globe showing all five ecosystem tipping points"
        role="img"
      />

      {/* ── Legend below the globe ───────────────────────────────── */}
      <div class="flex flex-wrap justify-center gap-6 mt-8 max-w-lg">
        {ecosystems.map((eco) => (
          <a
            key={eco.id}
            href={`#${eco.id}`}
            class="flex items-center gap-2 group"
          >
            <div
              class="w-2.5 h-2.5 rounded-full group-hover:scale-125 transition-transform"
              style={{
                backgroundColor: eco.globe.color,
                boxShadow: `0 0 8px ${eco.globe.color}`,
              }}
            />
            <span class="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
              {eco.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
});

// ---------------------------------------------------------------------------
// Seeded RNG for deterministic dot placement
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
