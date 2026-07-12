# Prime Theory Atlas

Status: implemented seed atlas plus the design contract for its evolution.

## Implemented seed (v1.0.0)

The first working Atlas is now part of the app:

- [`src/data/primeTheoryMap.js`](src/data/primeTheoryMap.js) is the curated,
  version-controlled graph: 8 field clusters, 33 nodes, and 49 typed edges.
- [`src/core/theoryGraph.js`](src/core/theoryGraph.js) validates the ontology
  and provides search, neighborhoods, open-bridge queries, and shortest paths.
- [`src/TheoryMap.jsx`](src/TheoryMap.jsx) renders the searchable radial map as
  the third top-level `ATLAS` mode and links mapped nodes back to executable
  `PATCH` views.
- [`tests/theory-graph.test.js`](tests/theory-graph.test.js) enforces stable
  IDs, enum values, theorem provenance, valid endpoints, central reachability,
  and the ban on generic `related_to` edges.

The compact seed schema uses `meta`, `clusters`, `nodes`, and `edges`. Its node
kinds are `universe`, `object`, `operation`, `observable`, `statement`,
`framework`, `obstruction`, `program`, `instrument`, and `evidence`.
Mathematical status uses `definition`, `identity`, `theorem`,
`conditional_theorem`, `conjecture`, `heuristic`, `unknown`, `refuted`, or
`not_applicable`; project status is tracked independently. Edge status is
`proved`, `conditional`, `conjectural`, `analogy`, `candidate`, `refuted`, or
`project`.

The richer revision and provenance model later in this document is the target
for the next schema version. Until that migration is implemented, changes must
pass the current validator and tests; do not add fields whose meaning conflicts
with the compact v1 enums.

## Honest starting point

PrimeVisuals did not previously have one unified theory map with primes at the
center. It had several strong but separate precursors:

- [`KNOWLEDGE.md`](KNOWLEDGE.md) is the chronological, append-only memory of
  findings, failures, conjectures, and `CONNECTION:` notes.
- [`src/core/registry.js`](src/core/registry.js),
  [`src/core/chips.js`](src/core/chips.js), and
  [`src/core/labkit.js`](src/core/labkit.js) describe executable sources,
  coordinate planes, visual lenses, operations, and formula nodes.
- [`src/PrimeVisuals.jsx`](src/PrimeVisuals.jsx) contains a working node canvas,
  but its nodes are computational expressions rather than mathematical ideas.
- [`COUNCIL.md`](COUNCIL.md) compares broad research routes, while
  [`ROADMAP.md`](ROADMAP.md) tracks product and research infrastructure.
- [`logs/two-universes-protocol/`](logs/two-universes-protocol/) contains a
  theorem catalog, proof-obligation maps, obstruction maps, and a longitudinal
  campaign ledger.
- [`logs/arithmetic-hodge-transport/ATLAS.md`](logs/arithmetic-hodge-transport/ATLAS.md),
  [`logs/arithmetic-hodge-transport/atlas.json`](logs/arithmetic-hodge-transport/atlas.json),
  and
  [`logs/arithmetic-hodge-transport/rosati-discriminator/obligation-graph.json`](logs/arithmetic-hodge-transport/rosati-discriminator/obligation-graph.json)
  are the closest existing node-and-edge theory artifacts, but they cover one
  narrow arithmetic-Hodge/Rosati campaign.
- [`primevisuals-frontier-instruments/`](primevisuals-frontier-instruments/)
  supplies a broad, consistent visual vocabulary, but its outputs are static
  instruments rather than a connected knowledge system.

The Prime Theory Atlas should unify these materials without pretending that a
visual connection is a proof. It is a research-navigation layer over the repo,
not a replacement for papers, precise statements, computations, or formal
proof.

## Purpose

The Atlas should make it easy to answer five questions:

1. What can be done to, with, or through prime numbers?
2. Which mathematical fields study the same prime object in different forms?
3. Which theorems, conjectures, models, mechanisms, and obstructions connect
   those fields?
4. Which connections are established, merely observed, conjectural, refuted,
   or not yet audited?
5. Where is there a small, precise missing edge that could become a useful new
   lemma or theorem?

The default view may place **prime numbers** at the center, but the data model
must not make primes the parent of everything. Many valuable routes begin in a
different world—zeta zeros, finite-field geometry, dynamical systems, divisor
extremes, random matrices, or categories—and only later produce a theorem about
primes. Central placement is a navigation choice, not a claim of logical
priority.

