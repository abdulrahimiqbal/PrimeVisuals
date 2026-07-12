/* Pure graph helpers for the Prime Theory Map. The data stays declarative;
   this module owns validation, indexing, search, and traversal only. */

const NODE_KINDS = new Set([
  "universe", "object", "operation", "observable", "statement",
  "framework", "obstruction", "program", "instrument", "evidence",
]);

const MATH_STATUSES = new Set([
  "definition", "identity", "theorem", "conditional_theorem", "conjecture",
  "heuristic", "unknown", "refuted", "not_applicable",
]);

const PROJECT_STATUSES = new Set([
  "foundation", "method", "calibration", "active", "survivor", "parked",
  "killed", "graveyard", "superseded", "not_applicable",
]);

const EDGE_STATUSES = new Set([
  "proved", "conditional", "conjectural", "analogy", "candidate",
  "refuted", "project",
]);

const OPEN_BRIDGE_STATUSES = new Set(["conditional", "conjectural", "candidate"]);

const RELATION_LABELS = {
  acts_on: "acts on",
  studied_by: "is studied by",
  produces: "produces",
  predicts: "predicts",
  encodes: "encodes",
  equivalent_to: "is equivalent to",
  implies: "implies",
  blocked_by: "is blocked by",
  analog_of: "is an analogue of",
  transported_to: "is transported to",
  supports: "supports",
  refutes: "refutes",
  computed_by: "is computed by",
  visualized_by: "is visualized by",
  requires: "requires",
  candidate_bridge: "candidate bridge",
  shares_mechanism_with: "shares a mechanism with",
};

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalized(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function searchableList(value) {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function pushDuplicateErrors(records, noun, errors) {
  const seen = new Set();
  for (let i = 0; i < records.length; i++) {
    const id = records[i] && records[i].id;
    if (!nonEmptyString(id)) {
      errors.push(`${noun} at index ${i} is missing a non-empty id`);
      continue;
    }
    if (seen.has(id)) errors.push(`duplicate ${noun} id "${id}"`);
    seen.add(id);
  }
  return seen;
}

function graphCenterId(graph) {
  return isRecord(graph.meta) && nonEmptyString(graph.meta.centerId)
    ? graph.meta.centerId
    : null;
}

/**
 * Return human-readable integrity errors. An empty array means the graph is
 * structurally valid. This deliberately does not read the filesystem, so a
 * repoRef is validated as provenance text rather than as a live path.
 */
export function validateTheoryGraph(graph) {
  const errors = [];
  if (!isRecord(graph)) return ["graph must be an object"];

  if (!isRecord(graph.meta)) errors.push("graph.meta must be an object");
  const centerId = graphCenterId(graph);
  if (!centerId) errors.push("graph.meta.centerId must be a non-empty string");

  const clusters = Array.isArray(graph.clusters) ? graph.clusters : [];
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  if (!Array.isArray(graph.clusters)) errors.push("graph.clusters must be an array");
  if (!Array.isArray(graph.nodes)) errors.push("graph.nodes must be an array");
  if (!Array.isArray(graph.edges)) errors.push("graph.edges must be an array");

  const clusterIds = pushDuplicateErrors(clusters, "cluster", errors);
  const nodeIds = pushDuplicateErrors(nodes, "node", errors);
  pushDuplicateErrors(edges, "edge", errors);

  for (const cluster of clusters) {
    if (!isRecord(cluster) || !nonEmptyString(cluster.id)) continue;
    if (!nonEmptyString(cluster.label)) errors.push(`cluster "${cluster.id}" is missing a label`);
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!isRecord(node)) {
      errors.push(`node at index ${i} must be an object`);
      continue;
    }
    const id = nonEmptyString(node.id) ? node.id : `index ${i}`;
    if (!nonEmptyString(node.label)) errors.push(`node "${id}" is missing a label`);
    if (!NODE_KINDS.has(node.kind)) errors.push(`node "${id}" has invalid kind "${node.kind}"`);
    if (!MATH_STATUSES.has(node.mathStatus)) errors.push(`node "${id}" has invalid mathStatus "${node.mathStatus}"`);
    if (!PROJECT_STATUSES.has(node.projectStatus)) errors.push(`node "${id}" has invalid projectStatus "${node.projectStatus}"`);

    const isCenter = id === centerId;
    if (!nonEmptyString(node.cluster)) {
      errors.push(`node "${id}" is missing a cluster`);
    } else if (node.cluster === "core") {
      if (!isCenter) errors.push(`only the center node may use cluster "core" (found on "${id}")`);
    } else if (!clusterIds.has(node.cluster)) {
      errors.push(`node "${id}" references unknown cluster "${node.cluster}"`);
    }

    if (!Number.isInteger(node.ring) || node.ring < 0 || node.ring > 3) {
      errors.push(`node "${id}" has invalid ring "${node.ring}"; expected an integer from 0 to 3`);
    }

    if (node.mathStatus === "theorem" || node.mathStatus === "conditional_theorem") {
      if (!Array.isArray(node.repoRefs) || !node.repoRefs.some(nonEmptyString)) {
        errors.push(`node "${id}" with mathStatus "${node.mathStatus}" requires provenance in repoRefs`);
      }
    }
  }

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (!isRecord(edge)) {
      errors.push(`edge at index ${i} must be an object`);
      continue;
    }
    const id = nonEmptyString(edge.id) ? edge.id : `index ${i}`;
    if (!nonEmptyString(edge.source) || !nodeIds.has(edge.source)) {
      errors.push(`edge "${id}" references unknown source "${edge.source}"`);
    }
    if (!nonEmptyString(edge.target) || !nodeIds.has(edge.target)) {
      errors.push(`edge "${id}" references unknown target "${edge.target}"`);
    }
    if (!nonEmptyString(edge.relation)) {
      errors.push(`edge "${id}" is missing a relation`);
    } else if (edge.relation === "related_to") {
      errors.push(`edge "${id}" uses forbidden generic relation "related_to"`);
    }
    if (!EDGE_STATUSES.has(edge.status)) errors.push(`edge "${id}" has invalid status "${edge.status}"`);
  }

  if (centerId && nodeIds.has(centerId)) {
    const center = nodes.find((node) => node && node.id === centerId);
    if (center && center.kind !== "object") errors.push(`center node "${centerId}" must have kind "object"`);
    if (center && center.ring !== 0) errors.push(`center node "${centerId}" must use ring 0`);

    // A visual theory atlas should be one navigable graph centered on primes.
    // Only traverse edges whose endpoints are valid, so endpoint errors above
    // remain precise and do not obscure connectivity diagnostics.
    const validGraph = {
      nodes,
      edges: edges.filter((edge) => edge && nodeIds.has(edge.source) && nodeIds.has(edge.target)),
    };
    const reached = getTheoryNeighborhood(validGraph, centerId, Math.max(0, nodes.length));
    for (const node of nodes) {
      if (node && nonEmptyString(node.id) && !reached.has(node.id)) {
        errors.push(`node "${node.id}" is unreachable from center "${centerId}"`);
      }
    }
  } else if (centerId) {
    errors.push(`graph center "${centerId}" does not reference a node`);
  }

  return errors;
}

