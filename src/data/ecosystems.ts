/**
 * ecosystems.ts — Core data for the "Vanishing Earth" scrollytelling piece.
 *
 * Each ecosystem entry mirrors the structure of the NYT tipping-points article:
 * a narrative section with a D3 globe visualization, a threshold/range bar,
 * and key statistics. Data sourced from IPBES, IUCN, WWF Living Planet Report,
 * and peer-reviewed literature (citations in comments).
 *
 * Students: This file is the single source of truth for all section content.
 * To add a new ecosystem, copy an existing entry and update the fields.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EcosystemThreshold {
  /** Human-readable label for the bar, e.g. "Area lost" */
  label: string;
  /** Current observed value (0–100 scale) */
  currentValue: number;
  /** Estimated tipping-point range [low, high] (0–100 scale) */
  tippingRange: [number, number];
  /** Unit shown on the bar, e.g. "% lost" */
  unit: string;
}

export interface EcosystemStat {
  label: string;
  value: string;
}

export interface GlobeConfig {
  /** [longitude, latitude] center point for the orthographic projection */
  center: [number, number];
  /** Accent color used for region highlights and glow effects (hex) */
  color: string;
  /** Secondary glow color for ambient lighting */
  glowColor: string;
  /**
   * GeoJSON-compatible region coordinates to highlight.
   * We use simple bounding boxes here — keep it lightweight for students.
   * Format: [[west, south], [east, north]]
   */
  highlightBounds: [[number, number], [number, number]];
}

