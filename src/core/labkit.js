/* LAB — defaults, node palette, graph→formula compiler, templates. */

export const DEFAULT_LAB = {
  domain: "real",            // 'int' | 'prime' | 'real' | 'complex'
  N: 6000, tMax: 60, sMax: 1.6,
  ex: "n", ey: "0", eh: "",
  ew: "s",
  a: 0.5, b: 2.399,
};
export const withLabDefaults = (l) => ({ ...DEFAULT_LAB, ...(l || {}) });

export const LAB_LIBRARY = [
  { name: "σ off the line", lab: { domain: "real", tMax: 60, ex: "t", ey: "abs(zeta(a+i*t))", eh: "arg(zeta(a+i*t))", a: 0.5 } },
  { name: "Pirouette off-line", lab: { domain: "real", tMax: 34, ex: "re(zeta(a+i*t))", ey: "im(zeta(a+i*t))", eh: "t", a: 0.5 } },
  { name: "ζ domain coloring", lab: { domain: "complex", tMax: 45, sMax: 1.6, ew: "zeta(s)" } },
  { name: "Moiré dot field", lab: { domain: "int", N: 6000, ex: "n*cos(a*n)", ey: "n*sin(a*n)", eh: "dot(exp(i*a*n), exp(i*b*n))", a: 1, b: 2.399 } },
];

export const NODE_PALETTE = [
  { id: "src-n", group: "Domains", kind: "source", label: "integer n", params: { expr: "n" } },
  { id: "src-t", group: "Domains", kind: "source", label: "real t", params: { expr: "t" } },
  { id: "src-s", group: "Domains", kind: "source", label: "complex s", params: { expr: "s" } },
  { id: "custom", group: "Expressions", kind: "custom", label: "custom expr", params: { expr: "n" } },
  { id: "const", group: "Expressions", kind: "const", label: "constant", params: { value: "1" } },
  { id: "knob-a", group: "Expressions", kind: "knob", label: "knob a", params: { name: "a" } },
  { id: "knob-b", group: "Expressions", kind: "knob", label: "knob b", params: { name: "b" } },
  ...["sin", "cos", "exp", "log", "sqrt", "abs", "arg", "re", "im", "zeta", "mu", "M", "isprime", "pi", "gap", "omega", "bigomega", "tau", "phi", "rad"].map((fn) => ({
    id: `fn-${fn}`, group: "Functions", kind: "unary", label: fn, params: { fn },
  })),
  { id: "op-add", group: "Operators", kind: "binary", label: "add", params: { op: "+" } },
  { id: "op-sub", group: "Operators", kind: "binary", label: "subtract", params: { op: "-" } },
  { id: "op-mul", group: "Operators", kind: "binary", label: "multiply", params: { op: "*" } },
  { id: "op-div", group: "Operators", kind: "binary", label: "divide", params: { op: "/" } },
  { id: "op-pow", group: "Operators", kind: "binary", label: "power", params: { op: "^" } },
  { id: "op-mod", group: "Operators", kind: "binary", label: "mod", params: { op: "mod" } },
  { id: "chan-x", group: "Visual Channels", kind: "channel", label: "x position", params: { channel: "x" } },
  { id: "chan-y", group: "Visual Channels", kind: "channel", label: "y position", params: { channel: "y" } },
  { id: "chan-hue", group: "Visual Channels", kind: "channel", label: "color hue", params: { channel: "hue" } },
  { id: "chan-w", group: "Visual Channels", kind: "channel", label: "complex field w", params: { channel: "w" } },
];

export const paletteById = Object.fromEntries(NODE_PALETTE.map((d) => [d.id, d]));
export const NODE_INPUTS = { unary: ["value"], binary: ["left", "right"], channel: ["value"] };
export const BINARY_SYMBOLS = new Set(["+", "-", "*", "/", "^"]);
let graphNodeSeq = 0;

