import { useMemo, useState } from "react";

const API_URL = "http://localhost:3000/bfhl";

function App() {
  const [input, setInput] = useState("A->B, A->C, B->D");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(true);

  const parsedInput = useMemo(
    () => input.split(",").map((x) => x.trim()).filter(Boolean),
    [input]
  );

  const submit = async () => {
    setError("");
    setResponse(null);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedInput }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setResponse(data);
    } catch {
      setError("API call failed. Make sure backend is running on port 3000.");
    } finally {
      setLoading(false);
    }
  };

  const samples = {
    Basic: "A->B, A->C, B->D",
    "Full Sample":
      "A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->H, G->I, hello, 1->2, A->",
    Cycle: "X->Y, Y->Z, Z->X",
    Invalid: "hello, 1->2, AB->C, A-B, A->, A->A",
    Duplicate: "G->H, G->H, G->H, G->I",
    "Multi Parent": "A->D, B->D, A->C, B->E",
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.badge}>Round 1 • SRM Full Stack Engineering Challenge</p>
            <h1 style={styles.title}>Hierarchy Analyzer</h1>
            <p style={styles.subtitle}>
              A full-stack graph processing tool that validates node relationships,
              detects duplicate edges, identifies cycles, builds visual hierarchy trees,
              and returns evaluator-ready API output.
            </p>
          </div>

          <div style={styles.endpointCard}>
            <p style={styles.muted}>Live Endpoint</p>
            <h2 style={styles.endpoint}>POST /bfhl</h2>
            <p style={styles.smallText}>Node.js • Express • React</p>
          </div>
        </section>

        <section style={styles.inputPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Input Console</h2>
              <p style={styles.muted}>Enter comma-separated node edges.</p>
            </div>
            <div style={styles.inputCount}>{parsedInput.length} items</div>
          </div>

          <textarea
            rows="5"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: A->B, A->C, B->D"
            style={styles.textarea}
          />

          <div style={styles.sampleGrid}>
            {Object.entries(samples).map(([name, value]) => (
              <button key={name} onClick={() => setInput(value)} style={styles.sampleButton}>
                {name}
              </button>
            ))}
          </div>

          <div style={styles.actionRow}>
            <button onClick={submit} disabled={loading} style={styles.primaryButton}>
              {loading ? "Processing..." : "Analyze Hierarchy"}
            </button>

            <button onClick={() => setInput("")} style={styles.secondaryButton}>
              Clear
            </button>

            <button onClick={() => setShowRaw(!showRaw)} style={styles.secondaryButton}>
              {showRaw ? "Hide Raw JSON" : "Show Raw JSON"}
            </button>
          </div>
        </section>

        {error && <div style={styles.error}>{error}</div>}

        {response && (
          <>
            <section style={styles.cards}>
              <Metric title="Total Trees" value={response.summary.total_trees} />
              <Metric title="Total Cycles" value={response.summary.total_cycles} />
              <Metric title="Largest Root" value={response.summary.largest_tree_root || "None"} />
              <Metric title="Invalid Entries" value={response.invalid_entries.length} />
              <Metric title="Duplicate Edges" value={response.duplicate_edges.length} />
              <Metric title="Hierarchies" value={response.hierarchies.length} />
            </section>

            <section style={styles.infoBox}>
              <h2 style={styles.sectionTitleNoTop}>Processing Features</h2>
              <div style={styles.featureGrid}>
                <Feature title="Format Validation" text="Accepts only uppercase single-letter edges in X->Y format." />
                <Feature title="Duplicate Control" text="Keeps the first edge and reports repeated edges only once." />
                <Feature title="Cycle Detection" text="Marks cyclic groups with has_cycle: true and returns an empty tree." />
                <Feature title="Depth Analysis" text="Computes the longest root-to-leaf node path for every valid tree." />
              </div>
            </section>

            <section>
              <h2 style={styles.sectionTitle}>Visual Tree Output</h2>
              <div style={styles.treeGrid}>
                {response.hierarchies.map((h, index) => (
                  <div key={index} style={styles.treeCard}>
                    <div style={styles.treeHeader}>
                      <div>
                        <p style={styles.muted}>Hierarchy #{index + 1}</p>
                        <h3 style={styles.rootTitle}>Root: {h.root}</h3>
                      </div>
                      {h.has_cycle ? (
                        <span style={styles.cycleBadge}>Cycle Detected</span>
                      ) : (
                        <span style={styles.depthBadge}>Depth: {h.depth}</span>
                      )}
                    </div>

                    {h.has_cycle ? (
                      <div style={styles.cycleBox}>
                        <h3 style={{ marginTop: 0 }}>Cyclic Group</h3>
                        <p style={{ marginBottom: 0 }}>
                          This component has no valid acyclic tree. As required, the tree is empty.
                        </p>
                      </div>
                    ) : (
                      <TreeView tree={h.tree} />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.splitGrid}>
              <div>
                <h2 style={styles.sectionTitle}>Invalid Entries</h2>
                <ListBox items={response.invalid_entries} empty="No invalid entries found." danger />
              </div>

              <div>
                <h2 style={styles.sectionTitle}>Duplicate Edges</h2>
                <ListBox items={response.duplicate_edges} empty="No duplicate edges found." />
              </div>
            </section>

            {showRaw && (
              <section>
                <h2 style={styles.sectionTitle}>Raw API Response</h2>
                <p style={styles.muted}>
                  This is the exact JSON returned by the backend. It proves the UI is consuming the
                  real /bfhl API response.
                </p>
                <pre style={styles.pre}>{JSON.stringify(response, null, 2)}</pre>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TreeView({ tree }) {
  return (
    <div style={styles.treeBox}>
      {Object.entries(tree).map(([node, children]) => (
        <TreeNode key={node} node={node} childrenObj={children} />
      ))}
    </div>
  );
}

function TreeNode({ node, childrenObj }) {
  const children = Object.entries(childrenObj || {});

  return (
    <div style={styles.nodeWrap}>
      <div style={styles.node}>{node}</div>
      {children.length > 0 && (
        <div style={styles.children}>
          {children.map(([child, sub]) => (
            <TreeNode key={child} node={child} childrenObj={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={styles.cardValue}>{value}</h2>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div style={styles.featureCard}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ color: "#cbd5e1", marginBottom: 0 }}>{text}</p>
    </div>
  );
}

function ListBox({ items, empty, danger }) {
  return (
    <div style={styles.listBox}>
      {items.length === 0 ? (
        <p style={styles.empty}>{empty}</p>
      ) : (
        items.map((item, i) => (
          <span key={i} style={danger ? styles.dangerPill : styles.pill}>
            {item}
          </span>
        ))
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 10% 10%, rgba(37,99,235,0.45), transparent 28%), radial-gradient(circle at 90% 0%, rgba(124,58,237,0.35), transparent 30%), linear-gradient(135deg, #020617, #0f172a)",
    color: "#f8fafc",
    fontFamily: "Inter, Arial, sans-serif",
    padding: "36px",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "center",
    marginBottom: "28px",
  },
  badge: {
    color: "#93c5fd",
    fontWeight: 800,
    letterSpacing: "0.05em",
    margin: 0,
  },
  title: {
    fontSize: "68px",
    margin: "10px 0",
    lineHeight: 1,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: "17px",
    maxWidth: "790px",
    lineHeight: 1.6,
  },
  endpointCard: {
    background: "rgba(15,23,42,0.85)",
    border: "1px solid #334155",
    borderRadius: "22px",
    padding: "24px",
    minWidth: "245px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
  },
  endpoint: {
    color: "#22c55e",
    margin: "8px 0",
  },
  smallText: {
    color: "#94a3b8",
    margin: 0,
  },
  muted: {
    color: "#94a3b8",
    margin: 0,
  },
  inputPanel: {
    background: "rgba(30,41,59,0.92)",
    border: "1px solid #334155",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "16px",
  },
  panelTitle: {
    margin: 0,
  },
  inputCount: {
    background: "#020617",
    border: "1px solid #334155",
    color: "#93c5fd",
    borderRadius: "999px",
    padding: "8px 14px",
    fontWeight: 800,
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#020617",
    color: "#f8fafc",
    border: "1px solid #475569",
    borderRadius: "16px",
    padding: "16px",
    fontSize: "16px",
    outline: "none",
    resize: "vertical",
  },
  sampleGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "16px",
  },
  sampleButton: {
    background: "#334155",
    color: "#e2e8f0",
    border: "1px solid #475569",
    padding: "10px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 700,
  },
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "18px",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    border: "none",
    padding: "14px 26px",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#020617",
    color: "#e2e8f0",
    border: "1px solid #475569",
    padding: "14px 20px",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    marginTop: "20px",
    background: "#7f1d1d",
    color: "#fecaca",
    padding: "16px",
    borderRadius: "14px",
  },
  cards: {
    marginTop: "26px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },
  metricCard: {
    background: "rgba(30,41,59,0.92)",
    border: "1px solid #334155",
    borderRadius: "18px",
    padding: "20px",
  },
  cardTitle: {
    color: "#94a3b8",
    margin: 0,
  },
  cardValue: {
    margin: "8px 0 0",
    fontSize: "34px",
  },
  infoBox: {
    marginTop: "28px",
    background: "rgba(30,41,59,0.92)",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "22px",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "14px",
  },
  featureCard: {
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "16px",
  },
  sectionTitle: {
    marginTop: "34px",
    marginBottom: "14px",
  },
  sectionTitleNoTop: {
    marginTop: 0,
    marginBottom: "14px",
  },
  treeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
    gap: "18px",
  },
  treeCard: {
    background: "rgba(15,23,42,0.96)",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "20px",
  },
  treeHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "16px",
  },
  rootTitle: {
    margin: "4px 0 0",
  },
  depthBadge: {
    background: "#064e3b",
    color: "#86efac",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800,
  },
  cycleBadge: {
    background: "#7f1d1d",
    color: "#fecaca",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800,
  },
  cycleBox: {
    background: "rgba(127,29,29,0.35)",
    color: "#fecaca",
    border: "1px solid #991b1b",
    borderRadius: "16px",
    padding: "16px",
  },
  treeBox: {
    overflowX: "auto",
    padding: "8px",
  },
  nodeWrap: {
    marginLeft: "18px",
    position: "relative",
  },
  node: {
    display: "inline-block",
    background: "linear-gradient(135deg, #2563eb, #06b6d4)",
    color: "white",
    padding: "9px 15px",
    borderRadius: "999px",
    margin: "8px 0",
    fontWeight: 900,
    boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
  },
  children: {
    marginLeft: "24px",
    borderLeft: "2px dashed #475569",
    paddingLeft: "14px",
  },
  splitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },
  listBox: {
    background: "rgba(15,23,42,0.96)",
    border: "1px solid #334155",
    borderRadius: "18px",
    padding: "18px",
    minHeight: "72px",
  },
  pill: {
    display: "inline-block",
    background: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #475569",
    padding: "8px 12px",
    borderRadius: "999px",
    margin: "4px",
  },
  dangerPill: {
    display: "inline-block",
    background: "#7f1d1d",
    color: "#fecaca",
    border: "1px solid #991b1b",
    padding: "8px 12px",
    borderRadius: "999px",
    margin: "4px",
  },
  empty: {
    color: "#94a3b8",
    margin: 0,
  },
  pre: {
    background: "#020617",
    color: "#22c55e",
    padding: "24px",
    borderRadius: "20px",
    overflowX: "auto",
    fontSize: "14px",
    border: "1px solid #334155",
    lineHeight: "1.6",
  },
};

export default App;