## Non-goals

The Atlas must not:

- promote proximity on a canvas into mathematical relevance;
- infer a theorem by joining a chain of analogies;
- call a finite numerical pattern a universal result;
- collapse integer primes, prime ideals, finite places, irreducible
  polynomials, closed points, and prime orbits into one undifferentiated node;
- hide failed experiments or overwrite corrected claims;
- use `active`, `promising`, or `graveyard` as a substitute for mathematical
  truth status;
- claim that category theory, geometry, physics, or computation supplies a
  bridge unless the bridge itself has been defined and sourced.

## Target mature graph model

The canonical artifact should be a versioned graph document, independent of
any particular renderer:

```json
{
  "schemaVersion": "prime-theory-atlas/v1",
  "nodes": [],
  "edges": [],
  "revisions": []
}
```

Layout coordinates, collapsed clusters, colors, and camera state belong in a
separate presentation or saved-view layer. They are not mathematical data.

### Node kinds

Use the smallest kind that describes what the entity is:

| kind | use |
| --- | --- |
| `object` | primes, prime ideals, zeta zeros, irreducible polynomials, prime gaps |
| `operation` | sieving, reduction mod q, summation, Fourier transform, completion |
| `function` | pi(x), Lambda, mu, zeta, L-functions |
| `invariant` | a statistic, spectrum, correlation, rank, energy, or defect |
| `structure` | a graph, category, scheme, cohomology theory, dynamical system |
| `field` | analytic number theory, arithmetic geometry, category theory, dynamics |
| `statement` | theorem, exact identity, conditional theorem, conjecture, or falsified claim |
| `problem` | a precise unresolved question or endpoint |
| `mechanism` | singular series, Frobenius action, zero repulsion, sieve parity |
| `obstruction` | parity barrier, missing comparison functor, failed transport |
| `model` | Cramer primes, random matrices, function-field analogue, countermodel |
| `experiment` | a preregistered numerical or symbolic test |
| `visualization` | an executable PrimeVisuals view or generated instrument |
| `proof-obligation` | a named missing lemma or implication arrow |
| `campaign` | a bounded research program with its own history and stop rules |
| `artifact` | source file, evidence pack, formal statement, dataset, or script |

A theorem and a conjecture are both `statement` nodes. Their difference belongs
in `mathStatus`, so a corrected conjecture does not require changing its basic
kind.

### Required node fields

```json
{
  "id": "object:prime-numbers",
  "kind": "object",
  "label": "Prime numbers",
  "summary": "Positive integers greater than 1 with exactly two positive divisors.",
  "mathStatus": "defined",
  "mathStatusNote": "Standard definition.",
  "projectStatus": "canonical",
  "projectStatusNote": "Root navigation node.",
  "domains": ["number-theory"],
  "tags": ["integer-primes"],
  "aliases": ["primes"],
  "statement": null,
  "hypotheses": [],
  "sourceRefs": [],
  "citationRefs": [],
  "artifactRefs": [],
  "createdAt": "YYYY-MM-DD",
  "updatedAt": "YYYY-MM-DD",
  "revision": 1
}
```

Additional fields are allowed when they are typed and useful—for example
`formula`, `quantifiers`, `universe`, `parameters`, `counterexamples`, or
`formalizationRefs`. Do not store the only copy of a precise mathematical
statement in `summary`.

### Mathematical status is not project status

Every substantive node and edge must keep these two axes separate.

Allowed `mathStatus` values:

| value | meaning |
| --- | --- |
| `defined` | a standard or project-defined object, operation, or invariant |
| `proved` | a theorem or exact identity with a checkable source or proof |
| `proved-conditional` | proved under explicitly stored hypotheses |
| `conjectured` | a precise unproved statement intentionally proposed as such |
| `observed` | replicated empirical behavior, with no proof claimed |
| `refuted` | a precise claim broken by proof, counterexample, or decisive control |
| `open` | a source-audited unresolved problem in the mathematical literature |
| `unknown` | the project has not yet adjudicated or literature-audited the claim |
| `not-applicable` | project, UI, or artifact metadata with no truth value |

Reserve `open` for a genuinely checked open problem. “We do not know yet” is
`unknown`, not automatically an open problem in the literature.

Allowed `projectStatus` values:

