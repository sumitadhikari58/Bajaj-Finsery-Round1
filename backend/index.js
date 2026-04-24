const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

const USER_ID = "sumitadhikari_14042005";
const EMAIL_ID = "sa5075@srmist.edu.in";
const ROLL_NUMBER = "RA2311003010262";

app.get("/", (req, res) => {
  res.send("SRM Full Stack API is running");
});

function detectCycleInGroup(nodes, graph) {
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node) {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recursionStack.add(node);

    const children = graph[node] || [];
    for (const child of children) {
      if (dfs(child)) return true;
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of nodes) {
    if (dfs(node)) return true;
  }

  return false;
}

function buildTree(node, graph, visited = new Set()) {
  if (visited.has(node)) return {};

  visited.add(node);

  const children = graph[node] || [];
  const subtree = {};

  for (const child of children) {
    subtree[child] = buildTree(child, graph, new Set(visited));
  }

  return subtree;
}

function calculateDepth(node, graph, visited = new Set()) {
  if (visited.has(node)) return 0;

  visited.add(node);

  const children = graph[node] || [];

  if (children.length === 0) {
    return 1;
  }

  let maxChildDepth = 0;

  for (const child of children) {
    maxChildDepth = Math.max(
      maxChildDepth,
      calculateDepth(child, graph, new Set(visited))
    );
  }

  return 1 + maxChildDepth;
}

function getConnectedGroups(allNodes, graph) {
  const undirected = {};

  for (const node of allNodes) {
    undirected[node] = [];
  }

  for (const parent in graph) {
    for (const child of graph[parent]) {
      undirected[parent].push(child);
      undirected[child].push(parent);
    }
  }

  const visited = new Set();
  const groups = [];

  for (const node of [...allNodes].sort()) {
    if (visited.has(node)) continue;

    const group = [];
    const stack = [node];
    visited.add(node);

    while (stack.length > 0) {
      const current = stack.pop();
      group.push(current);

      for (const neighbor of undirected[current] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }

    groups.push(group.sort());
  }

  return groups;
}

app.post("/bfhl", (req, res) => {
  try {
    const data = req.body.data;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        error: "data must be an array",
      });
    }

    const invalid_entries = [];
    const duplicate_edges = [];
    const valid_edges = [];

    const seenEdges = new Set();
    const childToParent = new Map();

    for (const item of data) {
      const trimmed = String(item).trim();

      const isValidFormat = /^[A-Z]->[A-Z]$/.test(trimmed);
      const isSelfLoop = isValidFormat && trimmed[0] === trimmed[3];

      if (!isValidFormat || isSelfLoop) {
        invalid_entries.push(item);
        continue;
      }

      if (seenEdges.has(trimmed)) {
        if (!duplicate_edges.includes(trimmed)) {
          duplicate_edges.push(trimmed);
        }
        continue;
      }

      seenEdges.add(trimmed);

      const [parent, child] = trimmed.split("->");

      if (childToParent.has(child)) {
        continue;
      }

      childToParent.set(child, parent);
      valid_edges.push(trimmed);
    }

    const graph = {};
    const allNodes = new Set();
    const childNodes = new Set();

    for (const edge of valid_edges) {
      const [parent, child] = edge.split("->");

      if (!graph[parent]) {
        graph[parent] = [];
      }

      graph[parent].push(child);

      allNodes.add(parent);
      allNodes.add(child);
      childNodes.add(child);
    }

    for (const node of allNodes) {
      if (!graph[node]) {
        graph[node] = [];
      }
    }

    const groups = getConnectedGroups(allNodes, graph);
    const hierarchies = [];

    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = "";
    let largestDepth = 0;

    for (const group of groups) {
      const groupRoots = group.filter((node) => !childNodes.has(node)).sort();
      const hasCycle = detectCycleInGroup(group, graph);

      let root;

      if (groupRoots.length > 0) {
        root = groupRoots[0];
      } else {
        root = group[0];
      }

      if (hasCycle) {
        hierarchies.push({
          root,
          tree: {},
          has_cycle: true,
        });

        total_cycles++;
      } else {
        const tree = {};
        tree[root] = buildTree(root, graph);

        const depth = calculateDepth(root, graph);

        hierarchies.push({
          root,
          tree,
          depth,
        });

        total_trees++;

        if (
          depth > largestDepth ||
          (depth === largestDepth &&
            (largest_tree_root === "" || root < largest_tree_root))
        ) {
          largestDepth = depth;
          largest_tree_root = root;
        }
      }
    }

    return res.json({
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: ROLL_NUMBER,
      hierarchies,
      invalid_entries,
      duplicate_edges,
      summary: {
        total_trees,
        total_cycles,
        largest_tree_root,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});