export interface Ecosystem {
  /** Unique slug used for scroll anchoring and keys */
  id: string;
  /** Display title, e.g. "Coral Reefs" */
  name: string;
  /** One-line subtitle shown below the title */
  subtitle: string;
  /** Narrative paragraphs — keep to 2-3 for pacing */
  paragraphs: string[];
  /** Globe rotation & highlight config */
  globe: GlobeConfig;
  /** Threshold/range bar data */
  threshold: EcosystemThreshold;
  /** Key stats shown as callout numbers */
  stats: EcosystemStat[];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const ecosystems: Ecosystem[] = [
  // ── Coral Reefs ──────────────────────────────────────────────────────────
  // Sources: IPBES 2019, Hughes et al. 2018 (Nature), GCRMN 2021
  {
    id: "coral-reefs",
    name: "Coral Reefs",
    subtitle: "The rainforests of the sea are bleaching to death",
    paragraphs: [
      "Coral reefs support roughly a quarter of all marine species while covering less than one percent of the ocean floor. They are among the most sensitive ecosystems on Earth — even half a degree of excess warming can trigger mass bleaching events that turn vibrant reefs into bone-white graveyards.",
      "Between 2023 and 2024, the world experienced its fourth global bleaching event, the most extensive ever recorded. Over 77 percent of reef areas worldwide experienced bleaching-level heat stress. Scientists warn that at 1.5°C of warming, 70 to 90 percent of reefs could vanish; at 2°C, the loss approaches 99 percent.",
      "The collapse of reef systems would unravel food webs that half a billion people depend on for protein and livelihood, while exposing coastlines to the full force of storm surges that reefs currently buffer.",
    ],
    globe: {
      center: [150, -18], // Great Barrier Reef, Australia
      color: "#FF6B35", // Warm coral orange
      glowColor: "#FF8C61",
      highlightBounds: [
        [100, -30],
        [180, 10],
      ], // Indo-Pacific coral triangle
    },
    threshold: {
      label: "Reef area under severe threat",
      currentValue: 50,
      tippingRange: [70, 90],
      unit: "% degraded",
    },
    stats: [
      { label: "Marine species supported", value: "25%" },
      { label: "People dependent on reefs", value: "500M" },
      { label: "Reef area bleached (2024)", value: "77%" },
    ],
  },

  // ── Amazon Rainforest ────────────────────────────────────────────────────
  // Sources: Lovejoy & Nobre 2018 (Science Advances), INPE deforestation data
  {
    id: "amazon-rainforest",
    name: "Amazon Rainforest",
    subtitle: "The planet's lungs are approaching a point of no return",
    paragraphs: [
      "The Amazon generates up to half of its own rainfall through a vast recycling loop: trees pump moisture into the atmosphere, which falls again as rain hundreds of miles downwind. Deforestation breaks this cycle. Remove enough forest and the remainder dries out, fires spread, and the world's largest tropical rainforest begins converting into degraded savanna.",
      "Scientists estimate the tipping point arrives when 20 to 25 percent of the original forest is cleared. As of 2024, roughly 17 percent has been lost — and another 17 percent is significantly degraded. Parts of the southeastern Amazon have already flipped from carbon sink to carbon source.",
      "The Amazon stores an estimated 150 to 200 billion tonnes of carbon. Its collapse would release decades' worth of human emissions in a geological instant, accelerating warming worldwide.",
    ],
    globe: {
      center: [-62, -5], // Central Amazon
      color: "#2D6A4F", // Deep forest green
      glowColor: "#52B788",
      highlightBounds: [
        [-80, -20],
        [-45, 5],
      ], // Amazon basin
    },
    threshold: {
      label: "Original forest cleared",
      currentValue: 17,
      tippingRange: [20, 25],
      unit: "% deforested",
    },
    stats: [
      { label: "Carbon stored", value: "150–200 Gt" },
      { label: "Species found here", value: "10%" },
      { label: "Own rainfall generated", value: "~50%" },
    ],
  },

  // ── Arctic Sea Ice ───────────────────────────────────────────────────────
  // Sources: NSIDC, IPCC AR6 WG1, Notz & Stroeve 2016 (Science)
  {
    id: "arctic-sea-ice",
    name: "Arctic Sea Ice",
    subtitle: "The white shield that keeps the planet cool is vanishing",
    paragraphs: [
      "Arctic sea ice acts as a giant mirror, reflecting up to 80 percent of incoming sunlight back to space. As it melts, the dark ocean beneath absorbs that energy instead, creating a feedback loop that accelerates warming far beyond the Arctic. This phenomenon — ice-albedo feedback — is a key reason the Arctic is warming nearly four times faster than the global average.",
      "September sea-ice extent has declined by roughly 13 percent per decade since satellite records began in 1979. Multiple climate models now project ice-free Arctic summers as early as the 2030s — even under moderate emission scenarios. The 2024 minimum was among the lowest on record.",
      "The loss of Arctic ice reshapes weather patterns across the Northern Hemisphere, destabilizes permafrost, threatens polar ecosystems, and opens feedback loops that make further warming increasingly difficult to reverse.",
    ],
    globe: {
      center: [0, 90], // North Pole
      color: "#48CAE4", // Glacial cyan
      glowColor: "#90E0EF",
      highlightBounds: [
        [-180, 66],
        [180, 90],
      ], // Arctic circle
    },
    threshold: {
      label: "Summer ice volume lost since 1979",
      currentValue: 75,
      tippingRange: [80, 95],
      unit: "% volume lost",
    },
    stats: [
      { label: "Warming rate vs global avg", value: "4×" },
      { label: "Decline per decade", value: "13%" },
      { label: "Ice-free summers projected", value: "~2030s" },
    ],
  },

  // ── Mangroves & Coastal Wetlands ─────────────────────────────────────────
  // Sources: Global Mangrove Watch, IUCN Red List of Ecosystems, Friess et al. 2019
  {
    id: "mangroves",
    name: "Mangroves & Wetlands",
    subtitle: "Earth's coastal armor is being stripped away",
    paragraphs: [
      "Mangrove forests form a living barrier between land and sea, absorbing wave energy, trapping sediment, and storing up to four times more carbon per hectare than tropical rainforests. They are nurseries for fish, shelters for biodiversity, and the first line of defense for hundreds of millions of coastal people during storms.",
      "Since the 1980s, over 35 percent of the world's mangroves have been lost — cleared for aquaculture, coastal development, and agriculture. Although the rate of loss has slowed in some regions, other coastal wetlands including salt marshes and seagrass meadows continue to decline at alarming rates.",
      "When mangroves are destroyed, the carbon locked in their dense, waterlogged soils is released. The loss of a single hectare of mangrove can emit as much carbon as three to five hectares of tropical forest cleared on dry land.",
    ],
    globe: {
      center: [90, 10], // Sundarbans / Southeast Asia
      color: "#1B7A5A", // Deep teal-green
      glowColor: "#40916C",
      highlightBounds: [
        [60, -15],
        [130, 25],
      ], // South & Southeast Asia coastlines
    },
    threshold: {
      label: "Global mangrove area lost",
      currentValue: 35,
      tippingRange: [40, 60],
      unit: "% destroyed",
    },
    stats: [
      { label: "Carbon storage vs rainforest", value: "4×" },
      { label: "Coastal people protected", value: "100M+" },
      { label: "Fish species nurseries", value: "75%" },
    ],
  },

  // ── Grasslands & Savannas ────────────────────────────────────────────────
  // Sources: WWF Plowprint Report, IPBES Land Degradation Assessment 2018
  {
    id: "grasslands",
    name: "Grasslands & Savannas",
    subtitle: "The world's most converted biome hides in plain sight",
    paragraphs: [
      "Grasslands and savannas once covered roughly 40 percent of Earth's land surface. They are among the most productive ecosystems on the planet — their deep root systems store vast amounts of carbon underground, their soils filter water, and they support megafauna migrations that have shaped landscapes for millions of years.",
      "Yet grasslands are the world's most imperiled and least protected biome. In North America alone, the Great Plains lose roughly 1.6 million acres per year to crop conversion. Across Africa, savanna ecosystems face compounding pressures from agricultural expansion, overgrazing, and shifting rainfall patterns driven by climate change.",
      "Unlike forests, which can regrow from a clear-cut, grassland soils take centuries to rebuild once plowed. When these carbon-rich soils are broken, the carbon accumulated over millennia oxidizes and enters the atmosphere within years.",
    ],
    globe: {
      center: [25, 0], // East African savannas
      color: "#E09F3E", // Warm savanna gold
      glowColor: "#F0C75E",
      highlightBounds: [
        [-10, -35],
        [55, 15],
      ], // Sub-Saharan Africa
    },
    threshold: {
      label: "Original grassland converted",
      currentValue: 50,
      tippingRange: [55, 70],
      unit: "% converted",
    },
    stats: [
      { label: "Earth's land surface", value: "40%" },
      { label: "Great Plains lost/year", value: "1.6M acres" },
      { label: "Soil carbon rebuild time", value: "Centuries" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper — color palette for the summary section
// ---------------------------------------------------------------------------

/** Quick lookup: ecosystem id → accent color */
export const ecosystemColors: Record<string, string> = Object.fromEntries(
  ecosystems.map((e) => [e.id, e.globe.color]),
);