| value | meaning |
| --- | --- |
| `canonical` | stable reference material used throughout the Atlas |
| `active` | currently used or investigated |
| `candidate` | admitted to the research queue but not promoted |
| `planned` | specified but not implemented or investigated |
| `calibration` | retained mainly as a known benchmark or control |
| `blocked` | stopped at a named missing input or obligation |
| `parked` | valid but currently low-priority work |
| `graveyard` | a tested research route that failed its promotion gates |
| `superseded` | replaced or corrected, but retained for history |
| `archived` | no longer active and not expected to change |

Examples:

- A proved theorem may be `mathStatus: proved` and `projectStatus: parked`.
- A live numerical lead may be `mathStatus: observed` and
  `projectStatus: candidate`.
- A false conjecture remains useful as `mathStatus: refuted` and may be
  `projectStatus: canonical` if it is an important warning.
- A planned map UI is `mathStatus: not-applicable` and
  `projectStatus: planned`.

### Required edge fields

Edges are claims too. Their status may differ from the status of either node.

```json
{
  "id": "edge:pnt-describes-prime-counting",
  "from": "statement:prime-number-theorem",
  "relation": "describes",
  "to": "function:prime-counting",
  "label": "gives the first-order asymptotic for",
  "mathStatus": "proved",
  "mathStatusNote": "Under x tending to infinity.",
  "projectStatus": "canonical",
  "scope": "pi(x) ~ x/log x as x -> infinity",
  "hypotheses": [],
  "sourceRefs": [],
  "citationRefs": [],
  "artifactRefs": [],
  "createdAt": "YYYY-MM-DD",
  "updatedAt": "YYYY-MM-DD",
  "revision": 1
}
```

Read every directed edge as a sentence: **from — relation — to**. Store an
explicit inverse edge only when it carries different searchable meaning. The
renderer may display the inverse label without duplicating the canonical edge.

## Controlled relation vocabulary

Use the most precise available relation. A broad `related-to` edge is not
allowed in reviewed data; it hides the very distinction the Atlas is meant to
clarify.

### Structural and operational

- `is-a`, `instance-of`, `part-of`
- `defined-by`, `decomposes-into`, `parameterizes`
- `applies-to`, `acts-on`, `transforms`, `computes`, `measures`
- `describes`, `studies`, `realizes`, `produces`

### Logical and theorem-level

- `implies` — requires a source, scope, and all hypotheses;
- `equivalent-to` — requires both directions and is displayed symmetrically;
- `generalizes`, `specializes`
- `depends-on`, `requires`
- `contradicts`, `refutes`, `resolves`
- `obstructs`, `leaves-open`

`implies` and `equivalent-to` are never inferred from prose resemblance. If an
implication is exactly the missing research step, create a
`proof-obligation` node and use `requires` or `depends-on` until it is proved.

### Evidence, implementation, and method

- `uses`, `proved-by`, `supported-by`
- `tested-by`, `controlled-by`, `calibrated-against`
- `modeled-by`, `approximated-by`
- `visualized-by`, `implemented-by`, `documented-by`

`supported-by` means evidence, not proof. A plot should normally connect by
`visualized-by` or `supported-by`, never `proved-by`.

### Cross-domain and transport

- `analogous-to` — structural resemblance without a transport theorem;
- `compares-with`
- `transports-to` — requires an explicit map and a proved preservation claim;
- `fails-to-transport-to` — records a checked obstruction or counterexample;
- `shares-object-with`, `shares-mechanism-with`, `shares-method-with`
- `formalizes`, `organizes`

When two fields overlap, prefer connecting both fields to the shared object,
mechanism, or statement. Use a direct field-to-field edge only when the shared
content is named in `scope`.

### Research history

- `motivates`, `derived-from`, `follow-up-to`
- `supersedes`, `corrects`

New relation names require a schema change note, a definition, directionality,
and a migration plan. Do not mint synonyms merely to improve prose.

## Append-only evolution and correction

The Atlas inherits the strongest rule from `KNOWLEDGE.md`: do not erase the
path by which the project learned.

1. IDs are permanent, lowercase, namespaced, and never reused.
2. Editing a label, status, statement, or edge creates a revision event with a
   reason and provenance.
3. A false statement becomes `mathStatus: refuted`; it is not deleted.
4. A replacement receives a new node when its mathematical content changes,
   plus a `corrects` or `supersedes` edge.
