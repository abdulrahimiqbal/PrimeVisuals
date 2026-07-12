import { describe, expect, it } from "vitest";

import { PRIME_THEORY_MAP } from "../src/data/primeTheoryMap.js";
import {
  buildTheoryIndex,
  getOpenBridges,
  getTheoryNeighborhood,
  relationLabel,
  searchTheoryNodes,
  shortestTheoryPath,
  validateTheoryGraph,
} from "../src/core/theoryGraph.js";

const fixture = {
  meta: { centerId: "primes" },
  clusters: [
    { id: "analytic", label: "Analytic", angle: 0, summary: "Analytic methods" },
    { id: "category", label: "Category", angle: 1, summary: "Categorical methods" },
  ],
  nodes: [
    {
      id: "primes", label: "Prime numbers", kind: "object", cluster: "core", ring: 0,
      mathStatus: "definition", projectStatus: "foundation", summary: "The center",
      repoRefs: [], tags: ["prime"],
    },
    {
      id: "prime-gaps", label: "Prime gaps", kind: "observable", cluster: "analytic", ring: 1,
      mathStatus: "definition", projectStatus: "active", summary: "Spacing between consecutive primes",
      repoRefs: [], tags: ["spacing", "gaps"],
    },
    {
      id: "gap-theorem", label: "A gap theorem", kind: "statement", cluster: "analytic", ring: 2,
      mathStatus: "theorem", projectStatus: "foundation", summary: "A sourced result",
      repoRefs: ["KNOWLEDGE.md"], tags: ["bounded gaps"],
    },
    {
      id: "categorical-bridge", label: "Categorical prime bridge", kind: "framework", cluster: "category", ring: 3,
      mathStatus: "unknown", projectStatus: "active", summary: "A possible functorial route",
      repoRefs: [], tags: ["category theory", "functor"],
    },
  ],
  edges: [
    { id: "e1", source: "primes", target: "prime-gaps", relation: "produces", status: "proved", summary: "" },
    { id: "e2", source: "prime-gaps", target: "gap-theorem", relation: "studied_by", status: "proved", summary: "" },
    { id: "e3", source: "gap-theorem", target: "categorical-bridge", relation: "candidate_bridge", status: "candidate", summary: "" },
  ],
};

describe("Prime Theory Map data", () => {
  it("passes structural, enum, provenance, and central-connectivity validation", () => {
    expect(validateTheoryGraph(PRIME_THEORY_MAP)).toEqual([]);
  });

  it("indexes every node and keeps the complete map reachable from its center", () => {
    const index = buildTheoryIndex(PRIME_THEORY_MAP);
    const centerId = PRIME_THEORY_MAP.meta.centerId;
    expect(index.nodesById.size).toBe(PRIME_THEORY_MAP.nodes.length);
    expect(index.edgesById.size).toBe(PRIME_THEORY_MAP.edges.length);

    const reached = getTheoryNeighborhood(PRIME_THEORY_MAP, centerId, PRIME_THEORY_MAP.nodes.length);
    expect(reached.size).toBe(PRIME_THEORY_MAP.nodes.length);
    for (const node of PRIME_THEORY_MAP.nodes) {
      expect(shortestTheoryPath(PRIME_THEORY_MAP, centerId, node.id)).not.toEqual([]);
    }
  });

  it("contains an explicit, queryable open frontier", () => {
    const bridges = getOpenBridges(PRIME_THEORY_MAP);
    expect(bridges.length).toBeGreaterThan(0);
    expect(bridges.every((edge) =>
      edge.relation === "candidate_bridge"
      || ["conditional", "conjectural", "candidate"].includes(edge.status))).toBe(true);
  });
});

describe("theory graph helpers", () => {
  it("reports malformed IDs, enums, references, provenance, relations, rings, and disconnected nodes", () => {
    const broken = structuredClone(fixture);
    broken.nodes[1].id = "primes";
    broken.nodes[2].mathStatus = "theorem";
    broken.nodes[2].repoRefs = [];
    broken.nodes[3].kind = "mystery";
    broken.nodes[3].cluster = "missing-cluster";
    broken.nodes[3].ring = 9;
    broken.edges[0].relation = "related_to";
    broken.edges[1].target = "missing-node";
    broken.edges[2].status = "maybe";

    const errors = validateTheoryGraph(broken).join("\n");
    expect(errors).toContain("duplicate node id");
    expect(errors).toContain("requires provenance");
    expect(errors).toContain("invalid kind");
    expect(errors).toContain("unknown cluster");
    expect(errors).toContain("invalid ring");
    expect(errors).toContain("forbidden generic relation");
    expect(errors).toContain("unknown target");
    expect(errors).toContain("invalid status");
    expect(errors).toContain("unreachable from center");
  });

  it("builds directional and undirected indexes", () => {
    const index = buildTheoryIndex(fixture);
    expect(index.outgoing.get("primes").map((edge) => edge.id)).toEqual(["e1"]);
    expect(index.incoming.get("prime-gaps").map((edge) => edge.id)).toEqual(["e1"]);
    expect([...index.neighbors.get("prime-gaps")]).toEqual(["primes", "gap-theorem"]);
    expect(index.nodesByCluster.get("analytic")).toHaveLength(2);
    expect(index.nodesByRing.get(3)[0].id).toBe("categorical-bridge");
  });

  it("expands neighborhoods by hop count", () => {
    expect([...getTheoryNeighborhood(fixture, "primes", 0)]).toEqual(["primes"]);
    expect([...getTheoryNeighborhood(fixture, "primes", 1)]).toEqual(["primes", "prime-gaps"]);
    expect(getTheoryNeighborhood(fixture, "primes", 2)).toEqual(new Set(["primes", "prime-gaps", "gap-theorem"]));
    expect(getTheoryNeighborhood(fixture, "missing", 3).size).toBe(0);
  });

  it("ranks exact labels ahead of incidental text and searches tags and clusters", () => {
    expect(searchTheoryNodes(fixture, "prime gaps")[0].id).toBe("prime-gaps");
    expect(searchTheoryNodes(fixture, "spacing")[0].id).toBe("prime-gaps");
    expect(searchTheoryNodes(fixture, "category theory")[0].id).toBe("categorical-bridge");
    expect(searchTheoryNodes(fixture, "no such concept")).toEqual([]);
    expect(searchTheoryNodes(fixture, "")).toEqual(fixture.nodes);
  });

  it("filters open bridges globally or by incident node", () => {
    expect(getOpenBridges(fixture).map((edge) => edge.id)).toEqual(["e3"]);
    expect(getOpenBridges(fixture, "gap-theorem").map((edge) => edge.id)).toEqual(["e3"]);
    expect(getOpenBridges(fixture, "primes")).toEqual([]);
  });

  it("finds shortest paths and handles missing endpoints", () => {
    expect(shortestTheoryPath(fixture, "primes", "categorical-bridge")).toEqual([
      "primes", "prime-gaps", "gap-theorem", "categorical-bridge",
    ]);
    expect(shortestTheoryPath(fixture, "prime-gaps", "prime-gaps")).toEqual(["prime-gaps"]);
    expect(shortestTheoryPath(fixture, "primes", "missing")).toEqual([]);
  });

  it("formats the relation vocabulary for the inspector", () => {
    expect(relationLabel("candidate_bridge")).toBe("candidate bridge");
    expect(relationLabel({ relation: "shares_mechanism_with" })).toBe("shares a mechanism with");
    expect(relationLabel("new_relation_type")).toBe("new relation type");
    expect(relationLabel(null)).toBe("");
  });
});