/** Build reusable lookup maps without mutating the graph. */
export function buildTheoryIndex(graph) {
  const nodes = Array.isArray(graph && graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph && graph.edges) ? graph.edges : [];
  const nodesById = new Map();
  const edgesById = new Map();
  const outgoing = new Map();
  const incoming = new Map();
  const incident = new Map();
  const neighbors = new Map();
  const nodesByCluster = new Map();
  const nodesByRing = new Map();

  for (const node of nodes) {
    if (!node || !nonEmptyString(node.id)) continue;
    nodesById.set(node.id, node);
    outgoing.set(node.id, []);
    incoming.set(node.id, []);
    incident.set(node.id, []);
    neighbors.set(node.id, new Set());
    if (!nodesByCluster.has(node.cluster)) nodesByCluster.set(node.cluster, []);
    nodesByCluster.get(node.cluster).push(node);
    if (!nodesByRing.has(node.ring)) nodesByRing.set(node.ring, []);
    nodesByRing.get(node.ring).push(node);
  }

  for (const edge of edges) {
    if (!edge || !nonEmptyString(edge.id)) continue;
    edgesById.set(edge.id, edge);
    if (!nodesById.has(edge.source) || !nodesById.has(edge.target)) continue;
    outgoing.get(edge.source).push(edge);
    incoming.get(edge.target).push(edge);
    incident.get(edge.source).push(edge);
    if (edge.target !== edge.source) incident.get(edge.target).push(edge);
    neighbors.get(edge.source).add(edge.target);
    neighbors.get(edge.target).add(edge.source);
  }

  return {
    nodesById,
    edgesById,
    outgoing,
    incoming,
    incident,
    neighbors,
    nodesByCluster,
    nodesByRing,
  };
}