5. A rename keeps the same ID and adds the old label to `aliases`.
6. Duplicate nodes may be merged only through a retained redirect/tombstone and
   a revision event; inbound references must remain resolvable.
7. Sources and evidence are additive. Removing a bad source requires a
   correction event that explains why it was rejected.
8. `updatedAt` records the entity update; the revision log records who or what
   changed it, when, why, and from which artifact.

A future revision entry should minimally contain:

```json
{
  "id": "revision:YYYY-MM-DD:slug",
  "entityId": "statement:example",
  "action": "create|amend|correct|supersede|merge",
  "changedFields": ["mathStatus", "mathStatusNote"],
  "reason": "A hostile control reproduced the claimed effect.",
  "sourceRefs": ["KNOWLEDGE.md#section-or-stable-anchor"],
  "createdAt": "YYYY-MM-DD"
}
```

## Visual and search workflow

### Default visual

The landing view should use semantic zoom:

1. **Center:** integer prime numbers.
2. **First neighborhood:** operations, core functions, invariants, and prime
   objects such as gaps, tuples, residues, and prime powers.
3. **Second neighborhood:** fields and mechanisms—analytic number theory,
   sieve theory, additive combinatorics, probability, dynamics, spectral
   theory, arithmetic geometry, finite fields, and category theory.
4. **Frontier layer:** theorems, conjectures, open problems, obstructions, and
   proof obligations.
5. **Evidence layer:** experiments, models, visualizations, scripts, formal
   statements, logs, and citations.

These are visual neighborhoods, not a rigid hierarchy. A user must be able to
recenter on any node and see the graph from that object’s point of view.

Use the existing PrimeVisuals visual language from
[`src/core/theme.js`](src/core/theme.js): dark field, ion/cyan primary marks,
amber theory or prediction accents, and rose warnings. Encode node kind by
shape/icon and mathematical status by border treatment. Show project status as
a separate small badge. Do not encode both statuses with one color.

Suggested status treatments:

- proved/defined: solid border;
- proved-conditional: double or annotated border;
- conjectured/open: dashed border;
- observed: dotted border;
- unknown: muted border with question mark;
- refuted: retained node with a visible strike/counterexample mark.

Force-directed distance must never be presented as confidence, theorem
strength, or causal importance. Users should be able to switch to deterministic
layouts by field, status, chronology, or dependency depth.

### Search and exploration modes

Search should cover labels, aliases, formulas, precise statements, tags,
authors, citations, file paths, and artifact text. Required filters include:

- node kind;
- relation type;
- `mathStatus` and `projectStatus` independently;
- field/domain and universe (`Z`, `F_q[t]`, curves, models);
- theorem hypotheses;
- evidence and citation presence;
- active, blocked, graveyard, or corrected branches;
- date created, last updated, and campaign.

High-value exploration views:

- **Operations:** everything that applies to or computes from primes;
- **Theory overlap:** shared objects and mechanisms between selected fields;
- **Frontier:** open problems and proof obligations adjacent to established
  results;
- **Bridge finder:** short typed paths between two nodes, with status shown on
  every edge;
- **Two universes:** integer and function-field counterparts, including failed
  transports;
- **Negative knowledge:** refuted statements, graveyard experiments,
  countermodels, and obstruction edges;
- **Category view:** categories, functors, comparison maps, and their missing
  functoriality or naturality obligations;
- **Timeline:** the graph as it was known at a selected revision;
- **Executable view:** jump from a concept to the relevant PrimeVisuals preset,
  Lab formula, script, test, or evidence pack.

Every filtered/recentered view should eventually be shareable by URL, including
the selected node, filters, layout, and revision. The canonical graph itself
must remain independent of that URL state.

## Theorem-discovery workflow

The Atlas helps discover *questions and proof obligations*. It does not form a
new theorem merely by connecting nodes.

1. **Choose a precise target.** Start from an object, open problem, failed
   campaign, or requested bridge—not from a visually attractive cluster.
2. **Inspect typed neighborhoods.** Look for a shared mechanism, a proven result
   in another universe, a countermodel, or a small missing implication.
3. **Name the missing edge.** Create a `proof-obligation` node with a quantified
   statement, hypotheses, expected payoff, and kill condition.
4. **Check disguises.** Apply the factor, reformulation, and circularity checks
   required by [`MACHINE_HOW_TO_USE.md`](MACHINE_HOW_TO_USE.md). A renamed
   zeta/psi/Mobius statement is not new content.
