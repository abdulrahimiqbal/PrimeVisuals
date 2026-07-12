import React, { useMemo, useRef, useState } from "react";
import {
  Compass,
  ExternalLink,
  GitBranch,
  RotateCcw,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { T } from "./core/theme.js";
import {
  buildTheoryIndex,
  getOpenBridges,
  getTheoryNeighborhood,
  relationLabel,
  searchTheoryNodes,
} from "./core/theoryGraph.js";
import { PRIME_THEORY_MAP } from "./data/primeTheoryMap.js";

const VIEW_BOX = { x: -560, y: -500, width: 1120, height: 1000 };
const RING_RADIUS = { 0: 0, 1: 170, 2: 300, 3: 455 };

const LENSES = [
  ["all", "OVERVIEW"],
  ["proved", "PROVED"],
  ["frontier", "OPEN BRIDGES"],
  ["project", "THIS REPO"],
  ["category", "CATEGORY"],
];

function degreesToPoint(degrees, radius) {
  const radians = (degrees * Math.PI) / 180;
  return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius };
}

function wrapLabel(label, max = 19) {
  const words = label.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (!line || `${line} ${word}`.length <= max) line = line ? `${line} ${word}` : word;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  if (lines.length <= 2) return lines;
  return [lines[0], `${lines.slice(1).join(" ").slice(0, max - 1)}…`];
}

function statusColor(node) {
  if (node.mathStatus === "refuted" || ["killed", "graveyard", "superseded"].includes(node.projectStatus)) return T.rose;
  if (["conjecture", "unknown", "heuristic"].includes(node.mathStatus)) return T.amber;
  if (["theorem", "identity", "conditional_theorem"].includes(node.mathStatus)) return T.ion;
  if (["active", "survivor", "parked"].includes(node.projectStatus)) return T.amber;
  return T.slate;
}

function edgeColor(edge) {
  if (edge.status === "refuted") return T.rose;
  if (["candidate", "conjectural", "project"].includes(edge.status)) return T.amber;
  if (edge.status === "conditional") return T.ion;
  return T.slate;
}

function edgeDash(edge) {
  if (edge.status === "refuted") return "3 6";
  if (["candidate", "conjectural", "project"].includes(edge.status)) return "7 6";
  if (edge.status === "analogy") return "2 7";
  if (edge.status === "conditional") return "10 5";
  return undefined;
}

function edgePath(a, b, sameCluster) {
  if (!a || !b) return "";
  if (sameCluster || (!a.x && !a.y) || (!b.x && !b.y)) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const bend = 25;
  const cx = (a.x + b.x) / 2 - (dy / length) * bend;
  const cy = (a.y + b.y) / 2 + (dx / length) * bend;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

function statusLabel(node) {
  const math = node.mathStatus.replaceAll("_", " ");
  if (["not_applicable", "definition"].includes(node.mathStatus)) return node.projectStatus.replaceAll("_", " ");
  return math;
}

function lensFocusIds(graph, lens) {
  if (lens === "all") return null;
  const seed = new Set([graph.meta.centerId]);
  if (lens === "proved") {
    graph.nodes.forEach((node) => {
      if (["definition", "identity", "theorem", "conditional_theorem"].includes(node.mathStatus)) seed.add(node.id);
    });
  } else if (lens === "frontier") {
    getOpenBridges(graph).forEach((edge) => { seed.add(edge.source); seed.add(edge.target); });
  } else if (lens === "project") {
    graph.nodes.forEach((node) => {
      if (node.repoRefs?.length || node.viewName || ["active", "survivor", "parked", "killed"].includes(node.projectStatus)) seed.add(node.id);
    });
  } else if (lens === "category") {
    graph.nodes.filter((node) => node.cluster === "category").forEach((node) => seed.add(node.id));
  }
  const contextual = new Set(seed);
  seed.forEach((id) => getTheoryNeighborhood(graph, id, 1).forEach((neighbor) => contextual.add(neighbor)));
  return contextual;
}

function iconButton(label, Icon, onClick) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="w-8 h-8 rounded-md flex items-center justify-center"
      style={{ background: "rgba(12,15,23,0.9)", border: `1px solid ${T.line}`, color: T.dim }}
    >
      <Icon size={15} />
    </button>
  );
}