/** Return the start node and every node within `depth` undirected hops. */
export function getTheoryNeighborhood(graph, nodeId, depth = 1) {
  const index = buildTheoryIndex(graph);
  const found = new Set();
  if (!index.nodesById.has(nodeId)) return found;
  const maxDepth = Number.isFinite(depth) ? Math.max(0, Math.floor(depth)) : 0;
  const queue = [[nodeId, 0]];
  found.add(nodeId);

  for (let head = 0; head < queue.length; head++) {
    const [id, distance] = queue[head];
    if (distance >= maxDepth) continue;
    for (const neighbor of index.neighbors.get(id) || []) {
      if (found.has(neighbor)) continue;
      found.add(neighbor);
      queue.push([neighbor, distance + 1]);
    }
  }
  return found;
}

function scoreSearchField(text, phrase, tokens, weight) {
  const value = normalized(text);
  if (!value) return 0;
  let score = 0;
  if (value === phrase) score += weight * 8;
  else if (value.startsWith(phrase)) score += weight * 5;
  else if (value.includes(phrase)) score += weight * 3;
  for (const token of tokens) {
    if (value === token) score += weight * 3;
    else if (value.split(" ").some((word) => word.startsWith(token))) score += weight * 1.5;
    else if (value.includes(token)) score += weight;
  }
  return score;
}

/** Search node metadata and return the original nodes in deterministic rank order. */
export function searchTheoryNodes(graph, query) {
  const nodes = Array.isArray(graph && graph.nodes) ? graph.nodes : [];
  const phrase = normalized(query);
  if (!phrase) return nodes.slice();
  const tokens = phrase.split(/\s+/).filter(Boolean);

  return nodes
    .map((node, order) => {
      const fields = [
        [node.label, 120],
        [node.id, 105],
        [node.viewName, 75],
        [node.tags, 60],
        [node.summary, 34],
        [node.scope, 28],
        [node.question, 28],
        [node.cluster, 22],
        [node.kind, 18],
        [node.mathStatus, 12],
        [node.projectStatus, 12],
        [node.repoRefs, 8],
      ];
      const searchable = fields.flatMap(([value]) => searchableList(value).map(normalized)).join(" ");
      if (!tokens.every((token) => searchable.includes(token))) return null;
      const score = fields.reduce(
        (sum, [value, weight]) => sum + searchableList(value).reduce(
          (fieldSum, item) => fieldSum + scoreSearchField(item, phrase, tokens, weight),
          0,
        ),
        0,
      );
      return { node, order, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.node.label.localeCompare(b.node.label) || a.order - b.order)
    .map((item) => item.node);
}

/** Return unresolved mathematical bridge edges, optionally touching one node. */
export function getOpenBridges(graph, nodeId) {
  const edges = Array.isArray(graph && graph.edges) ? graph.edges : [];
  return edges.filter((edge) => {
    if (!edge) return false;
    const open = edge.relation === "candidate_bridge" || OPEN_BRIDGE_STATUSES.has(edge.status);
    if (!open) return false;
    return nodeId == null || edge.source === nodeId || edge.target === nodeId;
  });
}

/** Find a shortest conceptual route, treating typed relationships as traversable both ways. */
export function shortestTheoryPath(graph, from, to) {
  const index = buildTheoryIndex(graph);
  if (!index.nodesById.has(from) || !index.nodesById.has(to)) return [];
  if (from === to) return [from];

  const previous = new Map([[from, null]]);
  const queue = [from];
  for (let head = 0; head < queue.length; head++) {
    const id = queue[head];
    for (const neighbor of index.neighbors.get(id) || []) {
      if (previous.has(neighbor)) continue;
      previous.set(neighbor, id);
      if (neighbor === to) {
        const path = [to];
        let cursor = id;
        while (cursor !== null) {
          path.push(cursor);
          cursor = previous.get(cursor);
        }
        return path.reverse();
      }
      queue.push(neighbor);
    }
  }
  return [];
}

/** Convert a relation id (or edge carrying one) into compact UI copy. */
export function relationLabel(relation) {
  const id = isRecord(relation) ? relation.relation : relation;
  if (!nonEmptyString(id)) return "";
  return RELATION_LABELS[id] || id.replace(/[_-]+/g, " ").trim();
}