5. **Check primality specificity.** Use composite, semiprime, local-sieve,
   shuffled, Cramer, and other relevant controls. If the mechanism does not use
   primality, relabel the node honestly around the larger family.
6. **Preregister the decisive test.** Record the statistic, null, ranges,
   holdout, scale ladder, pass threshold, and failure interpretation before
   computing.
7. **Attach evidence as separate nodes.** An experiment supports or refutes a
   statement; it never silently changes the statement’s truth status.
8. **Audit novelty and sources.** Compare with named literature, existing
   `KNOWLEDGE.md` entries, campaign graveyards, and equivalent formulations.
9. **Build the proof map.** Decompose the desired result into established
   inputs and genuinely missing lemmas. Mark any step equivalent to the
   original open problem rather than calling it progress.
10. **Promote conservatively.** Move `unknown -> conjectured` only after a
    precise statement and novelty audit; `conjectured/observed -> proved` only
    after a proof or authoritative theorem source. Preserve all earlier
    revisions.

The most useful Atlas output may be a negative one: “these two clusters appear
close, but the only possible connecting arrow is the original Chowla
conjecture,” or “this analogy fails because coefficient-space geometry has no
integer transport.” Those conclusions prevent repeated searches.

## Strict epistemic safeguards

1. **Graph paths are not proof chains.** Only explicit `implies` and
   `equivalent-to` edges may participate in logical path checking, and their
   hypotheses must be compatible. `analogous-to`, `supported-by`, and
   `shares-mechanism-with` never compose into an implication.
2. **Nodes and edges have independent status.** Two proved objects may have an
   unknown relationship. A proved theorem may support only a conjectural
   transport.
3. **Pictures and numerics do not prove universal claims.** Finite computation
   creates `observed` evidence unless it is a kernel-checked finite theorem
   whose finite scope is explicit.
4. **Citations must support the exact edge.** A source about both endpoint
   concepts is not automatically a source for their relationship.
5. **Equivalence requires both directions.** Similar formulas, shared zeros,
   or a zero-free multiplier do not by themselves create new mathematical
   content.
6. **Analogy is first-class but visibly weaker.** Function-field, random-matrix,
   physical, topological, and categorical analogies should be stored, not
   upgraded to transport theorems.
7. **Controls and countermodels are first-class nodes.** A framework that also
   accepts the registered hostile controls has not isolated the intended prime
   mechanism.
8. **Negative results remain searchable.** `refuted`, `graveyard`, `blocked`,
   `fails-to-transport-to`, and `obstructs` are valuable map content.
9. **No automatic status promotion.** Parsers and language models may propose
   nodes and edges only into a review queue. They may not mark a theorem proved
   or a literature problem open without a source-level audit.
10. **Separate novelty from truth.** A result can be true but known, new but
    only observed, or false but instructive. Store these distinctions rather
    than compressing them into a single score.
11. **Separate mathematical importance from project priority.** Visual size,
    centrality, and `projectStatus` must not imply truth or significance.
12. **State stop rules.** Every active proof obligation or campaign should name
    what would kill, pause, or supersede it.

## Category theory in the Atlas

Category theory should appear as a real field node, not as a decorative halo or
a claim that “everything is connected.” Its role is to specify objects,
morphisms, functors, universal properties, comparison maps, and invariants that
remain coherent across mathematical worlds.

The first category-theory neighborhood should distinguish at least:

- integer primes as elements of `Z`;
- prime ideals and closed points in arithmetic geometry;
- finite places of a global field;
- monic irreducibles in `F_q[t]`;
- orbit or knot models of primes, marked as models or analogies unless a
  theorem supplies the dictionary;
- categorical or enriched invariants such as magnitude, connected to the
  existing “Magnitude of primes” source in
  [`src/core/registry.js`](src/core/registry.js) only after its exact
  category-theoretic provenance is cited;
- functoriality, base change, cohomology, topoi, duality, and comparison
  functors already discussed in the arithmetic-Hodge atlas;
- the finite-field-to-number-field comparison as a named missing edge rather
  than a vague `q -> 1` resemblance.

Any proposed functor must record:

1. source and target categories;
2. the object map;
3. the morphism map;
4. preservation of identities and composition;
5. which prime-related structures or statements it preserves;
6. whether that preservation is proved, conditional, conjectured, or merely
   observed.