export default function TheoryMap({ uiVisible = true, onOpenView }) {
  const graph = PRIME_THEORY_MAP;
  const index = useMemo(() => buildTheoryIndex(graph), [graph]);
  const clusterById = useMemo(() => new Map(graph.clusters.map((cluster) => [cluster.id, cluster])), [graph]);
  const positions = useMemo(() => {
    const result = new Map();
    graph.nodes.forEach((node) => {
      if (node.ring === 0) { result.set(node.id, { x: 0, y: 0 }); return; }
      const cluster = clusterById.get(node.cluster);
      result.set(node.id, degreesToPoint((cluster?.angle || 0) + (node.angleOffset || 0), RING_RADIUS[node.ring]));
    });
    return result;
  }, [clusterById, graph]);

  const [selectedId, setSelectedId] = useState(graph.meta.centerId);
  const [lens, setLens] = useState("all");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(0.94);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const selected = index.nodesById.get(selectedId) || index.nodesById.get(graph.meta.centerId);
  const selectedNeighborhood = useMemo(() => getTheoryNeighborhood(graph, selected.id, 1), [graph, selected.id]);
  const focusIds = useMemo(() => lensFocusIds(graph, lens), [graph, lens]);
  const searchResults = useMemo(() => searchTheoryNodes(graph, query), [graph, query]);
  const searchIds = useMemo(() => new Set(searchResults.map((node) => node.id)), [searchResults]);
  const openBridges = useMemo(() => getOpenBridges(graph, selected.id), [graph, selected.id]);
  const globalOpenBridges = useMemo(() => getOpenBridges(graph), [graph]);
  const resetView = () => { setZoom(0.94); setPan({ x: 0, y: 0 }); };
  const zoomBy = (factor) => setZoom((value) => Math.max(0.62, Math.min(2.35, value * factor)));

  const startPan = (event) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, pan };
    setDragging(true);
  };
  const movePan = (event) => {
    if (!dragRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = VIEW_BOX.width / Math.max(1, rect.width);
    const scaleY = VIEW_BOX.height / Math.max(1, rect.height);
    setPan({
      x: dragRef.current.pan.x + (event.clientX - dragRef.current.x) * scaleX,
      y: dragRef.current.pan.y + (event.clientY - dragRef.current.y) * scaleY,
    });
  };
  const stopPan = () => { dragRef.current = null; setDragging(false); };

  const chooseNode = (id) => setSelectedId(id);
  const prioritizedGlobalBridges = [...globalOpenBridges].sort((a, b) => Number(!!b.question) - Number(!!a.question));
  const localBridges = [...openBridges].sort((a, b) => Number(!!b.question) - Number(!!a.question));
  const bridgeRows = selected.id === graph.meta.centerId
    ? prioritizedGlobalBridges
    : localBridges.length ? localBridges : prioritizedGlobalBridges;

  return (
    <div className={uiVisible ? "flex-1 flex flex-col lg:flex-row min-h-0" : "flex-1 min-h-0"}>
      {uiVisible && (
        <aside
          className="w-full lg:w-80 lg:h-full max-h-[42vh] lg:max-h-none overflow-y-auto p-3 flex-none"
          style={{ borderRight: `1px solid ${T.line}` }}
          aria-label="Prime theory atlas controls"
        >
          <div className="flex items-center gap-2 mb-1">
            <Compass size={16} color={T.ion} />
            <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.16em", color: T.ion }}>PRIME THEORY ATLAS</span>
          </div>
          <div style={{ color: T.dim, fontSize: 11, lineHeight: 1.5 }} className="mb-3">
            Operations, theories, proved bridges, open obligations, and this repo’s live programs in one typed graph.
          </div>

          <label className="relative block mb-3">
            <span className="sr-only">Search the theory atlas</span>
            <Search size={14} aria-hidden="true" className="absolute left-2 top-2.5" color={T.faint} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search theorem, operation, obstruction…"
              className="w-full rounded-md py-2 pr-2 pl-8 text-xs outline-none"
              style={{ background: T.panel2, border: `1px solid ${T.line}`, color: T.ink }}
            />
          </label>

          <div className="flex flex-wrap gap-1 mb-3" aria-label="Atlas lens">
            {LENSES.map(([id, label]) => (
              <button
                type="button"
                key={id}
                onClick={() => setLens(id)}
                aria-pressed={lens === id}
                className="px-2 py-1 rounded-md"
                style={{
                  fontFamily: T.mono,
                  fontSize: 9,
                  letterSpacing: "0.06em",
                  background: lens === id ? T.panel2 : "transparent",
                  border: `1px solid ${lens === id ? T.ion + "66" : T.line}`,
                  color: lens === id ? T.ion : T.dim,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mb-3" style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>
            <span>{graph.nodes.length} nodes</span>
            <span>{graph.edges.length} typed edges</span>
            <span>{globalOpenBridges.length} open</span>
          </div>

          {query.trim() && (
            <div className="mb-3">
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.dim, letterSpacing: "0.14em" }} className="mb-1">MATCHES</div>
              <div className="flex flex-col gap-1">
                {searchResults.slice(0, 7).map((node) => (
                  <button
                    type="button"
                    key={node.id}
                    onClick={() => chooseNode(node.id)}
                    className="text-left rounded-md px-2 py-1"
                    style={{ background: node.id === selected.id ? T.panel2 : "transparent", border: `1px solid ${T.line}`, color: T.ink }}
                  >
                    <span style={{ fontSize: 11 }}>{node.label}</span>
                    <span className="block" style={{ fontFamily: T.mono, fontSize: 8, color: T.faint }}>{node.kind.replaceAll("_", " ")}</span>
                  </button>
                ))}
                {!searchResults.length && <span style={{ fontSize: 11, color: T.faint }}>No mapped node matches yet.</span>}
              </div>
            </div>
          )}

          <div className="rounded-lg p-3" style={{ background: T.panel, border: `1px solid ${statusColor(selected)}55` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: statusColor(selected), letterSpacing: "0.14em" }}>
                  {selected.kind.toUpperCase()} · {statusLabel(selected).toUpperCase()}
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 500, margin: "4px 0 0" }}>{selected.label}</h2>
              </div>
              <span className="rounded-full" aria-hidden="true" style={{ width: 9, height: 9, marginTop: 4, background: statusColor(selected), boxShadow: `0 0 12px ${statusColor(selected)}88` }} />
            </div>
            <p style={{ color: T.dim, fontSize: 11, lineHeight: 1.5, margin: "8px 0 0" }}>{selected.summary}</p>
            {selected.scope && <p style={{ color: T.faint, fontSize: 10, lineHeight: 1.45, margin: "6px 0 0" }}>Scope: {selected.scope}</p>}
            {selected.question && (
              <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${T.line}` }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.amber, letterSpacing: "0.13em" }}>NEXT PROOF OBLIGATION</div>
                <div style={{ color: T.ink, fontSize: 11, lineHeight: 1.5, marginTop: 4 }}>{selected.question}</div>
              </div>
            )}
            {selected.viewName && (
              <button
                type="button"
                onClick={() => onOpenView?.(selected.viewName)}
                className="mt-3 w-full rounded-md px-2 py-1.5 flex items-center justify-center gap-2"
                style={{ background: T.panel2, border: `1px solid ${T.ion}66`, color: T.ion, fontFamily: T.mono, fontSize: 9 }}
              >
                OPEN “{selected.viewName.toUpperCase()}” <ExternalLink size={12} />
              </button>
            )}
            {selected.repoRefs?.length > 0 && (
              <div className="mt-3">
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.faint, letterSpacing: "0.13em" }}>REPO EVIDENCE</div>
                {selected.repoRefs.slice(0, 4).map((ref) => (
                  <div key={ref} className="truncate" title={ref} style={{ fontFamily: T.mono, fontSize: 9, color: T.dim, marginTop: 3 }}>{ref}</div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1 mb-2" style={{ fontFamily: T.mono, fontSize: 9, color: T.dim, letterSpacing: "0.14em" }}>
              <GitBranch size={12} /> OPEN BRIDGES
            </div>
            <div className="flex flex-col gap-1">
              {bridgeRows.slice(0, 6).map((edge) => {
                const source = index.nodesById.get(edge.source);
                const target = index.nodesById.get(edge.target);
                const next = edge.source === selected.id ? edge.target : edge.source;
                return (
                  <button
                    type="button"
                    key={edge.id}
                    onClick={() => chooseNode(next)}
                    className="text-left rounded-md px-2 py-1.5"
                    style={{ background: "transparent", border: `1px solid ${T.line}` }}
                  >
                    <span className="block truncate" style={{ fontFamily: T.mono, fontSize: 8, color: T.amber }}>
                      {source?.label} → {target?.label}
                    </span>
                    <span className="block" style={{ fontSize: 10, color: T.dim, lineHeight: 1.35, marginTop: 2 }}>
                      {edge.question || edge.summary || relationLabel(edge.relation)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4" style={{ fontFamily: T.mono, color: T.faint, fontSize: 8, lineHeight: 1.55 }}>
            Solid = proved or defined · dashed = open or programmatic · dotted = analogy · rose = killed/refuted. Mathematical truth and project lifecycle are separate fields. Updated {graph.meta.updated}.
          </div>
        </aside>
      )}

      <section className="pv-atlas-map relative flex-1 min-h-0" style={{ minHeight: uiVisible ? 440 : "100%", background: T.void }}>
        <div className="absolute top-3 right-3 flex gap-1" style={{ zIndex: 4 }}>
          {iconButton("Zoom out", ZoomOut, () => zoomBy(1 / 1.18))}
          {iconButton("Zoom in", ZoomIn, () => zoomBy(1.18))}
          {iconButton("Reset atlas view", RotateCcw, resetView)}
        </div>

        <svg
          ref={svgRef}
          className="w-full h-full block touch-none"
          viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
          role="img"
          aria-labelledby="prime-theory-map-title prime-theory-map-description"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={stopPan}
          onPointerCancel={stopPan}
          onWheel={(event) => { event.preventDefault(); zoomBy(event.deltaY > 0 ? 1 / 1.08 : 1.08); }}
          onDoubleClick={resetView}
        >
          <title id="prime-theory-map-title">Prime Theory Atlas</title>
          <desc id="prime-theory-map-description">Prime numbers at the center, connected outward to operations, frameworks, proved results, conjectures, programs, and obstructions.</desc>

          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {[170, 300, 455].map((radius, i) => (
              <g key={radius} aria-hidden="true">
                <circle cx="0" cy="0" r={radius} fill="none" stroke={T.line} strokeWidth="1" strokeDasharray={i === 2 ? "3 8" : "2 10"} vectorEffect="non-scaling-stroke" />
                <text x={-radius + 10} y={-8} fill={T.faint} fontFamily={T.mono} fontSize="9" letterSpacing="1.4">
                  {["OPERATIONS", "FRAMEWORKS", "RESULTS · FRONTIERS"][i]}
                </text>
              </g>
            ))}

            {graph.edges.map((edge) => {
              const source = index.nodesById.get(edge.source);
              const target = index.nodesById.get(edge.target);
              const a = positions.get(edge.source);
              const b = positions.get(edge.target);
              const touchesSelection = edge.source === selected.id || edge.target === selected.id;
              const inSelection = selectedNeighborhood.has(edge.source) && selectedNeighborhood.has(edge.target);
              const inFocus = !focusIds || (focusIds.has(edge.source) && focusIds.has(edge.target));
              const queryActive = query.trim();
              const inSearch = !queryActive || searchIds.has(edge.source) || searchIds.has(edge.target);
              const opacity = touchesSelection ? 0.95 : inSelection ? 0.55 : inFocus && inSearch ? 0.24 : 0.055;
              return (
                <path
                  key={edge.id}
                  className="pv-atlas-edge"
                  d={edgePath(a, b, source?.cluster === target?.cluster)}
                  fill="none"
                  stroke={edgeColor(edge)}
                  strokeWidth={touchesSelection ? 2.1 : 1.1}
                  strokeDasharray={edgeDash(edge)}
                  opacity={opacity}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{source?.label} — {relationLabel(edge.relation)} → {target?.label}{edge.question ? ` · ${edge.question}` : ""}</title>
                </path>
              );
            })}

            {graph.nodes.map((node) => {
              const point = positions.get(node.id);
              const isCore = node.id === graph.meta.centerId;
              const isSelected = node.id === selected.id;
              const inSelectedNeighborhood = selectedNeighborhood.has(node.id);
              const inFocus = !focusIds || focusIds.has(node.id);
              const queryActive = query.trim();
              const searchMatch = !queryActive || searchIds.has(node.id);
              const opacity = isSelected ? 1 : inSelectedNeighborhood ? 0.94 : inFocus && searchMatch ? 0.76 : 0.16;
              const color = statusColor(node);
              const width = node.ring === 1 ? 124 : node.ring === 2 ? 154 : 166;
              const height = node.ring === 1 ? 44 : 54;
              const lines = wrapLabel(node.label, node.ring === 1 ? 16 : 21);
              return (
                <g
                  key={node.id}
                  className="pv-atlas-node"
                  role="button"
                  tabIndex="0"
                  aria-label={`${node.label}, ${node.kind}, ${statusLabel(node)}`}
                  transform={`translate(${point.x} ${point.y})`}
                  opacity={opacity}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => { event.stopPropagation(); chooseNode(node.id); }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseNode(node.id); }
                  }}
                >
                  <title>{node.label}: {node.summary}</title>
                  {isSelected && (
                    isCore
                      ? <circle cx="0" cy="0" r="72" fill="none" stroke={color} strokeWidth="2" opacity="0.35" vectorEffect="non-scaling-stroke" />
                      : <rect x={-width / 2 - 6} y={-height / 2 - 6} width={width + 12} height={height + 12} rx="13" fill="none" stroke={color} strokeWidth="2" opacity="0.35" vectorEffect="non-scaling-stroke" />
                  )}
                  {isCore ? (
                    <>
                      <circle className="pv-atlas-node-shape" cx="0" cy="0" r="62" fill={T.panel} stroke={T.ion} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                      <circle cx="0" cy="0" r="50" fill={`${T.ion}0C`} stroke={`${T.ion}44`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      <text textAnchor="middle" fill={T.ion} fontFamily={T.mono} fontSize="10" letterSpacing="1.8" y="-10">CENTER OBJECT</text>
                      <text textAnchor="middle" fill={T.ink} fontFamily={T.sans} fontSize="18" fontWeight="500" y="13">PRIME NUMBERS</text>
                      <text textAnchor="middle" fill={T.dim} fontFamily={T.mono} fontSize="9" y="31">irreducibles in ℤ</text>
                    </>
                  ) : (
                    <>
                      <rect
                        className="pv-atlas-node-shape"
                        x={-width / 2}
                        y={-height / 2}
                        width={width}
                        height={height}
                        rx={node.ring === 1 ? 22 : 10}
                        fill={T.panel}
                        stroke={color}
                        strokeWidth={isSelected ? 2 : 1.2}
                        vectorEffect="non-scaling-stroke"
                      />
                      <text textAnchor="middle" fill={color} fontFamily={T.mono} fontSize="7.5" letterSpacing="1.15" y={lines.length === 1 ? -8 : -13}>
                        {node.kind.replaceAll("_", " ").toUpperCase()}
                      </text>
                      <text textAnchor="middle" fill={T.ink} fontFamily={T.sans} fontSize="12.5" fontWeight="500">
                        {lines.map((line, i) => <tspan key={line} x="0" y={(lines.length === 1 ? 9 : 3) + i * 14}>{line}</tspan>)}
                      </text>
                      <circle cx={width / 2 - 10} cy={-height / 2 + 10} r="3.2" fill={color} />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <div
          className="absolute bottom-3 left-3 rounded-md px-2 py-1"
          style={{ background: "rgba(7,8,15,0.82)", border: `1px solid ${T.line}`, color: T.faint, fontFamily: T.mono, fontSize: 9 }}
        >
          click a node to trace its neighborhood · drag to pan · scroll to zoom
        </div>
      </section>
    </div>
  );
}