export function gnode(id, kind, label, x, y, params = {}) { return { id, kind, label, x, y, params }; }
export function gedge(from, to, toPort = "value") { return { id: `${from}->${to}:${toPort}`, from, to, toPort }; }
export function graphTemplate(name, domain, lab, nodes, edges) { return { name, graph: { domain, nodes, edges }, lab: withLabDefaults({ domain, ...lab }) }; }
export function cloneGraph(g) { return JSON.parse(JSON.stringify(g)); }
export function createNodeFromPalette(defId, x, y) {
  const def = paletteById[defId] || paletteById.custom;
  graphNodeSeq++;
  return { id: `${def.kind}-${graphNodeSeq}`, kind: def.kind, label: def.label, x, y, params: { ...(def.params || {}) } };
}
export function nodeInputPorts(node) { return NODE_INPUTS[node.kind] || []; }
export function nextInputPort(graph, node) {
  const ports = nodeInputPorts(node);
  if (!ports.length) return "value";
  const used = new Set(graph.edges.filter((e) => e.to === node.id).map((e) => e.toPort));
  return ports.find((p) => !used.has(p)) || ports[ports.length - 1];
}
export function channelLabel(ch) {
  return ch === "x" ? "x" : ch === "y" ? "y" : ch === "hue" ? "hue" : "w";
}
export function compileNodeExpr(id, graph, seen = new Set()) {
  const node = graph.nodes.find((n) => n.id === id);
  if (!node) throw new Error("missing node");
  if (seen.has(id)) throw new Error("cycle in graph");
  seen.add(id);
  const incoming = (port) => graph.edges.find((e) => e.to === id && e.toPort === port);
  const compileFrom = (edge) => edge ? compileNodeExpr(edge.from, graph, new Set(seen)) : null;
  if (node.kind === "source" || node.kind === "custom") return node.params.expr || "n";
  if (node.kind === "const") return String(node.params.value || "0");
  if (node.kind === "knob") return node.params.name === "b" ? "b" : "a";
  if (node.kind === "unary") {
    const v = compileFrom(incoming("value")) || "n";
    return `${node.params.fn || node.label}(${v})`;
  }
  if (node.kind === "binary") {
    const a = compileFrom(incoming("left")) || "n";
    const b = compileFrom(incoming("right")) || "a";
    const op = node.params.op || "+";
    return BINARY_SYMBOLS.has(op) ? `(${a}${op}${b})` : `${op}(${a},${b})`;
  }
  return node.params.expr || "n";
}
export function compileGraphToLab(graph) {
  const domain = graph.domain || "int";
  const out = { domain };
  const channelNodes = graph.nodes.filter((n) => n.kind === "channel");
  channelNodes.forEach((node) => {
    const edge = graph.edges.find((e) => e.to === node.id && e.toPort === "value");
    if (!edge) return;
    const expr = compileNodeExpr(edge.from, graph);
    const ch = node.params.channel;
    if (ch === "x") out.ex = expr;
    if (ch === "y") out.ey = expr;
    if (ch === "hue") out.eh = expr;
    if (ch === "w") out.ew = expr;
  });
  if (domain === "complex") {
    out.ew = out.ew || "s";
  } else {
    const dv = domain === "real" ? "t" : "n";
    out.ex = out.ex || dv;
    out.ey = out.ey || "0";
    out.eh = out.eh || "";
  }
  return out;
}

export const LAB_TEMPLATES = [
  graphTemplate("Blank canvas", "int", { N: 6000, ex: "n", ey: "0", eh: "" }, [
    gnode("n", "source", "integer n", 22, 40, { expr: "n" }),
    gnode("zero", "const", "zero", 22, 140, { value: "0" }),
    gnode("x", "channel", "x position", 210, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 210, 140, { channel: "y" }),
    gnode("hue", "channel", "color hue", 210, 240, { channel: "hue" }),
  ], [gedge("n", "x"), gedge("zero", "y")]),
  graphTemplate("Prime spiral", "int", { N: 9000, a: 1, b: 2.399 }, [
    gnode("xexpr", "custom", "spiral x", 22, 36, { expr: "n*cos(a*n)" }),
    gnode("yexpr", "custom", "spiral y", 22, 128, { expr: "n*sin(a*n)" }),
    gnode("prime", "custom", "prime test", 22, 220, { expr: "isprime(n)" }),
    gnode("x", "channel", "x position", 214, 36, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 128, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 220, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("yexpr", "y"), gedge("prime", "hue")]),
  graphTemplate("Mertens relation", "int", { N: 12000 }, [
    gnode("xexpr", "custom", "integer axis", 22, 40, { expr: "n" }),
    gnode("mertens", "custom", "M(n)", 22, 136, { expr: "M(n)" }),
    gnode("mu", "custom", "mu(n)", 22, 232, { expr: "mu(n)" }),
    gnode("x", "channel", "x position", 214, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 136, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 232, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("mertens", "y"), gedge("mu", "hue")]),
  graphTemplate("Prime gap skyline", "int", { N: 12000 }, [
    gnode("xexpr", "custom", "integer axis", 22, 40, { expr: "n" }),
    gnode("gap", "custom", "gap(n)", 22, 136, { expr: "gap(n)" }),
    gnode("x", "channel", "x position", 214, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 136, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 232, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("gap", "y"), gedge("gap", "hue")]),
  graphTemplate("Totient garden", "int", { N: 10000, a: 0.25 }, [
    gnode("xexpr", "custom", "rotated n", 22, 40, { expr: "n*cos(a*n)" }),
    gnode("totient", "custom", "phi(n)", 22, 136, { expr: "phi(n)" }),
    gnode("rad", "custom", "rad(n)", 22, 232, { expr: "rad(n)" }),
    gnode("x", "channel", "x position", 214, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 136, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 232, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("totient", "y"), gedge("rad", "hue")]),
  graphTemplate("Riemann hypothesis", "real", { tMax: 60, a: 0.5 }, [
    gnode("xexpr", "custom", "height t", 22, 40, { expr: "t" }),
    gnode("absz", "custom", "|zeta|", 22, 136, { expr: "abs(zeta(0.5+i*t))" }),
    gnode("argz", "custom", "arg zeta", 22, 232, { expr: "arg(zeta(0.5+i*t))" }),
    gnode("x", "channel", "x position", 214, 40, { channel: "x" }),
    gnode("y", "channel", "y position", 214, 136, { channel: "y" }),
    gnode("hue", "channel", "color hue", 214, 232, { channel: "hue" }),
  ], [gedge("xexpr", "x"), gedge("absz", "y"), gedge("argz", "hue")]),
  graphTemplate("Zeta field", "complex", { tMax: 45, sMax: 1.6 }, [
    gnode("zeta", "custom", "zeta(s)", 24, 96, { expr: "zeta(s)" }),
    gnode("w", "channel", "complex field w", 220, 96, { channel: "w" }),
  ], [gedge("zeta", "w")]),
];