A natural transformation must name its components and naturality square. An
equivalence must name a quasi-inverse and the relevant isomorphisms. A diagram
that only matches labels receives `analogous-to`, not `transports-to`.

The existing Lab node canvas is a computational DAG, not an implementation of
category theory. It may later render categorical diagrams, but the Atlas must
not infer categorical semantics from generic nodes and arrows.

## Future ingestion and migration

Ingestion should be incremental and reviewable.

### 1. Curated seed graph

Begin with a small manually reviewed core:

- prime numbers and their distinct avatars;
- the functions and operations already executable in PrimeVisuals;
- the fields and routes in `COUNCIL.md`;
- central statements such as the prime number theorem, explicit formula,
  Riemann hypothesis, Hardy–Littlewood prime tuples, Chowla, Green–Tao, and
  finite-field counterparts;
- registered null models, controls, and major obstructions;
- direct links to current presets, scripts, tests, and evidence packs.

Do not begin by importing every paragraph. A trusted small graph is more useful
than a large graph whose edge semantics are unreliable.

### 2. `KNOWLEDGE.md` candidate extraction

A future parser may extract dated headings, `Source:`, `Object:`, `Result:`,
`STATUS:`, `DECISION:`, and `CONNECTION:` blocks from `KNOWLEDGE.md`. Parsed
items enter a review queue with exact section provenance. The importer should:

- propose stable node candidates and aliases;
- map legacy labels such as `KNOWN-MATH`, `OBSERVED`, `OPEN`, `GRAVEYARD`, and
  `CLOSED-ARTIFACT` onto the two status axes;
- flag ambiguous or missing status rather than guessing;
- propose typed connections from `CONNECTION:` prose;
- detect references to older entries and corrections;
- never delete or silently replace the source prose.

### 3. Executable registry ingestion

Import machine-defined objects from:

- `SOURCES`, `PLANES`, `LENSES`, and `LIBRARY` in
  [`src/core/registry.js`](src/core/registry.js);
- transform operations in [`src/core/chips.js`](src/core/chips.js);
- formula functions and templates in [`src/core/labkit.js`](src/core/labkit.js);
- encoded residual predictions in
  [`src/core/residuals.js`](src/core/residuals.js);
- explanatory overlaps in [`src/core/guides.js`](src/core/guides.js).

These imports should create executable `visualization`, `operation`, `function`,
and `artifact` nodes. Theory classifications and theorem edges still require
curation.

### 4. Campaign graph ingestion

Normalize, rather than discard, the narrow graph work already completed:

- Two-Universes theorem catalogs, proof obligations, transport obstructions,
  branch-stop ledgers, and later campaign cycles;
- the arithmetic-Hodge axioms, framework matrix, missing comparison edges,
  theorem ladder, and Rosati obligation graph;
- the Crack Atlas experiment families and failure mutations in
  [`scripts/crack-atlas.mjs`](scripts/crack-atlas.mjs);
- static frontier instruments as visualization/artifact nodes.

Campaign-local IDs should retain aliases and provenance while mapping onto
global Atlas IDs. Conflicting statuses become explicit revision or correction
events, not last-write-wins updates.

### 5. Validation and publishing

A future validator should reject:

- dangling node IDs;
- unknown node kinds, status values, or relation types;
- `implies`, `equivalent-to`, `proved-by`, or `transports-to` edges without
  provenance and scope;
- `proved-conditional` statements without hypotheses;
- `refuted` statements without a reason or counterexample reference;
- `open` claims without a literature audit reference;
- accidental duplicate IDs or reused tombstones;
- deletion of revision history.

Publishing should produce deterministic JSON plus human-readable Markdown and
SVG/interactive views. Tests should verify schema validity, graph integrity,
status separation, historical continuity, and source resolution.

## Definition of success

The Atlas succeeds when it helps a researcher move from a broad question—“how
do primes interact with category theory, dynamics, or geometry?”—to a precise,
sourced path whose weak link is visible. Sometimes that weak link will be an
experiment we can run. Sometimes it will be a modest missing lemma. Sometimes
it will be a known major conjecture or a failed analogy, and the Atlas should
say so immediately.

The goal is not the largest graph. The goal is a truthful, evolving map that
makes good searches easier, repeated dead ends rarer, and genuinely new
theorem-shaped questions more precise.
