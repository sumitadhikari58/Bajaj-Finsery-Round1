<h1>Hierarchy Analyzer - SRM Full Stack Challenge</h1>

<p>
  A full-stack application that validates directed node relationships, detects duplicate edges and cycles,
  constructs hierarchy trees, and returns structured API insights.
</p>

<h2>Live Links</h2>

<ul>
  <li><strong>Frontend:</strong> https://bajaj-finsery-round1.vercel.app/</li>
  <li><strong>Backend Base URL:</strong> https://srm-bfhl-backend-j3bo.onrender.com</li>
  <li><strong>API Endpoint:</strong> POST /bfhl</li>
  <li><strong>GitHub Repository:</strong> https://github.com/sumitadhikari58/Bajaj-Finsery-Round1</li>
</ul>

<h2>Tech Stack</h2>

<ul>
  <li><strong>Frontend:</strong> React with Vite</li>
  <li><strong>Backend:</strong> Node.js and Express.js</li>
  <li><strong>Hosting:</strong> Vercel for frontend, Render for backend</li>
</ul>

<h2>Features</h2>

<ul>
  <li>Validates node relationships in strict <code>X-&gt;Y</code> format.</li>
  <li>Accepts only single uppercase alphabet nodes from A to Z.</li>
  <li>Rejects invalid entries and self-loops.</li>
  <li>Detects duplicate edges and reports them once.</li>
  <li>Handles multi-parent conflicts using the first-parent-wins rule.</li>
  <li>Detects cyclic groups and marks them using <code>has_cycle: true</code>.</li>
  <li>Builds independent hierarchy trees for valid acyclic groups.</li>
  <li>Calculates depth for each valid hierarchy.</li>
  <li>Computes summary metrics including total trees, total cycles, and largest tree root.</li>
  <li>Provides a visual frontend for testing and inspecting API output.</li>
</ul>

<h2>API Specification</h2>

<h3>Endpoint</h3>

<pre><code>POST /bfhl</code></pre>

<h3>Request Body</h3>

<pre><code>{
  "data": ["A-&gt;B", "A-&gt;C", "B-&gt;D"]
}</code></pre>

<h3>Sample Response</h3>

<pre><code>{
  "user_id": "sumitadhikari_14042005",
  "email_id": "sa5075@srmist.edu.in",
  "college_roll_number": "RA2311003010262",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {}
          },
          "C": {}
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}</code></pre>

<h2>Processing Approach</h2>

<ol>
  <li>Trim each input string before processing.</li>
  <li>Validate each entry using the strict uppercase edge pattern <code>^[A-Z]-&gt;[A-Z]$</code>.</li>
  <li>Reject self-loops such as <code>A-&gt;A</code>.</li>
  <li>Track duplicate edges using a set and report repeated edges only once.</li>
  <li>Apply the multi-parent rule by keeping the first encountered parent for a child node.</li>
  <li>Build an adjacency list from valid, non-duplicate edges.</li>
  <li>Group connected nodes into independent components.</li>
  <li>Detect cycles using DFS and recursion stack tracking.</li>
  <li>For acyclic groups, determine the root and recursively build a nested tree.</li>
  <li>Calculate depth using the longest root-to-leaf path.</li>
  <li>Generate final summary statistics.</li>
</ol>

<h2>Local Setup</h2>

<h3>Backend</h3>

<pre><code>cd backend
npm install
npm start</code></pre>

<p>The backend will run at:</p>

<pre><code>http://localhost:3000</code></pre>

<h3>Frontend</h3>

<pre><code>cd frontend
npm install
npm run dev</code></pre>

<p>The frontend will run at:</p>

<pre><code>http://localhost:5173</code></pre>

<h2>Deployment</h2>

<ul>
  <li>The backend is deployed on Render.</li>
  <li>The frontend is deployed on Vercel.</li>
  <li>CORS is enabled on the backend to allow frontend-backend communication.</li>
</ul>

<h2>Important Notes</h2>

<ul>
  <li>The <code>/bfhl</code> route accepts only POST requests.</li>
  <li>Opening <code>/bfhl</code> directly in the browser sends a GET request and may show <code>Cannot GET /bfhl</code>.</li>
  <li>Use the frontend, Postman, or Thunder Client to test the POST endpoint.</li>
  <li>Render free instances may take additional time on the first request due to cold start.</li>
</ul>

<h2>Author Details</h2>

<ul>
  <li><strong>Name:</strong> Sumit Adhikari</li>
  <li><strong>Email:</strong> sa5075@srmist.edu.in</li>
  <li><strong>Roll Number:</strong> RA2311003010262</li>
</ul>
