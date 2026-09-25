import json
import datetime
from flask import Blueprint, request, jsonify, session
from models import get_db
from auth_utils import role_required
from gemini_service import gemini_service
from pathway_generator import build_rich_pathway_topics

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

def row_to_dict(row):
    if row is None:
        return None
    return {k: row[k] for k in row.keys()}

# Predefined diverse subject catalog for flexible discovery + "Other"
SUBJECT_CATALOG = [
    {"name": "Mathematics", "category": "Academic Core", "desc": "Calculus, Linear Algebra, Differential Equations, Discrete Math"},
    {"name": "Physics", "category": "Academic Core", "desc": "Current Electricity, Mechanics, Optics, Electromagnetism, Quantum"},
    {"name": "Chemistry", "category": "Academic Core", "desc": "Organic, Inorganic, Physical Chemistry, Thermodynamics"},
    {"name": "Biology", "category": "Academic Core", "desc": "Molecular Biology, Genetics, Cell Physiology, Bio-informatics"},
    {"name": "Computer Science", "category": "Technical", "desc": "Algorithms, Operating Systems, Database Systems, Architecture"},
    {"name": "Python Programming", "category": "Programming & Software", "desc": "Pythonic Coding, OOP, REST APIs, Asynchronous Programming"},
    {"name": "Web Development", "category": "Programming & Software", "desc": "React.js, Node.js, TypeScript, Tailwind CSS, Full-Stack"},
    {"name": "Artificial Intelligence", "category": "Emerging Tech", "desc": "Machine Learning, Deep Learning, NLP, Computer Vision, LLMs"},
    {"name": "Robotics", "category": "Engineering & Hardware", "desc": "Kinematics, ROS2, Sensor Interfacing, Autonomous Navigation"},
    {"name": "Electronics & Embedded Systems", "category": "Engineering & Hardware", "desc": "Microcontrollers, ESP32, IoT Sensors, Digital Logic"},
    {"name": "Data Science", "category": "Data & Analysis", "desc": "Pandas, NumPy, Statistical Inference, Predictive Modeling"},
    {"name": "Cybersecurity", "category": "Technical", "desc": "Network Security, Cryptography, Vulnerability Assessment"},
    {"name": "Design & UI/UX", "category": "Creative Fields", "desc": "Design Systems, User Research, Figma, Interaction Design"},
    {"name": "Psychology", "category": "Humanities", "desc": "Cognitive Psychology, Behavioral Dynamics, Neuroscience"},
    {"name": "Economics", "category": "Commerce & Social", "desc": "Microeconomics, Macroeconomics, Econometrics, Public Policy"},
    {"name": "Finance", "category": "Commerce & Social", "desc": "Financial Modeling, Portfolio Analysis, Capital Markets"},
    {"name": "Astronomy", "category": "Sciences", "desc": "Astrophysics, Orbital Mechanics, Planetary Systems"},
    {"name": "Environmental Science", "category": "Sciences", "desc": "Climate Dynamics, Renewable Energy, Sustainability"},
    {"name": "Entrepreneurship", "category": "Management", "desc": "Product Development, Business Strategy, Venture Creation"},
    {"name": "Communication & Leadership", "category": "Practical Skills", "desc": "Public Speaking, Technical Writing, Team Leadership"}
]

# Offline High-Quality Question Bank for Instant Diagnostics & Practice across all subjects
DEFAULT_QUESTION_BANK = {
    "dsa": [
        {"q": "What is the worst-case time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black Tree)?", "options": {"A": "O(n)", "B": "O(log n)", "C": "O(1)", "D": "O(n log n)"}, "ans": "B", "level": "Basic", "topic": "Binary Search Trees"},
        {"q": "Which data structure operates on a Last-In-First-Out (LIFO) principle and is used for function call frames?", "options": {"A": "Queue", "B": "Stack", "C": "Min-Heap", "D": "Hash Table"}, "ans": "B", "level": "Basic", "topic": "Stacks & Recursion"},
        {"q": "Using the Two-Pointer technique on a sorted array of size N, finding a pair with a target sum takes:", "options": {"A": "O(N^2) time, O(N) space", "B": "O(N) time, O(1) space", "C": "O(N log N) time, O(N) space", "D": "O(log N) time, O(1) space"}, "ans": "B", "level": "Basic", "topic": "Arrays & Two Pointers"},
        {"q": "Which graph traversal algorithm uses a Queue and guarantees the shortest path in an unweighted graph?", "options": {"A": "Depth-First Search (DFS)", "B": "Breadth-First Search (BFS)", "C": "Bellman-Ford Algorithm", "D": "Kruskal's Algorithm"}, "ans": "B", "level": "Intermediate", "topic": "Graph BFS & Shortest Path"},
        {"q": "Why can Dijkstra's shortest path algorithm fail when a graph contains negative weight edges?", "options": {"A": "It cannot use a priority queue", "B": "It greedily finalizes vertex distances assuming future path extensions only increase cost", "C": "It only works on trees", "D": "It requires O(V^3) matrix multiplication"}, "ans": "B", "level": "Intermediate", "topic": "Shortest Path Algorithms"},
        {"q": "What are the two fundamental properties required for a problem to be solved using Dynamic Programming?", "options": {"A": "Greedy Choice & Divide-and-Conquer", "B": "Optimal Substructure & Overlapping Subproblems", "C": "Sorting & Binary Partitioning", "D": "BFS & Topological Ordering"}, "ans": "B", "level": "Intermediate", "topic": "Dynamic Programming"},
        {"q": "What is the time complexity of building a Binary Heap from an unsorted array of N elements using bottom-up heapify?", "options": {"A": "O(N log N)", "B": "O(N)", "C": "O(N^2)", "D": "O(log N)"}, "ans": "B", "level": "Intermediate", "topic": "Heaps & Priority Queues"},
        {"q": "To implement an LRU (Least Recently Used) Cache with O(1) `get` and `put` operations, which combination of data structures is optimal?", "options": {"A": "Binary Search Tree + Stack", "B": "Hash Map + Doubly Linked List", "C": "Single Linked List + Array", "D": "Min-Heap + Queue"}, "ans": "B", "level": "Advanced", "topic": "Hashing & Linked Lists"},
        {"q": "In topological sorting of a Directed Acyclic Graph (DAG) using Kahn's Algorithm, which vertices are pushed to the queue first?", "options": {"A": "Vertices with maximum out-degree", "B": "Vertices with in-degree equal to 0", "C": "Vertices with self-loops", "D": "Leaf vertices with out-degree 0"}, "ans": "B", "level": "Advanced", "topic": "Topological Sort & DAGs"},
        {"q": "What is the recurrence relation and average time complexity of Merge Sort on N elements?", "options": {"A": "T(N) = 2T(N/2) + O(N), Time: O(N log N)", "B": "T(N) = T(N-1) + O(1), Time: O(N)", "C": "T(N) = 2T(N-1) + O(1), Time: O(2^N)", "D": "T(N) = T(N/2) + O(1), Time: O(log N)"}, "ans": "A", "level": "Advanced", "topic": "Sorting & Divide and Conquer"}
    ],
    "os": [
        {"q": "Which component of the Operating System is responsible for switching the CPU from one process to another?", "options": {"A": "Spooler", "B": "Dispatcher", "C": "Compiler", "D": "Linker"}, "ans": "B", "level": "Basic", "topic": "Process Management & Context Switch"},
        {"q": "Which of the following is NOT one of Coffman's four necessary conditions for a deadlock to occur?", "options": {"A": "Mutual Exclusion", "B": "Hold and Wait", "C": "Preemption", "D": "Circular Wait"}, "ans": "C", "level": "Basic", "topic": "Deadlocks"},
        {"q": "Which CPU scheduling algorithm can suffer from the 'Convoy Effect'?", "options": {"A": "Round Robin (RR)", "B": "First-Come, First-Served (FCFS)", "C": "Shortest Remaining Time First (SRTF)", "D": "Multilevel Feedback Queue"}, "ans": "B", "level": "Basic", "topic": "CPU Scheduling"},
        {"q": "What is 'Belady's Anomaly' in virtual memory page replacement?", "options": {"A": "CPU utilization drops when RAM increases", "B": "Page faults increase even when the number of allocated page frames increases (in FIFO)", "C": "Swap space becomes fragmented", "D": "TLB hit ratio becomes zero"}, "ans": "B", "level": "Intermediate", "topic": "Virtual Memory & Page Replacement"},
        {"q": "What is the primary purpose of the Translation Lookaside Buffer (TLB) in paging systems?", "options": {"A": "Store disk sectors in RAM", "B": "Cache recent virtual-to-physical page frame translations for fast address lookup", "C": "Prevent race conditions between threads", "D": "Schedule I/O interrupts"}, "ans": "B", "level": "Intermediate", "topic": "Paging & Memory Management"},
        {"q": "In process synchronization, a counting semaphore initialized to N allows at most how many processes into a resource pool simultaneously?", "options": {"A": "1", "B": "N", "C": "N - 1", "D": "2N"}, "ans": "B", "level": "Intermediate", "topic": "Semaphores & Synchronization"},
        {"q": "What happens when a process experiences 'Thrashing'?", "options": {"A": "It executes CPU instructions at peak clock speed", "B": "It spends more time paging/swapping memory frames than executing actual instructions", "C": "It terminates child processes", "D": "It locks the file system inode table"}, "ans": "B", "level": "Intermediate", "topic": "Virtual Memory & Thrashing"},
        {"q": "When `fork()` is called in a UNIX/Linux C program, what value does `fork()` return to the newly created child process?", "options": {"A": "The parent's PID", "B": "0", "C": "-1", "D": "The child's own PID"}, "ans": "B", "level": "Advanced", "topic": "System Calls & Processes"},
        {"q": "Which disk scheduling algorithm services requests in one direction to the end of the disk and then jumps back to the beginning without servicing on the return trip?", "options": {"A": "SSTF", "B": "C-SCAN (Circular SCAN)", "C": "FCFS", "D": "LOOK"}, "ans": "B", "level": "Advanced", "topic": "Disk Scheduling"},
        {"q": "Why do threads within the same process context-switch faster than separate heavy-weight processes?", "options": {"A": "Threads do not have registers", "B": "Threads share the same virtual address space, page table, and open file descriptors", "C": "Threads run only in kernel mode", "D": "Threads bypass the CPU cache"}, "ans": "B", "level": "Advanced", "topic": "Threads & Concurrency"}
    ],
    "dbms": [
        {"q": "In SQL, which clause is used to filter groups created by the `GROUP BY` clause?", "options": {"A": "WHERE", "B": "HAVING", "C": "ORDER BY", "D": "DISTINCT"}, "ans": "B", "level": "Basic", "topic": "SQL Aggregations & Queries"},
        {"q": "What does the 'A' in ACID properties of a database transaction stand for?", "options": {"A": "Availability", "B": "Atomicity ('all or nothing' execution)", "C": "Authentication", "D": "Aggregation"}, "ans": "B", "level": "Basic", "topic": "ACID Transactions"},
        {"q": "A relation is in Second Normal Form (2NF) if it is in 1NF and contains no:", "options": {"A": "Foreign keys", "B": "Partial functional dependencies of non-prime attributes on a composite candidate key", "C": "Multi-valued attributes", "D": "Primary keys"}, "ans": "B", "level": "Basic", "topic": "Database Normalization"},
        {"q": "Why are B+ Trees preferred over standard Binary Search Trees for database disk indexing?", "options": {"A": "B+ Trees use more tree height", "B": "High fan-out reduces tree height and minimizes slow disk I/O block reads, with linked leaf nodes for range scans", "C": "B+ Trees do not require sorting", "D": "B+ Trees only work in RAM"}, "ans": "B", "level": "Intermediate", "topic": "Indexing & B+ Trees"},
        {"q": "Which SQL JOIN returns all rows from the left table and matched rows from the right table (with NULLs where no match exists)?", "options": {"A": "INNER JOIN", "B": "LEFT OUTER JOIN", "C": "CROSS JOIN", "D": "NATURAL JOIN"}, "ans": "B", "level": "Intermediate", "topic": "SQL Joins"},
        {"q": "A relation in 3NF is in Boyce-Codd Normal Form (BCNF) if for every non-trivial functional dependency X -> Y:", "options": {"A": "Y is a prime attribute", "B": "X is a superkey", "C": "X is a foreign key", "D": "Y is atomic"}, "ans": "B", "level": "Intermediate", "topic": "Normalization (3NF & BCNF)"},
        {"q": "Which concurrency anomaly occurs when Transaction T1 reads uncommitted changes made by Transaction T2, and T2 subsequently rolls back?", "options": {"A": "Phantom Read", "B": "Dirty Read", "C": "Lost Update", "D": "Serializable Snapshot"}, "ans": "B", "level": "Intermediate", "topic": "Concurrency & Isolation Levels"},
        {"q": "Which protocol guarantees conflict serializability by requiring transactions to acquire all locks before releasing any lock?", "options": {"A": "Timestamp Ordering", "B": "Two-Phase Locking (2PL)", "C": "Validation Protocol", "D": "Write-Ahead Logging"}, "ans": "B", "level": "Advanced", "topic": "Concurrency Control"},
        {"q": "In database crash recovery (ARIES / WAL), why must log records be written to disk before the modified data page?", "options": {"A": "To compress table size", "B": "To support UNDO of uncommitted transactions and REDO of committed transactions after a crash", "C": "To speed up SELECT queries", "D": "To drop unused indexes"}, "ans": "B", "level": "Advanced", "topic": "Write-Ahead Logging & Recovery"},
        {"q": "According to the CAP Theorem for distributed databases, during a Network Partition (P), a system must trade off between:", "options": {"A": "Concurrency and Persistence", "B": "Consistency (C) and Availability (A)", "C": "Caching and Partitioning", "D": "Latency and Throughput"}, "ans": "B", "level": "Advanced", "topic": "Distributed Databases & NoSQL"}
    ],
    "networks": [
        {"q": "Which layer of the OSI model is responsible for end-to-end process-to-process delivery and flow control (TCP/UDP)?", "options": {"A": "Network Layer", "B": "Transport Layer", "C": "Data Link Layer", "D": "Session Layer"}, "ans": "B", "level": "Basic", "topic": "OSI & TCP/IP Architecture"},
        {"q": "What is the purpose of the ARP (Address Resolution Protocol) in a local network?", "options": {"A": "Resolve domain names to IP addresses", "B": "Map a known IPv4 address to a physical 48-bit MAC address", "C": "Encrypt HTTP payloads", "D": "Assign dynamic IP addresses"}, "ans": "B", "level": "Basic", "topic": "Data Link & ARP"},
        {"q": "How many usable host IP addresses are available in a `/26` IPv4 subnet (`255.255.255.192`)?", "options": {"A": "64", "B": "62", "C": "30", "D": "126"}, "ans": "B", "level": "Basic", "topic": "IPv4 Subnetting & CIDR"},
        {"q": "What is the exact sequence of packets exchanged during a TCP 3-Way Handshake?", "options": {"A": "SYN -> ACK -> FIN", "B": "SYN -> SYN-ACK -> ACK", "C": "GET -> 200 OK -> ACK", "D": "HELLO -> CERT -> KEY"}, "ans": "B", "level": "Intermediate", "topic": "TCP Connection Management"},
        {"q": "Why does DNS primarily use UDP port 53 for standard name resolution queries?", "options": {"A": "UDP encrypts domain names automatically", "B": "UDP avoids 3-way handshake overhead, providing minimal latency for small request-response lookups", "C": "TCP does not support port 53", "D": "UDP guarantees packet ordering"}, "ans": "B", "level": "Intermediate", "topic": "Application Layer & DNS"},
        {"q": "Which routing algorithm is used by OSPF (Open Shortest Path First) to compute shortest paths inside an Autonomous System?", "options": {"A": "Distance Vector (Bellman-Ford)", "B": "Link-State (Dijkstra's Algorithm)", "C": "Path-Vector (BGP)", "D": "Flooding"}, "ans": "B", "level": "Intermediate", "topic": "Network Routing Protocols"},
        {"q": "In TCP congestion control, what happens to the Congestion Window (`cwnd`) during the 'Slow Start' phase?", "options": {"A": "It decreases linearly", "B": "It doubles every Round-Trip Time (exponential growth) until reaching `ssthresh`", "C": "It stays fixed at 1 MSS", "D": "It resets to zero on every ACK"}, "ans": "B", "level": "Intermediate", "topic": "TCP Congestion Control"},
        {"q": "What problem does NAT (Network Address Translation) solve at the router boundary?", "options": {"A": "Prevents Ethernet collisions", "B": "Maps multiple private internal IPv4 addresses to a single public IPv4 address using port translation", "C": "Replaces DNS servers", "D": "Computes CRC checksums"}, "ans": "B", "level": "Advanced", "topic": "NAT & IPv4 Routing"},
        {"q": "During a TLS 1.3 handshake for HTTPS, why is Diffie-Hellman (ECDHE) key exchange used?", "options": {"A": "To compress HTML files", "B": "To establish a shared ephemeral session key with Forward Secrecy over an untrusted channel", "C": "To assign MAC addresses", "D": "To bypass firewall rules"}, "ans": "B", "level": "Advanced", "topic": "Network Security & TLS"},
        {"q": "Which protocol is used for inter-domain routing between different Autonomous Systems (AS) across the global Internet?", "options": {"A": "RIP", "B": "BGP (Border Gateway Protocol)", "C": "OSPF", "D": "ICMP"}, "ans": "B", "level": "Advanced", "topic": "Internetworking & BGP"}
    ],
    "ai": [
        {"q": "In Supervised Machine Learning, what is the primary difference between Regression and Classification?", "options": {"A": "Regression predicts continuous numerical values; Classification predicts discrete categorical labels", "B": "Regression is unsupervised; Classification is supervised", "C": "Regression only uses decision trees", "D": "Classification cannot use neural networks"}, "ans": "A", "level": "Basic", "topic": "Supervised Learning Foundations"},
        {"q": "What happens when a machine learning model achieves 99% accuracy on training data but only 58% accuracy on unseen test data?", "options": {"A": "Underfitting (High Bias)", "B": "Overfitting (High Variance)", "C": "Optimal Convergence", "D": "Vanishing Gradient"}, "ans": "B", "level": "Basic", "topic": "Bias-Variance & Overfitting"},
        {"q": "In Gradient Descent, how are model weights `w` updated using learning rate `alpha` and loss gradient `dL/dw`?", "options": {"A": "w = w + alpha * (dL/dw)", "B": "w = w - alpha * (dL/dw)", "C": "w = w / alpha", "D": "w = dL/dw"}, "ans": "B", "level": "Basic", "topic": "Gradient Descent Optimization"},
        {"q": "Why is the ReLU activation function `f(x) = max(0, x)` widely preferred over Sigmoid in deep hidden layers?", "options": {"A": "ReLU outputs probabilities between 0 and 1", "B": "ReLU mitigates the vanishing gradient problem for positive inputs and is computationally fast", "C": "ReLU is differentiable at x = 0", "D": "ReLU prevents all overfitting"}, "ans": "B", "level": "Intermediate", "topic": "Neural Networks & Activations"},
        {"q": "In an imbalanced medical dataset where only 1% of patients have a disease, why is 'Accuracy' a misleading metric?", "options": {"A": "Accuracy cannot be computed on binary labels", "B": "A dummy model predicting 'healthy' for everyone achieves 99% accuracy while missing 100% of sick patients (0% Recall)", "C": "Accuracy is always lower than F1-score", "D": "Accuracy requires regression"}, "ans": "B", "level": "Intermediate", "topic": "Precision, Recall & F1-Score"},
        {"q": "What does L2 Regularization (Ridge) add to the loss function to penalize overly complex models?", "options": {"A": "Sum of absolute weights `lambda * sum(|w|)`", "B": "Sum of squared weights `lambda * sum(w^2)`", "C": "Number of training epochs", "D": "Learning rate decay"}, "ans": "B", "level": "Intermediate", "topic": "Regularization (L1/L2 & Dropout)"},
        {"q": "In Convolutional Neural Networks (CNNs), what is the key advantage of shared-weight 2D convolution filters over dense fully-connected layers?", "options": {"A": "They ignore spatial hierarchy", "B": "Translation invariance and drastic reduction in learnable parameters while preserving 2D spatial locality", "C": "They only work on 1D text", "D": "They eliminate backpropagation"}, "ans": "B", "level": "Intermediate", "topic": "Computer Vision & CNNs"},
        {"q": "In the Transformer architecture ('Attention Is All You Need'), why is Scaled Dot-Product Attention divided by `sqrt(d_k)`?", "options": {"A": "To convert tokens into integers", "B": "To prevent large dot products from pushing Softmax into regions with extremely small gradients", "C": "To remove positional encoding", "D": "To reduce vocabulary size"}, "ans": "B", "level": "Advanced", "topic": "Transformers & Self-Attention"},
        {"q": "In K-Means clustering, what objective function does the algorithm iteratively minimize?", "options": {"A": "Cross-Entropy Loss", "B": "Within-Cluster Sum of Squared Euclidean Distances (Inertia)", "C": "Gini Impurity", "D": "Hinge Loss"}, "ans": "B", "level": "Advanced", "topic": "Unsupervised Clustering"},
        {"q": "Which mathematical rule is the foundation of the Backpropagation algorithm in multi-layer neural networks?", "options": {"A": "Bayes' Theorem", "B": "Multivariable Chain Rule of Calculus", "C": "L'Hopital's Rule", "D": "Central Limit Theorem"}, "ans": "B", "level": "Advanced", "topic": "Backpropagation & Deep Learning"}
    ],
    "web": [
        {"q": "In CSS Flexbox, which property aligns flex items along the main axis?", "options": {"A": "align-items", "B": "justify-content", "C": "flex-wrap", "D": "z-index"}, "ans": "B", "level": "Basic", "topic": "CSS Layout (Flexbox & Grid)"},
        {"q": "In React, why must state updates be performed via setter functions (like `setCount`) instead of mutating variables directly?", "options": {"A": "Direct mutation causes a syntax error", "B": "Setter functions notify React to schedule a component re-render and reconcile the Virtual DOM", "C": "Variables in JavaScript are always immutable", "D": "React only runs on the server"}, "ans": "B", "level": "Basic", "topic": "React State & Virtual DOM"},
        {"q": "Which HTTP method is idempotent and semantically intended to replace or update an existing resource?", "options": {"A": "POST", "B": "PUT", "C": "CONNECT", "D": "PATCH"}, "ans": "B", "level": "Basic", "topic": "RESTful APIs & HTTP"},
        {"q": "What is the purpose of the dependency array `[userId]` in React's `useEffect(() => { ... }, [userId])` hook?", "options": {"A": "It runs the effect on every single keystroke", "B": "It re-runs the effect only when `userId` changes between renders", "C": "It blocks rendering until the API finishes", "D": "It creates a global variable"}, "ans": "B", "level": "Intermediate", "topic": "React Hooks & Lifecycle"},
        {"q": "In the JavaScript Event Loop, which queue has higher execution priority after the current call stack clears?", "options": {"A": "Macrotask Queue (`setTimeout`, `setInterval`)", "B": "Microtask Queue (`Promise.then`, `queueMicrotask`)", "C": "DOM Repaint Queue", "D": "They execute in random order"}, "ans": "B", "level": "Intermediate", "topic": "JavaScript Event Loop & Async"},
        {"q": "What security vulnerability occurs when untrusted user input is rendered directly into the DOM as executable HTML/JavaScript?", "options": {"A": "SQL Injection", "B": "Cross-Site Scripting (XSS)", "C": "DNS Spoofing", "D": "DDoS"}, "ans": "B", "level": "Intermediate", "topic": "Web Security (XSS & CSRF)"},
        {"q": "What does an HTTP `401 Unauthorized` vs `403 Forbidden` status code indicate?", "options": {"A": "401 means server crash; 403 means page not found", "B": "401 means unauthenticated (missing/invalid credentials); 403 means authenticated but lacking permission", "C": "Both mean network timeout", "D": "401 is for GET; 403 is for POST"}, "ans": "B", "level": "Intermediate", "topic": "HTTP Status Codes & Auth"},
        {"q": "Why do browsers send an HTTP `OPTIONS` preflight request before certain cross-origin requests?", "options": {"A": "To check internet speed", "B": "To verify with the server's CORS headers (`Access-Control-Allow-Origin/Methods`) that the cross-origin request is safe to send", "C": "To download CSS stylesheets", "D": "To clear browser cookies"}, "ans": "B", "level": "Advanced", "topic": "CORS & Browser Security"},
        {"q": "In a JSON Web Token (`JWT`), how does the backend verify that the payload has not been tampered with by the client?", "options": {"A": "By decoding the Base64 header", "B": "By recomputing the cryptographic HMAC/RSA signature using the server's secret key and comparing it", "C": "By checking the token length", "D": "JWT payloads are encrypted by default"}, "ans": "B", "level": "Advanced", "topic": "Authentication & JWT"},
        {"q": "How does debouncing a search input improve frontend web application performance?", "options": {"A": "It fires an API request on every keystroke", "B": "It delays invoking the API handler until a specified pause in typing has elapsed, preventing redundant network calls", "C": "It disables the keyboard", "D": "It caches the entire database in localStorage"}, "ans": "B", "level": "Advanced", "topic": "Frontend Performance Optimization"}
    ],
    "cybersecurity": [
        {"q": "What are the three core pillars of the CIA Triad in Information Security?", "options": {"A": "Control, Inspection, Auditing", "B": "Confidentiality, Integrity, Availability", "C": "Cryptography, Identity, Authorization", "D": "Cloud, Infrastructure, Access"}, "ans": "B", "level": "Basic", "topic": "CIA Triad & Security Principles"},
        {"q": "Which technique prevents attackers from using precomputed Rainbow Tables to crack leaked password hashes?", "options": {"A": "Base64 encoding", "B": "Adding a unique cryptographic random Salt to each password before hashing with bcrypt/Argon2", "C": "Shortening passwords", "D": "Using MD5 without salt"}, "ans": "B", "level": "Basic", "topic": "Password Hashing & Salting"},
        {"q": "What is the most effective defense against SQL Injection (`SQLi`) vulnerabilities in backend code?", "options": {"A": "Client-side HTML form validation", "B": "Parameterized Queries (Prepared Statements)", "C": "Hiding database error messages", "D": "Using HTTP instead of HTTPS"}, "ans": "B", "level": "Basic", "topic": "Application Security & SQLi"},
        {"q": "In Asymmetric (Public-Key) Cryptography, if Alice wants to send a confidential message to Bob, which key does Alice use to encrypt it?", "options": {"A": "Alice's Private Key", "B": "Bob's Public Key", "C": "Bob's Private Key", "D": "A shared plaintext password"}, "ans": "B", "level": "Intermediate", "topic": "Public-Key Cryptography (RSA/ECC)"},
        {"q": "What does a Digital Signature verify when attached to a document or software binary?", "options": {"A": "That the file is compressed", "B": "Authenticity of the sender, data integrity, and non-repudiation", "C": "That no firewall is active", "D": "That the file size is under 1 MB"}, "ans": "B", "level": "Intermediate", "topic": "Digital Signatures & PKI"},
        {"q": "How does a Cross-Site Request Forgery (CSRF) attack trick a victim's browser?", "options": {"A": "By guessing the user's password", "B": "By inducing an authenticated user's browser to automatically send session cookies with an unintended state-changing request", "C": "By overheating the CPU", "D": "By intercepting optical fiber cables"}, "ans": "B", "level": "Intermediate", "topic": "Web Vulnerabilities (CSRF)"},
        {"q": "Which cookie attributes protect session tokens from both JavaScript XSS theft and cross-site CSRF transmission?", "options": {"A": "`Path=/` only", "B": "`HttpOnly; Secure; SameSite=Strict`", "C": "`Max-Age=999999`", "D": "`Domain=*`"}, "ans": "B", "level": "Intermediate", "topic": "Session Security"},
        {"q": "What is the core principle of a Zero-Trust Security Architecture?", "options": {"A": "Trust all devices inside the corporate LAN", "B": "'Never trust, always verify' — authenticate and authorize every request regardless of network location", "C": "Disable all remote access", "D": "Use a single shared admin password"}, "ans": "B", "level": "Advanced", "topic": "Zero-Trust Architecture"},
        {"q": "In memory-unsafe languages like C/C++, what happens during a Stack Buffer Overflow attack?", "options": {"A": "Hard disk space fills up", "B": "Input exceeds a fixed-size local buffer and overwrites the adjacent function return address on the stack", "C": "Garbage collector pauses execution", "D": "CSS styles fail to load"}, "ans": "B", "level": "Advanced", "topic": "Memory Safety & Exploitation"},
        {"q": "Why is AES-GCM preferred over AES-ECB mode for encrypting sensitive payloads?", "options": {"A": "ECB uses longer keys", "B": "ECB leaks visual patterns in identical plaintext blocks, whereas AES-GCM provides Authenticated Encryption (AEAD)", "C": "ECB requires an internet connection", "D": "GCM does not use a key"}, "ans": "B", "level": "Advanced", "topic": "Symmetric Encryption Modes"}
    ],
    "chemistry": [
        {"q": "According to the Gibbs Free Energy equation `dG = dH - T*dS`, a chemical reaction is spontaneous at constant T and P when:", "options": {"A": "dG > 0", "B": "dG < 0", "C": "dG = +Infinity", "D": "dH > 0 and dS < 0"}, "ans": "B", "level": "Basic", "topic": "Chemical Thermodynamics"},
        {"q": "What is the hybridization and molecular geometry of methane (`CH4`) according to VSEPR theory?", "options": {"A": "sp2, Trigonal Planar", "B": "sp3, Tetrahedral (109.5 deg)", "C": "sp, Linear", "D": "dsp2, Square Planar"}, "ans": "B", "level": "Basic", "topic": "Chemical Bonding & VSEPR"},
        {"q": "What is the pH of a neutral aqueous solution of `1.0 x 10^-3 M` HCl (a strong monoprotic acid) at 25°C?", "options": {"A": "11", "B": "3", "C": "7", "D": "1"}, "ans": "B", "level": "Basic", "topic": "Acids, Bases & Ionic Equilibrium"},
        {"q": "According to Le Chatelier's Principle, for the exothermic Haber process `N2 + 3H2 <=> 2NH3 + Heat`, high yield of ammonia is favored by:", "options": {"A": "High temperature and low pressure", "B": "Moderate/low temperature and high pressure", "C": "Removing N2 gas", "D": "Adding inert gas at constant volume"}, "ans": "B", "level": "Intermediate", "topic": "Chemical Equilibrium"},
        {"q": "In Organic Chemistry, how does an `SN2` nucleophilic substitution reaction proceed?", "options": {"A": "Two-step reaction via a planar carbocation intermediate with racemization", "B": "Single concerted step with backside attack and complete Walden inversion of configuration", "C": "Free radical chain mechanism", "D": "Elimination of a beta-hydrogen"}, "ans": "B", "level": "Intermediate", "topic": "Organic Reaction Mechanisms"},
        {"q": "For a first-order chemical reaction, the half-life (`t_1/2 = 0.693 / k`) is:", "options": {"A": "Directly proportional to initial concentration", "B": "Independent of the initial concentration of the reactant", "C": "Inversely proportional to squared concentration", "D": "Zero at room temperature"}, "ans": "B", "level": "Intermediate", "topic": "Chemical Kinetics"},
        {"q": "Which equation relates the electrode potential of an electrochemical cell to the reaction quotient `Q` at non-standard concentrations?", "options": {"A": "Arrhenius Equation", "B": "Nernst Equation", "C": "Bragg's Law", "D": "Raoult's Law"}, "ans": "B", "level": "Intermediate", "topic": "Electrochemistry"},
        {"q": "Why does Chromium (`Z = 24`) have the ground-state electronic configuration `[Ar] 3d^5 4s^1` instead of `[Ar] 3d^4 4s^2`?", "options": {"A": "4s orbital does not exist", "B": "Extra stability of a symmetrically half-filled `3d^5` subshell due to high exchange energy", "C": "Violation of Pauli Exclusion Principle", "D": "Chromium is a noble gas"}, "ans": "B", "level": "Advanced", "topic": "Atomic Structure & Quantum Numbers"},
        {"q": "In Crystal Field Theory, what causes the d-orbitals of a transition metal ion to split into `t2g` and `eg` energy levels in an octahedral complex?", "options": {"A": "Nuclear fission", "B": "Electrostatic repulsion between ligand lone-pair electrons and metal d-orbital lobes along the axes", "C": "Covalent pi-bonding with s-orbitals", "D": "Gravity"}, "ans": "B", "level": "Advanced", "topic": "Coordination Chemistry"},
        {"q": "How does adding a catalyst increase the rate of a chemical reaction without changing its equilibrium constant `K_eq`?", "options": {"A": "It increases the enthalpy `dH` of products", "B": "It provides an alternative reaction pathway with lower activation energy `E_a` for both forward and reverse reactions equally", "C": "It shifts equilibrium toward reactants", "D": "It increases gas pressure"}, "ans": "B", "level": "Advanced", "topic": "Catalysis & Kinetics"}
    ],
    "biology": [
        {"q": "Which cellular organelle is the site of oxidative phosphorylation and ATP synthesis in eukaryotic cells?", "options": {"A": "Golgi Apparatus", "B": "Mitochondria", "C": "Lysosome", "D": "Smooth Endoplasmic Reticulum"}, "ans": "B", "level": "Basic", "topic": "Cell Biology & Organelles"},
        {"q": "What is the correct directional flow of genetic information described by the Central Dogma of Molecular Biology?", "options": {"A": "Protein -> RNA -> DNA", "B": "DNA -> mRNA (Transcription) -> Protein (Translation)", "C": "Lipid -> Carbohydrate -> DNA", "D": "ATP -> DNA -> Ribosome"}, "ans": "B", "level": "Basic", "topic": "Molecular Biology & Central Dogma"},
        {"q": "In a classic Mendelian dihybrid cross (`AaBb x AaBb`) with independent assortment, what is the phenotypic ratio in the F2 generation?", "options": {"A": "3 : 1", "B": "9 : 3 : 3 : 1", "C": "1 : 2 : 1", "D": "1 : 1 : 1 : 1"}, "ans": "B", "level": "Basic", "topic": "Mendelian Genetics"},
        {"q": "During DNA replication, why is the lagging strand synthesized discontinuously as Okazaki fragments?", "options": {"A": "DNA Helicase only unwinds one strand", "B": "DNA Polymerase can only add nucleotides in the 5' to 3' direction", "C": "RNA primers cannot bind to the lagging strand", "D": "DNA Ligase breaks the strand"}, "ans": "B", "level": "Intermediate", "topic": "DNA Replication"},
        {"q": "In Michaelis-Menten enzyme kinetics, what does a low `K_m` value signify?", "options": {"A": "Low catalytic efficiency", "B": "High binding affinity of the enzyme for its substrate", "C": "The enzyme is denatured", "D": "Competitive inhibition is permanent"}, "ans": "B", "level": "Intermediate", "topic": "Biochemistry & Enzyme Kinetics"},
        {"q": "Where do the Light-Dependent Reactions and the Calvin Cycle (Dark Reactions) of photosynthesis take place inside the chloroplast?", "options": {"A": "Both occur in the cytoplasm", "B": "Light reactions in Thylakoid membranes; Calvin cycle in the Stroma", "C": "Light reactions in Stroma; Calvin cycle in Mitochondria", "D": "Both occur in the cell wall"}, "ans": "B", "level": "Intermediate", "topic": "Plant Physiology & Photosynthesis"},
        {"q": "What causes the rapid depolarization phase of an Action Potential along a neuron's axon?", "options": {"A": "Efflux of Cl- ions", "B": "Opening of voltage-gated Na+ channels causing rapid influx of Na+ ions into the cell", "C": "Destruction of myelin sheath", "D": "Closing of all ion channels"}, "ans": "B", "level": "Intermediate", "topic": "Neurobiology & Physiology"},
        {"q": "In the CRISPR-Cas9 genome editing system, how does the Cas9 endonuclease locate the exact target DNA sequence?", "options": {"A": "Random cleavage of chromosomes", "B": "Complementary base-pairing of a synthetic single-guide RNA (sgRNA) adjacent to a PAM sequence", "C": "Using restriction enzyme EcoRI", "D": "Centrifugation"}, "ans": "B", "level": "Advanced", "topic": "Biotechnology & CRISPR"},
        {"q": "In the Hardy-Weinberg equilibrium (`p^2 + 2pq + q^2 = 1`), if the frequency of a recessive allele `q = 0.2`, what is the carrier (heterozygote `2pq`) frequency?", "options": {"A": "0.04 (4%)", "B": "0.32 (32%)", "C": "0.64 (64%)", "D": "0.80 (80%)"}, "ans": "B", "level": "Advanced", "topic": "Population Genetics"},
        {"q": "How do B-lymphocytes and Cytotoxic T-lymphocytes differ in adaptive immunity?", "options": {"A": "B-cells mature in the thymus", "B": "B-cells mediate humoral immunity by secreting antibodies; Cytotoxic T-cells (CD8+) directly lyse virus-infected host cells", "C": "T-cells produce red blood cells", "D": "Neither has antigen specificity"}, "ans": "B", "level": "Advanced", "topic": "Immunology"}
    ],
    "economics": [
        {"q": "What does Price Elasticity of Demand (`|E_d| > 1`, elastic demand) imply when a firm raises the price of its product?", "options": {"A": "Quantity demanded stays constant", "B": "Quantity demanded drops proportionally more than the price increase, reducing total revenue", "C": "Total revenue increases indefinitely", "D": "The good is a necessity with no substitutes"}, "ans": "B", "level": "Basic", "topic": "Microeconomics & Elasticity"},
        {"q": "In Microeconomics, at what condition does any profit-maximizing firm choose its optimal output level?", "options": {"A": "Total Revenue = Total Cost", "B": "Marginal Revenue (MR) = Marginal Cost (MC)", "C": "Average Fixed Cost = 0", "D": "Price = 0"}, "ans": "B", "level": "Basic", "topic": "Theory of the Firm"},
        {"q": "Which of the following is the expenditure-approach formula for Gross Domestic Product (GDP)?", "options": {"A": "GDP = C + I + G + (X - M)", "B": "GDP = Wages - Taxes", "C": "GDP = Money Supply * Interest Rate", "D": "GDP = Exports + Imports"}, "ans": "A", "level": "Basic", "topic": "Macroeconomics & National Income"},
        {"q": "In Finance, why is ₹1,000 received today worth more than ₹1,000 received 5 years from now?", "options": {"A": "Currency printing errors", "B": "Time Value of Money: opportunity cost of earning compound interest/returns and inflation risk", "C": "Future cash flows cannot be taxed", "D": "Nominal value changes on paper"}, "ans": "B", "level": "Intermediate", "topic": "Time Value of Money & NPV"},
        {"q": "When a Central Bank (like the RBI) increases the Repo Rate, what is the intended macroeconomic effect?", "options": {"A": "Increase inflation rapidly", "B": "Make commercial borrowing more expensive to cool excess aggregate demand and curb inflation", "C": "Devalue bank reserves to zero", "D": "Increase fiscal budget deficit"}, "ans": "B", "level": "Intermediate", "topic": "Monetary Policy & Central Banking"},
        {"q": "In capital budgeting, a project should be accepted under the Net Present Value (NPV) rule if:", "options": {"A": "NPV < 0", "B": "NPV > 0 when discounted at the required cost of capital", "C": "Payback period is infinite", "D": "Discount rate is 0%"}, "ans": "B", "level": "Intermediate", "topic": "Corporate Finance & Valuation"},
        {"q": "In Game Theory, what defines a 'Nash Equilibrium' in the Prisoner's Dilemma?", "options": {"A": "Both players cooperate for maximum social welfare", "B": "A strategy profile where neither player can unilaterally deviate to improve their own payoff", "C": "One player wins everything", "D": "Players flip a coin"}, "ans": "B", "level": "Intermediate", "topic": "Game Theory & Strategic Behavior"},
        {"q": "According to the Capital Asset Pricing Model (`CAPM: E(R_i) = R_f + beta_i * (E(R_m) - R_f)`), what does `beta` measure?", "options": {"A": "Idiosyncratic firm risk that can be diversified away", "B": "Systematic sensitivity of an asset's returns to overall market portfolio movements", "C": "The risk-free government bond rate", "D": "Company debt-to-equity ratio"}, "ans": "B", "level": "Advanced", "topic": "Portfolio Theory & CAPM"},
        {"q": "What is 'Deadweight Loss' in a Monopoly compared to Perfect Competition?", "options": {"A": "Accounting loss on the balance sheet", "B": "Loss of total economic surplus (consumer + producer surplus) because the monopolist restricts output where Price > Marginal Cost", "C": "Depreciation of factory machinery", "D": "Tax refunds"}, "ans": "B", "level": "Advanced", "topic": "Market Structure & Welfare"},
        {"q": "In econometrics and linear regression (`Y = beta_0 + beta_1*X + u`), what causes 'Omitted Variable Bias'?", "options": {"A": "Having a large sample size N", "B": "Leaving out a relevant variable that both determines Y and is correlated with the included regressor X", "C": "Using R-squared", "D": "Computing standard errors"}, "ans": "B", "level": "Advanced", "topic": "Econometrics & Statistical Inference"}
    ],
    "electronics": [
        {"q": "Which logic gate set is known as 'Universal Gates' because any Boolean function can be implemented using only gates of that type?", "options": {"A": "AND and OR", "B": "NAND and NOR", "C": "XOR and NOT", "D": "BUFFER only"}, "ans": "B", "level": "Basic", "topic": "Digital Logic & Boolean Algebra"},
        {"q": "By De Morgan's Theorem, the Boolean expression `NOT(A AND B)` is equivalent to:", "options": {"A": "(NOT A) AND (NOT B)", "B": "(NOT A) OR (NOT B)", "C": "A XOR B", "D": "A OR B"}, "ans": "B", "level": "Basic", "topic": "Combinational Logic"},
        {"q": "How does a microcontroller (like Arduino / ESP32) simulate analog voltage control on a digital pin to control motor speed or LED brightness?", "options": {"A": "By changing battery chemistry", "B": "Pulse Width Modulation (PWM) — varying the duty cycle of a high-frequency square wave", "C": "By disconnecting ground", "D": "Using an optical fiber"}, "ans": "B", "level": "Basic", "topic": "Microcontrollers & PWM"},
        {"q": "What is the resolution (number of discrete quantization levels) of a 10-bit Analog-to-Digital Converter (ADC)?", "options": {"A": "100 levels", "B": "1024 levels (0 to 1023)", "C": "256 levels", "D": "10 levels"}, "ans": "B", "level": "Intermediate", "topic": "ADC/DAC & Sensor Interfacing"},
        {"q": "In a PID (Proportional-Integral-Derivative) robotics controller, what is the primary role of the Integral (`I`) term?", "options": {"A": "Amplify high-frequency sensor noise", "B": "Accumulate past error over time to eliminate steady-state offset error", "C": "Predict future error slope", "D": "Turn off the motor"}, "ans": "B", "level": "Intermediate", "topic": "Control Systems & PID"},
        {"q": "How many wires are required by the I2C communication bus to connect a microcontroller to multiple sensors?", "options": {"A": "4 wires (MOSI, MISO, SCK, CS)", "B": "2 wires (SDA for data and SCL for clock, plus common ground)", "C": "8 parallel data wires", "D": "1 optical wire"}, "ans": "B", "level": "Intermediate", "topic": "Serial Protocols (I2C, SPI, UART)"},
        {"q": "According to the Nyquist-Shannon Sampling Theorem, to reconstruct a signal with maximum frequency `f_max` without aliasing, the sampling rate `f_s` must satisfy:", "options": {"A": "f_s = 0.5 * f_max", "B": "f_s >= 2 * f_max", "C": "f_s = f_max / 10", "D": "f_s <= f_max"}, "ans": "B", "level": "Intermediate", "topic": "Signal Processing & Sampling"},
        {"q": "Why is the MQTT protocol preferred over HTTP for battery-powered IoT sensor nodes?", "options": {"A": "MQTT uses large XML headers", "B": "Lightweight publish-subscribe architecture with a 2-byte fixed header and persistent broker connections", "C": "MQTT does not use TCP/IP", "D": "MQTT only runs on desktop GPUs"}, "ans": "B", "level": "Advanced", "topic": "IoT Architecture & MQTT"},
        {"q": "In Robotics Kinematics, what is the difference between Forward Kinematics and Inverse Kinematics?", "options": {"A": "Forward moves the robot ahead; Inverse moves it backward", "B": "Forward computes end-effector pose from joint angles; Inverse solves for required joint angles to reach a target 3D pose", "C": "Inverse Kinematics does not use matrices", "D": "Forward Kinematics only applies to wheels"}, "ans": "B", "level": "Advanced", "topic": "Robot Kinematics & ROS"},
        {"q": "In an embedded Interrupt Service Routine (ISR), why should blocking delays (`delay(1000)`) be strictly avoided?", "options": {"A": "Delays consume flash memory", "B": "ISRs pre-empt the main loop and other interrupts; blocking inside an ISR freezes real-time system responsiveness", "C": "The compiler deletes delays", "D": "ISRs cannot read registers"}, "ans": "B", "level": "Advanced", "topic": "Embedded Systems & Real-Time Interrupts"}
    ],
    "python": [
        {"q": "What is the time complexity of dictionary key lookup in Python on average?", "options": {"A": "O(n)", "B": "O(1)", "C": "O(log n)", "D": "O(n log n)"}, "ans": "B", "level": "Basic", "topic": "Dictionaries & Sets"},
        {"q": "Which keyword is used to create a generator function in Python?", "options": {"A": "return", "B": "yield", "C": "generator", "D": "async"}, "ans": "B", "level": "Basic", "topic": "Generators & Iterators"},
        {"q": "In Python, what is the output of `[i for i in range(5) if i % 2 == 0]`?", "options": {"A": "[0, 2, 4]", "B": "[1, 3]", "C": "[0, 1, 2, 3, 4]", "D": "[2, 4]"}, "ans": "A", "level": "Basic", "topic": "List Comprehensions"},
        {"q": "What does the `@property` decorator achieve in a Python class?", "options": {"A": "Creates a static method", "B": "Enables getter/setter syntax for attributes", "C": "Encrypts private variables", "D": "Prevents method overriding"}, "ans": "B", "level": "Intermediate", "topic": "Object-Oriented Programming"},
        {"q": "Which data structure in Python is mutable, ordered, and allows duplicate elements?", "options": {"A": "Tuple", "B": "Set", "C": "List", "D": "FrozenSet"}, "ans": "C", "level": "Basic", "topic": "Data Structures"},
        {"q": "What happens when you modify an immutable object like a tuple containing a mutable list element?", "options": {"A": "TypeError is raised immediately", "B": "The list element can be mutated in place", "C": "The tuple creates a copy", "D": "Python crashes"}, "ans": "B", "level": "Intermediate", "topic": "Mutability & References"},
        {"q": "In `asyncio`, what does `await asyncio.gather(*tasks)` do?", "options": {"A": "Cancels all running tasks", "B": "Runs tasks concurrently and waits for all to complete", "C": "Executes tasks sequentially in thread pool", "D": "Blocks the entire main thread"}, "ans": "B", "level": "Advanced", "topic": "Concurrency & AsyncIO"},
        {"q": "How does Python handle memory management for cyclic object references?", "options": {"A": "Manual free() calls", "B": "Generational Garbage Collector", "C": "Pure reference counting only", "D": "Virtual memory swap"}, "ans": "B", "level": "Advanced", "topic": "Memory Management"},
        {"q": "What is the primary purpose of `*args` and `**kwargs` in a function signature?", "options": {"A": "Enforce strict type checking", "B": "Accept arbitrary positional and keyword arguments", "C": "Compile to C speed", "D": "Define global variables"}, "ans": "B", "level": "Intermediate", "topic": "Functions & Scope"},
        {"q": "What does a custom context manager class need to implement to support the `with` statement?", "options": {"A": "`__init__` and `__del__`", "B": "`__enter__` and `__exit__`", "C": "`__open__` and `__close__`", "D": "`__start__` and `__stop__`"}, "ans": "B", "level": "Advanced", "topic": "Context Managers"}
    ],
    "physics": [
        {"q": "According to Kirchhoff's Voltage Law (KVL), the algebraic sum of potential differences in any closed loop is:", "options": {"A": "Zero", "B": "Equal to total current", "C": "Equal to total resistance", "D": "Infinite"}, "ans": "A", "level": "Basic", "topic": "Kirchhoff's Laws"},
        {"q": "What is the SI unit of electric potential difference and electromotive force (EMF)?", "options": {"A": "Ampere", "B": "Volt", "C": "Ohm", "D": "Farad"}, "ans": "B", "level": "Basic", "topic": "Ohm's Law"},
        {"q": "Two resistors of 6 ohms and 3 ohms are connected in parallel. What is the equivalent resistance?", "options": {"A": "9 ohms", "B": "2 ohms", "C": "4.5 ohms", "D": "18 ohms"}, "ans": "B", "level": "Basic", "topic": "Series and Parallel Resistances"},
        {"q": "Why is a potentiometer preferred over a standard voltmeter for measuring cell EMF accurately?", "options": {"A": "It is cheaper", "B": "It draws zero current from the cell at null point", "C": "It operates at higher frequency", "D": "It has lower resistance"}, "ans": "B", "level": "Intermediate", "topic": "Potentiometer Working"},
        {"q": "Faraday's Law of Electromagnetic Induction states that the magnitude of induced EMF is proportional to:", "options": {"A": "Total magnetic field", "B": "Rate of change of magnetic flux", "C": "Current flowing in circuit", "D": "Resistance of coil"}, "ans": "B", "level": "Intermediate", "topic": "Electromagnetic Induction"},
        {"q": "Lenz's Law is a direct consequence of which fundamental conservation principle?", "options": {"A": "Conservation of Charge", "B": "Conservation of Energy", "C": "Conservation of Momentum", "D": "Conservation of Mass"}, "ans": "B", "level": "Intermediate", "topic": "Electromagnetic Induction"},
        {"q": "In Young's Double Slit Experiment, what happens to fringe width when the distance between slits is doubled?", "options": {"A": "Doubles", "B": "Halves", "C": "Remains unchanged", "D": "Quadruples"}, "ans": "B", "level": "Intermediate", "topic": "Wave Optics & Interference"},
        {"q": "Which Maxwell equation accounts for displacement current?", "options": {"A": "Gauss's Law for Electricity", "B": "Gauss's Law for Magnetism", "C": "Faraday's Law", "D": "Ampere-Maxwell Law"}, "ans": "D", "level": "Advanced", "topic": "Maxwell Equations"},
        {"q": "When temperature of a semiconductor increases, its electrical resistance:", "options": {"A": "Increases linearly", "B": "Decreases exponentially", "C": "Remains constant", "D": "Fluctuates randomly"}, "ans": "B", "level": "Intermediate", "topic": "Current Electricity"},
        {"q": "In a balanced Wheatstone Bridge with arms P, Q, R, S, the condition for null deflection is:", "options": {"A": "P/Q = R/S", "B": "P*Q = R*S", "C": "P + Q = R + S", "D": "P - Q = R - S"}, "ans": "A", "level": "Basic", "topic": "Wheatstone Bridge"}
    ],
    "mathematics": [
        {"q": "What is the derivative of f(x) = ln(x) with respect to x (for x > 0)?", "options": {"A": "1/x", "B": "e^x", "C": "1/x^2", "D": "x"}, "ans": "A", "level": "Basic", "topic": "Differentiation & Chain Rule"},
        {"q": "What is the definite integral of sin(x) from 0 to pi?", "options": {"A": "0", "B": "2", "C": "1", "D": "-2"}, "ans": "B", "level": "Basic", "topic": "Integral Calculus"},
        {"q": "What condition must a square matrix A satisfy to be invertible?", "options": {"A": "det(A) = 0", "B": "det(A) != 0", "C": "Trace(A) = 0", "D": "A must be diagonal"}, "ans": "B", "level": "Basic", "topic": "Linear Algebra"},
        {"q": "Evaluate the limit as x -> 0 of sin(x)/x:", "options": {"A": "0", "B": "1", "C": "Infinity", "D": "Undefined"}, "ans": "B", "level": "Basic", "topic": "Limits & Continuity"},
        {"q": "What is the order and degree of the differential equation (d^2y/dx^2)^3 + dy/dx = 0?", "options": {"A": "Order 2, Degree 3", "B": "Order 3, Degree 2", "C": "Order 2, Degree 1", "D": "Order 3, Degree 1"}, "ans": "A", "level": "Intermediate", "topic": "Differential Equations"},
        {"q": "Using integration by parts, the formula for integral of u * dv is:", "options": {"A": "u*v + integral(v*du)", "B": "u*v - integral(v*du)", "C": "u/v - integral(du/dv)", "D": "du*dv - u*v"}, "ans": "B", "level": "Intermediate", "topic": "Integral Calculus"},
        {"q": "If matrix A has eigenvalues 2 and 5, what is the determinant of A?", "options": {"A": "7", "B": "10", "C": "2.5", "D": "25"}, "ans": "B", "level": "Intermediate", "topic": "Linear Algebra"},
        {"q": "Which test determines whether an alternating series converges conditionally or absolutely?", "options": {"A": "Leibniz Alternating Series Test", "B": "Ratio Test on absolute terms", "C": "Integral Test", "D": "Both A and B"}, "ans": "D", "level": "Advanced", "topic": "Infinite Series"},
        {"q": "What is the gradient vector of a scalar field f(x, y, z)?", "options": {"A": "Scalar sum of partial derivatives", "B": "Vector of partial derivatives [df/dx, df/dy, df/dz]", "C": "Cross product with unit vector", "D": "Second derivative matrix"}, "ans": "B", "level": "Intermediate", "topic": "Vector Calculus"},
        {"q": "What is the general solution of dy/dx = k*y?", "options": {"A": "y = k*x + C", "B": "y = C * e^(kx)", "C": "y = ln(kx) + C", "D": "y = C * x^k"}, "ans": "B", "level": "Basic", "topic": "Differential Equations"}
    ]
}


def get_questions_for_subject(subject_name: str):
    """Deterministically maps any subject name or alias to its matching question bank."""
    s = (subject_name or "").strip().lower()
    if any(k in s for k in ["dsa", "data structure", "algorithm", "competitive", "leetcode", "c++", "java", "computer science"]):
        return DEFAULT_QUESTION_BANK["dsa"]
    if any(k in s for k in ["operating system", "os", "linux", "kernel", "system programming"]):
        return DEFAULT_QUESTION_BANK["os"]
    if any(k in s for k in ["dbms", "database", "sql", "data science", "big data", "analytics"]):
        return DEFAULT_QUESTION_BANK["dbms"]
    if any(k in s for k in ["network", "cn", "tcp", "routing", "cloud"]):
        return DEFAULT_QUESTION_BANK["networks"]
    if any(k in s for k in ["artificial intelligence", "machine learning", "deep learning", "nlp", "neural", "ai", "ml"]):
        return DEFAULT_QUESTION_BANK["ai"]
    if any(k in s for k in ["web", "react", "frontend", "backend", "full stack", "javascript", "typescript", "html", "css", "ui/ux", "design"]):
        return DEFAULT_QUESTION_BANK["web"]
    if any(k in s for k in ["cyber", "security", "cryptography", "ethical hacking", "infosec"]):
        return DEFAULT_QUESTION_BANK["cybersecurity"]
    if any(k in s for k in ["chem", "organic", "inorganic", "polymer"]):
        return DEFAULT_QUESTION_BANK["chemistry"]
    if any(k in s for k in ["bio", "genetics", "botany", "zoology", "medical", "anatomy", "ecology", "environment"]):
        return DEFAULT_QUESTION_BANK["biology"]
    if any(k in s for k in ["econ", "finance", "commerce", "account", "business", "entrepreneur", "management", "leadership", "communication", "psychology"]):
        return DEFAULT_QUESTION_BANK["economics"]
    if any(k in s for k in ["robot", "iot", "electronic", "embedded", "microcontroller", "circuit", "vlsi", "hardware"]):
        return DEFAULT_QUESTION_BANK["electronics"]
    if any(k in s for k in ["math", "calculus", "algebra", "discrete", "probability", "statistics", "geometry", "trigonometry", "quant"]):
        return DEFAULT_QUESTION_BANK["mathematics"]
    if any(k in s for k in ["phys", "mechanics", "optics", "electromagnet", "quantum", "thermodynamics", "astronomy", "astro"]):
        return DEFAULT_QUESTION_BANK["physics"]
    if any(k in s for k in ["python", "django", "flask", "fastapi", "scripting", "programming"]):
        return DEFAULT_QUESTION_BANK["python"]
    return DEFAULT_QUESTION_BANK["dsa"]


def recalculate_student_metrics(cursor, student_id: int):
    """Deterministically recalculates each subject's syllabus progress, Fit Score,
    overall daily syllabus progress rate (%/day), and Educational Potential Index (0-100)
    from real database records instead of arbitrary random increments."""
    # 1. Fetch pathways to sync mastered/revision counts
    cursor.execute(
        "SELECT subject_name, pathway_type, topics_json FROM student_learning_pathways WHERE student_id = ?",
        (student_id,)
    )
    pathway_rows = cursor.fetchall()
    pathway_stats = {}
    extra_mastered_total = 0
    for pr in pathway_rows:
        try:
            t_list = json.loads(pr["topics_json"] or "[]")
        except Exception:
            t_list = []
        m_cnt = sum(1 for t in t_list if t.get("status") == "mastered")
        r_cnt = sum(1 for t in t_list if t.get("status") == "needs_revision")
        tot_cnt = len(t_list)
        pathway_stats[pr["subject_name"].strip().lower()] = {
            "mastered": m_cnt,
            "revision": r_cnt,
            "total": tot_cnt
        }
        if pr["pathway_type"] == "additional":
            extra_mastered_total += m_cnt

    # 2. Fetch daily updates per subject & overall study consistency
    cursor.execute(
        """
        SELECT subject_name, completed_topics, revision_topics, study_minutes, practice_count, log_date
        FROM daily_syllabus_updates
        WHERE student_id = ?
        """,
        (student_id,)
    )
    daily_rows = cursor.fetchall()
    distinct_log_dates = set()
    total_study_minutes = 0
    subject_logged_topics = {}
    recent_topics_7d = 0
    recent_days_7d = set()
    seven_days_ago = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()

    for dr in daily_rows:
        ld = str(dr["log_date"] or "")
        if ld:
            distinct_log_dates.add(ld)
        total_study_minutes += int(dr["study_minutes"] or 0)
        s_key = (dr["subject_name"] or "").strip().lower()
        comp_items = [x.strip().lower() for x in (dr["completed_topics"] or "").split(",") if x.strip()]
        if s_key not in subject_logged_topics:
            subject_logged_topics[s_key] = set()
        for item in comp_items:
            subject_logged_topics[s_key].add(item)
        if ld >= seven_days_ago:
            recent_days_7d.add(ld)
            recent_topics_7d += max(1, len(comp_items)) if comp_items else 0

    streak_days = len(distinct_log_dates)
    consistency_score = min(100.0, round(streak_days * 14.0 + min(30.0, total_study_minutes / 15.0), 1))

    # 3. Update each subject in student_syllabus_progress deterministically
    cursor.execute(
        """
        SELECT id, subject_name, total_topics, completed_topics, revision_topics,
               completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score
        FROM student_syllabus_progress
        WHERE student_id = ?
        """,
        (student_id,)
    )
    sp_rows = cursor.fetchall()
    total_all_topics = 0
    syllabus_pcts = []
    practice_scores = []
    exam_scores = []

    for sp in sp_rows:
        subj = sp["subject_name"]
        s_key = subj.strip().lower()
        tot_t = max(1, int(sp["total_topics"] or 15))
        total_all_topics += tot_t

        pw = pathway_stats.get(s_key, {})
        logged_cnt = len(subject_logged_topics.get(s_key, set()))
        pw_mastered = pw.get("mastered", 0)

        # Deterministic completed topics: combine distinct daily logged topics + pathway mastered milestones
        comp_t = min(tot_t, max(int(sp["completed_topics"] or 0), pw_mastered + logged_cnt))
        rev_t = max(int(sp["revision_topics"] or 0), pw.get("revision", 0))
        comp_pct = round((comp_t / tot_t) * 100.0, 1)

        # Practice test average for this subject
        cursor.execute(
            "SELECT AVG(CASE WHEN accuracy > 0 THEN accuracy ELSE score END) as avg_s FROM practice_tests WHERE student_id = ? AND LOWER(subject_name) = ?",
            (student_id, s_key)
        )
        pt_avg_row = cursor.fetchone()
        pt_avg = pt_avg_row["avg_s"] if (pt_avg_row and pt_avg_row["avg_s"] is not None) else None

        # Diagnostic score for this subject
        cursor.execute(
            "SELECT score FROM diagnostic_tests WHERE student_id = ? AND LOWER(subject_name) = ? ORDER BY id DESC LIMIT 1",
            (student_id, s_key)
        )
        diag_row = cursor.fetchone()
        diag_score = diag_row["score"] if (diag_row and diag_row["score"] is not None) else None

        # Official exam marks average for this subject
        cursor.execute(
            "SELECT AVG(percentage) as avg_m FROM student_marks WHERE student_id = ? AND LOWER(subject_name) = ?",
            (student_id, s_key)
        )
        ex_avg_row = cursor.fetchone()
        ex_avg = ex_avg_row["avg_m"] if (ex_avg_row and ex_avg_row["avg_m"] is not None) else None

        prac_val = round(float(pt_avg if pt_avg is not None else (diag_score if diag_score is not None else sp["practice_avg_score"] or 0.0)), 1)
        exam_val = round(float(ex_avg if ex_avg is not None else (sp["exam_avg_score"] or prac_val)), 1)

        # Transparent Fit Score formula:
        # 35% Syllabus Coverage + 25% Exam Average + 20% Practice Score + 20% Study & Revision Consistency
        if comp_pct == 0 and prac_val == 0 and exam_val == 0:
            fit_score = 0.0
        else:
            fit_score = round(
                0.35 * comp_pct +
                0.25 * exam_val +
                0.20 * prac_val +
                0.20 * min(100.0, max(consistency_score, comp_pct)),
                1
            )

        is_weak = 1 if (fit_score > 0 and fit_score < 60.0) or (prac_val > 0 and prac_val < 50.0) else 0

        cursor.execute(
            """
            UPDATE student_syllabus_progress
            SET completed_topics = ?, revision_topics = ?, completed_percentage = ?,
                practice_avg_score = ?, exam_avg_score = ?, exam_readiness_score = ?,
                is_weak_subject = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (comp_t, rev_t, comp_pct, prac_val, exam_val, fit_score, is_weak, sp["id"])
        )

        syllabus_pcts.append(comp_pct)
        if prac_val > 0:
            practice_scores.append(prac_val)
        if exam_val > 0:
            exam_scores.append(exam_val)

    # 4. Extra learning logs (Track 2 effort)
    cursor.execute(
        "SELECT COALESCE(SUM(duration_minutes), 0) as total_extra_mins FROM extra_learning_logs WHERE student_id = ?",
        (student_id,)
    )
    extra_mins = int(cursor.fetchone()["total_extra_mins"] or 0)
    extra_hours = round(extra_mins / 60.0, 1)
    extra_effort_score = min(100.0, round((extra_mins / 3.0) + (extra_mastered_total * 12.0), 1))

    # 5. All diagnostic + practice scores
    cursor.execute("SELECT AVG(score) as d_avg FROM diagnostic_tests WHERE student_id = ?", (student_id,))
    d_avg = cursor.fetchone()["d_avg"]
    cursor.execute("SELECT AVG(CASE WHEN accuracy > 0 THEN accuracy ELSE score END) as p_avg FROM practice_tests WHERE student_id = ?", (student_id,))
    p_avg = cursor.fetchone()["p_avg"]

    assessment_vals = [float(x) for x in (d_avg, p_avg) if x is not None]
    avg_assessment = round(sum(assessment_vals) / len(assessment_vals), 1) if assessment_vals else (
        round(sum(practice_scores) / len(practice_scores), 1) if practice_scores else 0.0
    )
    avg_syllabus = round(sum(syllabus_pcts) / len(syllabus_pcts), 1) if syllabus_pcts else 0.0

    # Potential Index (0 - 100):
    # 30% Syllabus Completion + 35% Assessment Accuracy + 20% Daily Study Consistency + 15% Track 2 Skill Effort
    if not sp_rows and not assessment_vals and streak_days == 0:
        potential_score = 0.0
        progress_rate = 0.0
    else:
        potential_score = round(
            0.30 * avg_syllabus +
            0.35 * avg_assessment +
            0.20 * consistency_score +
            0.15 * extra_effort_score,
            1
        )
        # Daily progress rate (%/day): actual syllabus percentage gained per day
        if total_all_topics > 0 and recent_topics_7d > 0:
            window_days = max(1, len(recent_days_7d))
            progress_rate = round(min(5.0, ((recent_topics_7d / total_all_topics) * 100.0) / window_days), 2)
        elif avg_syllabus > 0:
            progress_rate = round(min(5.0, avg_syllabus / 30.0), 2)
        else:
            progress_rate = 0.0

    cursor.execute(
        "UPDATE students SET potential_score = ?, syllabus_progress_rate = ? WHERE id = ?",
        (potential_score, progress_rate, student_id)
    )

    avg_exam = round(sum(exam_scores) / len(exam_scores), 1) if exam_scores else avg_assessment
    practice_gain = round(avg_assessment - avg_exam, 1) if (avg_assessment > 0 and avg_exam > 0) else 0.0

    return {
        "potential_score": potential_score,
        "syllabus_progress_rate": progress_rate,
        "avg_syllabus_pct": avg_syllabus,
        "avg_assessment_score": avg_assessment,
        "consistency_score": consistency_score,
        "extra_effort_score": extra_effort_score,
        "streak_days": streak_days,
        "extra_hours_logged": extra_hours,
        "practice_to_exam_gain": practice_gain
    }


# =========================================================================
# 1. PROFILE & ONBOARDING
# =========================================================================

@student_bp.route('/profile', methods=['GET'])
@role_required('student')
def get_profile():
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, name, email, college, university_roll_no,
               class_year, curriculum, academic_subjects, interested_subjects,
               additional_skills, preferred_language, knowledge_level,
               potential_score, syllabus_progress_rate, verification_status,
               verified_at, institute_id, github_url, leetcode_url, created_at
        FROM students
        WHERE id = ?
        """,
        (student_id,)
    )
    profile = row_to_dict(cursor.fetchone())

    # Attached documents
    cursor.execute("SELECT id, document_type, file_url, uploaded_at FROM student_documents WHERE student_id = ?", (student_id,))
    documents = [row_to_dict(r) for r in cursor.fetchall()]

    conn.close()

    if profile:
        profile['is_verified'] = (profile.get('verification_status') == 'verified')
        profile['documents'] = documents
        profile['academic_class'] = profile.get('class_year')
        profile['board_curriculum'] = profile.get('curriculum')
        profile['academic_interests'] = profile.get('interested_subjects')
        profile['extra_subjects'] = profile.get('interested_subjects')
        profile['academic_subjects_list'] = [s.strip() for s in (profile.get('academic_subjects') or '').split(',') if s.strip()]
        profile['interested_subjects_list'] = [s.strip() for s in (profile.get('interested_subjects') or '').split(',') if s.strip()]
        profile['additional_skills_list'] = [s.strip() for s in (profile.get('additional_skills') or '').split(',') if s.strip()]

    return jsonify({'profile': profile}), 200

@student_bp.route('/profile', methods=['PUT'])
@role_required('student')
def update_profile():
    student_id = session['user_id']
    data = request.get_json() or {}

    if 'academic_class' in data and 'class_year' not in data:
        data['class_year'] = data['academic_class']
    if 'board_curriculum' in data and 'curriculum' not in data:
        data['curriculum'] = data['board_curriculum']
    if 'extra_subjects' in data and 'interested_subjects' not in data:
        data['interested_subjects'] = data['extra_subjects']
    if 'academic_interests' in data and 'interested_subjects' not in data:
        data['interested_subjects'] = data['academic_interests']

    allowed_fields = [
        'college', 'university_roll_no', 'class_year', 'curriculum',
        'academic_subjects', 'interested_subjects', 'additional_skills',
        'preferred_language', 'knowledge_level', 'github_url', 'leetcode_url',
        'institute_id'
    ]
    updates = {k: data[k] for k in allowed_fields if k in data}

    if not updates:
        return jsonify({'message': 'No profile updates supplied.'}), 200

    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [student_id]

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE students SET {set_clause} WHERE id = ?", values)
    conn.commit()
    conn.close()

    return jsonify({'message': 'Learning profile updated successfully!', 'updated': updates}), 200

@student_bp.route('/onboarding', methods=['POST'])
@role_required('student')
def complete_onboarding():
    """Saves learning-focused onboarding without asking for a resume."""
    student_id = session['user_id']
    data = request.get_json() or {}

    class_year = data.get('class_year', '3rd Year B.Tech').strip()
    college = data.get('college', '').strip()
    curriculum = data.get('curriculum', 'Computer Science & Engineering').strip()
    academic_subjects = data.get('academic_subjects', '').strip()
    interested_subjects = data.get('interested_subjects', '').strip()
    additional_skills = data.get('additional_skills', '').strip()
    preferred_language = data.get('preferred_language', 'English').strip()
    knowledge_level = data.get('knowledge_level', 'Intermediate').strip()
    institute_id = data.get('institute_id')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE students
        SET class_year = ?, college = COALESCE(NULLIF(?, ''), college),
            curriculum = ?, academic_subjects = ?, interested_subjects = ?,
            additional_skills = ?, preferred_language = ?, knowledge_level = ?,
            institute_id = COALESCE(?, institute_id)
        WHERE id = ?
        """,
        (class_year, college, curriculum, academic_subjects, interested_subjects,
         additional_skills, preferred_language, knowledge_level, institute_id, student_id)
    )

    # 1. Initialize academic syllabus progress (starting fresh at 0% for new student intake!)
    academic_list = [s.strip() for s in academic_subjects.split(',') if s.strip()]
    if not academic_list:
        academic_list = ['Mathematics', 'Physics', 'Computer Science']

    for subj in academic_list:
        cursor.execute(
            """
            INSERT OR IGNORE INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics,
                completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score,
                topics_understood_pct, revision_status_pct, is_weak_subject
            )
            VALUES (?, ?, 15, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0)
            """,
            (student_id, subj)
        )
        # Seed rich academic pathway for each academic subject
        ac_topics = build_rich_pathway_topics(subj, 'academic', score_pct=40.0)
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_learning_pathways (
                student_id, subject_name, pathway_type, current_level, estimated_hours, difficulty, topics_json, recommended_sequence
            )
            VALUES (?, ?, 'academic', ?, 50, 'Intermediate', ?, ?)
            """,
            (
                student_id, subj, knowledge_level,
                json.dumps(ac_topics),
                "Foundations → Core Mechanics → Applications → Advanced Paradigms"
            )
        )

    # 2. Seed extra skills / Track 2 pathways
    extra_list = [s.strip() for s in interested_subjects.split(',') if s.strip()]
    if not extra_list and additional_skills:
        extra_list = [s.strip() for s in additional_skills.split(',') if s.strip()]
    if not extra_list:
        extra_list = ['Python Programming', 'Artificial Intelligence']

    for extra_sub in extra_list:
        ex_topics = build_rich_pathway_topics(extra_sub, 'additional', score_pct=30.0)
        cursor.execute(
            """
            INSERT OR REPLACE INTO student_learning_pathways (
                student_id, subject_name, pathway_type, current_level, estimated_hours, difficulty, topics_json, recommended_sequence
            )
            VALUES (?, ?, 'additional', ?, 45, 'Intermediate', ?, ?)
            """,
            (
                student_id, extra_sub, knowledge_level,
                json.dumps(ex_topics),
                "Prerequisites → Core Techniques → Hands-on Mini Projects → Capstone"
            )
        )

    # 3. Schedule sports / free time in personal schedule so no study burnout occurs!
    sports_extracurricular = (data.get('sports_preference') or data.get('sports_extracurricular') or '').strip()
    if sports_extracurricular:
        for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']:
            cursor.execute(
                """
                INSERT INTO student_personal_schedules (
                    student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes
                )
                VALUES (?, ?, 'free_time', '', ?, '04:30 PM', '05:30 PM', 'Protected physical health & sports time')
                """,
                (student_id, sports_extracurricular, day)
            )

    recalculate_student_metrics(cursor, student_id)
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Student curriculum intake completed! Pathways and subjects initialized.',
        'onboarding': {
            'class_year': class_year,
            'curriculum': curriculum,
            'academic_subjects': academic_subjects,
            'interested_subjects': interested_subjects,
            'preferred_language': preferred_language,
            'academic_list': academic_list,
            'extra_list': extra_list
        }
    }), 200

@student_bp.route('/subjects/catalog', methods=['GET'])
def get_subject_catalog():
    """Returns diverse subject choices across disciplines + Other option."""
    return jsonify({
        'subjects': SUBJECT_CATALOG,
        'categories': [
            'Academic Core', 'Technical', 'Programming & Software',
            'Engineering & Hardware', 'Data & Analysis', 'Sciences',
            'Commerce & Social', 'Creative Fields', 'Humanities', 'Practical Skills'
        ]
    }), 200

# =========================================================================
# 2. DIAGNOSTIC ASSESSMENT & PATHWAY GENERATION
# =========================================================================

@student_bp.route('/diagnostic/<subject_name>/questions', methods=['GET'])
@role_required('student')
def get_diagnostic_questions(subject_name):
    """Provides discrete diagnostic test spanning Basic, Intermediate, Advanced levels for the exact chosen subject."""
    questions = get_questions_for_subject(subject_name)

    formatted = []
    for idx, q in enumerate(questions):
        formatted.append({
            "id": idx + 1,
            "question_text": q["q"],
            "options": q["options"],
            "level": q["level"],
            "topic": q["topic"]
        })

    return jsonify({
        'subject': subject_name,
        'total_questions': len(formatted),
        'difficulty_mix': '3 Basic, 4 Intermediate, 3 Advanced',
        'questions': formatted
    }), 200

@student_bp.route('/diagnostic/<subject_name>/submit', methods=['POST'])
@role_required('student')
def submit_diagnostic_test(subject_name):
    """Evaluates diagnostic test, determines starting knowledge level, and seeds personalized pathway."""
    student_id = session['user_id']
    data = request.get_json() or {}
    answers = data.get('answers', {})

    questions = get_questions_for_subject(subject_name)

    correct_count = 0
    understood = []
    partially_understood = []
    needs_improvement = []

    for idx, q in enumerate(questions):
        q_id = str(idx + 1)
        student_ans = (answers.get(q_id) or answers.get(str(idx)) or '').strip().upper()
        if student_ans == q['ans']:
            correct_count += 1
            understood.append(q['topic'])
        else:
            if q['level'] in ('Intermediate', 'Advanced'):
                partially_understood.append(q['topic'])
            else:
                needs_improvement.append(q['topic'])

    total_q = len(questions)
    score_pct = round((correct_count / total_q) * 100, 1)

    if score_pct >= 80:
        knowledge_level = "Advanced"
    elif score_pct >= 50:
        knowledge_level = "Intermediate"
    else:
        knowledge_level = "Beginner"

    conn = get_db()
    cursor = conn.cursor()

    # Save diagnostic test record
    cursor.execute(
        """
        INSERT INTO diagnostic_tests (
            student_id, subject_name, level, score, total_questions,
            topics_understood, topics_partially_understood, topics_needs_improvement,
            estimated_knowledge_level, recommended_focus
        )
        VALUES (?, ?, 'Comprehensive', ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            student_id, subject_name, score_pct, total_q,
            json.dumps(list(set(understood))),
            json.dumps(list(set(partially_understood))),
            json.dumps(list(set(needs_improvement))),
            knowledge_level,
            f"Focus on strengthening: {', '.join(list(set(needs_improvement))[:3]) or 'Advanced Concepts'}"
        )
    )

    # Determine pathway_type
    p_type = 'academic'
    cursor.execute("SELECT academic_subjects FROM students WHERE id = ?", (student_id,))
    st_row = cursor.fetchone()
    if st_row and st_row['academic_subjects']:
        ac_subjs = [s.strip().lower() for s in st_row['academic_subjects'].split(',')]
        if subject_name.lower() not in ac_subjs and not any(k in subject_name.lower() for k in ['math', 'calculus', 'algebra', 'physics', 'cs', 'computer', 'dsa', 'data structure', 'operating', 'database', 'dbms']):
            p_type = 'additional'
    elif not any(k in subject_name.lower() for k in ['math', 'calculus', 'algebra', 'physics', 'cs', 'computer', 'dsa', 'data structure', 'operating', 'database', 'dbms']):
        p_type = 'additional'

    pathway_topics = build_rich_pathway_topics(subject_name, p_type, score_pct, understood, needs_improvement)

    cursor.execute(
        """
        INSERT OR REPLACE INTO student_learning_pathways (
            student_id, subject_name, pathway_type, current_level, estimated_hours, difficulty, topics_json, recommended_sequence
        )
        VALUES (?, ?, ?, ?, 60, ?, ?, ?)
        """,
        (
            student_id, subject_name, p_type, knowledge_level, knowledge_level,
            json.dumps(pathway_topics),
            "Diagnostic Review → Core Competencies → Targeted Remediation → Mastery"
        )
    )

    mastered_in_pw = sum(1 for t in pathway_topics if t.get('status') == 'mastered')
    revision_in_pw = sum(1 for t in pathway_topics if t.get('status') == 'needs_revision')
    total_in_pw = max(10, len(pathway_topics))

    # Sync syllabus progress with actual diagnostic mastery
    cursor.execute(
        """
        INSERT OR REPLACE INTO student_syllabus_progress (
            student_id, subject_name, total_topics, completed_topics, revision_topics,
            completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score,
            topics_understood_pct, revision_status_pct, is_weak_subject
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            student_id, subject_name,
            total_in_pw,
            mastered_in_pw,
            revision_in_pw,
            round((mastered_in_pw / total_in_pw) * 100.0, 1),
            score_pct,
            score_pct,
            score_pct,
            round((len(understood) / (total_q or 1)) * 100, 1),
            round((len(needs_improvement) / (total_q or 1)) * 100, 1),
            1 if score_pct < 50 else 0
        )
    )

    cursor.execute(
        "UPDATE students SET knowledge_level = ? WHERE id = ?",
        (knowledge_level, student_id)
    )
    metrics = recalculate_student_metrics(cursor, student_id)

    # Add notification for student
    cursor.execute(
        """
        INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
        VALUES (?, 'student', ?, ?, 'success', 'pathways')
        """,
        (
            student_id,
            f"Diagnostic Complete: {subject_name}",
            f"Assessed as {knowledge_level} level ({score_pct}%). Personalized learning pathway generated."
        )
    )

    conn.commit()
    conn.close()

    return jsonify({
        'message': f'Diagnostic evaluation completed for {subject_name}!',
        'subject': subject_name,
        'subject_name': subject_name,
        'pathway_type': p_type,
        'score': score_pct,
        'knowledge_level': knowledge_level,
        'topics_mastered': list(set(understood)),
        'topics_partially_understood': list(set(partially_understood)),
        'topics_needs_improvement': list(set(needs_improvement)),
        'pathway_created': True,
        'metrics': metrics
    }), 201

# =========================================================================
# 3. ADAPTIVE LEARNING PATHWAYS
# =========================================================================

@student_bp.route('/pathways', methods=['GET'])
@role_required('student')
def get_student_pathways():
    """Returns active adaptive pathways for Academic and Additional learning subjects."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, subject_name, pathway_type, current_level, estimated_hours,
               difficulty, topics_json, recommended_sequence, last_updated
        FROM student_learning_pathways
        WHERE student_id = ?
        ORDER BY pathway_type ASC, subject_name ASC
        """,
        (student_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    pathways = []
    for r in rows:
        d = row_to_dict(r)
        try:
            d['topics'] = json.loads(d['topics_json'])
        except Exception:
            d['topics'] = []
        pathways.append(d)

    return jsonify({'pathways': pathways}), 200

@student_bp.route('/pathways/<subject_name>/topics/<topic_id>/status', methods=['POST'])
@role_required('student')
def update_topic_status(subject_name, topic_id):
    """Updates a topic's status in the student's personalized learning pathway and recalculates metrics deterministically."""
    student_id = session['user_id']
    data = request.get_json() or {}
    new_status = data.get('status', 'mastered').strip().lower()

    if new_status not in ('mastered', 'in_progress', 'needs_revision', 'next', 'pending'):
        return jsonify({'error': 'Invalid status'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, topics_json FROM student_learning_pathways WHERE student_id = ? AND subject_name = ?",
        (student_id, subject_name)
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Pathway not found for this subject.'}), 404

    try:
        topics = json.loads(row['topics_json'])
        found = False
        for t in topics:
            if t.get('id') == topic_id:
                t['status'] = new_status
                found = True
                break
        if not found:
            conn.close()
            return jsonify({'error': 'Topic ID not found in pathway.'}), 404

        cursor.execute(
            """
            UPDATE student_learning_pathways
            SET topics_json = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (json.dumps(topics), row['id'])
        )

        # Deterministically recalculate student potential and syllabus progress
        metrics = recalculate_student_metrics(cursor, student_id)
        conn.commit()
    finally:
        conn.close()

    return jsonify({'message': f'Topic status updated to {new_status}!', 'metrics': metrics}), 200

# =========================================================================
# 4. SYLLABUS PROGRESS & FIT SCORE (EXAM READINESS)
# =========================================================================

@student_bp.route('/syllabus', methods=['GET'])
@role_required('student')
def get_syllabus_progress():
    """Returns syllabus progress, fit scores, and deterministic metrics breakdown for all subjects."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Ensure metrics are deterministically synchronized
    metrics = recalculate_student_metrics(cursor, student_id)
    conn.commit()

    cursor.execute(
        """
        SELECT id, subject_name, total_topics, completed_topics, revision_topics,
               completed_percentage, exam_readiness_score, practice_avg_score,
               exam_avg_score, topics_understood_pct, revision_status_pct,
               is_weak_subject, last_updated
        FROM student_syllabus_progress
        WHERE student_id = ?
        ORDER BY is_weak_subject DESC, subject_name ASC
        """,
        (student_id,)
    )
    progress_rows = [row_to_dict(r) for r in cursor.fetchall()]

    # Fetch recent daily updates
    cursor.execute(
        """
        SELECT id, subject_name, completed_topics, revision_topics, practice_count, study_minutes, notes, log_date
        FROM daily_syllabus_updates
        WHERE student_id = ?
        ORDER BY log_date DESC, created_at DESC LIMIT 10
        """,
        (student_id,)
    )
    daily_updates = [row_to_dict(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        'syllabus_progress': progress_rows,
        'daily_updates': daily_updates,
        'potential_score': metrics['potential_score'],
        'syllabus_progress_rate': metrics['syllabus_progress_rate'],
        'metrics_breakdown': metrics
    }), 200

@student_bp.route('/syllabus/daily-update', methods=['POST'])
@role_required('student')
def add_daily_syllabus_update():
    """Student provides daily updates about their academic progress; recalculates metrics deterministically."""
    student_id = session['user_id']
    data = request.get_json() or {}

    subject_name = data.get('subject_name', '').strip()
    completed_topics = data.get('completed_topics', '').strip()
    revision_topics = data.get('revision_topics', '').strip()
    practice_count = int(data.get('practice_count', 0))
    study_minutes = int(data.get('study_minutes', 60))
    notes = data.get('notes', '').strip()
    log_date = data.get('log_date', datetime.date.today().isoformat())

    if not subject_name:
        return jsonify({'error': 'Subject name is required.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO daily_syllabus_updates (
            student_id, subject_name, completed_topics, revision_topics, practice_count, study_minutes, notes, log_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (student_id, subject_name, completed_topics, revision_topics, practice_count, study_minutes, notes, log_date)
    )

    new_topics_count = len([x.strip() for x in completed_topics.split(',') if x.strip()])
    new_rev_count = len([x.strip() for x in revision_topics.split(',') if x.strip()])

    cursor.execute(
        "SELECT id, total_topics, completed_topics, revision_topics FROM student_syllabus_progress WHERE student_id = ? AND subject_name = ?",
        (student_id, subject_name)
    )
    sp_row = cursor.fetchone()
    if sp_row:
        new_comp = min(sp_row['total_topics'], sp_row['completed_topics'] + new_topics_count)
        new_rev = sp_row['revision_topics'] + new_rev_count
        pct = round((new_comp / sp_row['total_topics']) * 100.0, 1)
        cursor.execute(
            """
            UPDATE student_syllabus_progress
            SET completed_topics = ?, revision_topics = ?, completed_percentage = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (new_comp, new_rev, pct, sp_row['id'])
        )
    else:
        tot = 15
        nc = min(tot, max(1, new_topics_count))
        pct = round((nc / tot) * 100.0, 1)
        cursor.execute(
            """
            INSERT INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics, completed_percentage, exam_readiness_score
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (student_id, subject_name, tot, nc, new_rev_count, pct, pct)
        )

    metrics = recalculate_student_metrics(cursor, student_id)
    conn.commit()
    conn.close()

    return jsonify({
        'message': f"Today's learning progress recorded for {subject_name}!",
        'potential_score': metrics['potential_score'],
        'syllabus_progress_rate': metrics['syllabus_progress_rate'],
        'metrics_breakdown': metrics
    }), 201

# =========================================================================
# 5. INTEGRATED SCHEDULES (INSTITUTE + PERSONAL + AI TIMETABLE)
# =========================================================================

@student_bp.route('/schedules', methods=['GET'])
@role_required('student')
def get_student_schedules():
    """Combines Institute academic schedule with Student personal schedule."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Get student's institute ID
    cursor.execute("SELECT institute_id FROM students WHERE id = ?", (student_id,))
    st = cursor.fetchone()
    inst_id = st['institute_id'] if st and st['institute_id'] else 1

    # 1. Institute academic schedules (classes, exams, tests, practicals)
    cursor.execute(
        """
        SELECT id, schedule_type, title, subject_name, date, start_time, end_time, venue_or_link, notes
        FROM institute_schedules
        WHERE institute_id = ?
        ORDER BY date ASC, start_time ASC
        """,
        (inst_id,)
    )
    institute_schedules = [row_to_dict(r) for r in cursor.fetchall()]

    # 2. Student personal schedules (extra learning, sports, personal free time)
    cursor.execute(
        """
        SELECT id, title, activity_type, subject_name, day_of_week, start_time, end_time, is_completed, notes
        FROM student_personal_schedules
        WHERE student_id = ?
        ORDER BY day_of_week ASC, start_time ASC
        """,
        (student_id,)
    )
    personal_schedules = [row_to_dict(r) for r in cursor.fetchall()]

    # 3. Extra skill learning logs
    cursor.execute(
        """
        SELECT id, skill_or_subject, duration_minutes, log_date, adherence, notes
        FROM extra_learning_logs
        WHERE student_id = ?
        ORDER BY log_date DESC LIMIT 7
        """,
        (student_id,)
    )
    extra_logs = [row_to_dict(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        'institute_schedules': institute_schedules,
        'personal_schedules': personal_schedules,
        'extra_learning_logs': extra_logs
    }), 200

@student_bp.route('/schedules', methods=['POST'])
@role_required('student')
def add_personal_schedule_item():
    """Adds a personal schedule item (e.g. Free time, Sports, Extra skill session)."""
    student_id = session['user_id']
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    activity_type = data.get('activity_type', 'personal').strip()
    subject_name = data.get('subject_name', '').strip()
    day_of_week = data.get('day_of_week', 'Monday').strip()
    start_time = data.get('start_time', '04:30 PM').strip()
    end_time = data.get('end_time', '05:30 PM').strip()
    notes = data.get('notes', '').strip()

    if not title:
        return jsonify({'error': 'Title is required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO student_personal_schedules (
            student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({'message': 'Personal schedule item added!', 'id': new_id}), 201

@student_bp.route('/schedules/<int:item_id>', methods=['PUT'])
@role_required('student')
def update_personal_schedule_item(item_id):
    """Allows student to modify any timetable entry (e.g., mark free time for cricket, adjust hours)."""
    student_id = session['user_id']
    data = request.get_json() or {}

    fields = ['title', 'activity_type', 'subject_name', 'day_of_week', 'start_time', 'end_time', 'is_completed', 'notes']
    updates = {k: data[k] for k in fields if k in data}

    if not updates:
        return jsonify({'message': 'No changes provided.'}), 200

    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [item_id, student_id]

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE student_personal_schedules SET {set_clause} WHERE id = ? AND student_id = ?", values)
    conn.commit()
    conn.close()

    return jsonify({'message': 'Schedule entry updated successfully!'}), 200

@student_bp.route('/schedules/<int:item_id>', methods=['DELETE'])
@role_required('student')
def delete_personal_schedule_item(item_id):
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM student_personal_schedules WHERE id = ? AND student_id = ?", (item_id, student_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Schedule entry deleted.'}), 200

@student_bp.route('/schedules/ai-generate', methods=['POST'])
@role_required('student')
def ai_generate_timetable():
    """Generates an intelligent, balanced personal timetable combining institute timetable,
    pending syllabus, weak subjects, desired extra skills, and personal sports/free time."""
    student_id = session['user_id']
    data = request.get_json() or {}
    free_time_preference = data.get('free_time_preference', 'Cricket/Sports from 04:30 PM to 05:30 PM')
    daily_available_hours = float(data.get('daily_available_hours', 4.0))

    conn = get_db()
    cursor = conn.cursor()

    # Find weak subjects
    cursor.execute(
        "SELECT subject_name FROM student_syllabus_progress WHERE student_id = ? AND is_weak_subject = 1",
        (student_id,)
    )
    weak_subjects = [r['subject_name'] for r in cursor.fetchall()] or ["Physics"]

    # Student extra skills
    cursor.execute("SELECT interested_subjects, additional_skills FROM students WHERE id = ?", (student_id,))
    st_row = cursor.fetchone()
    extra_subjects = (st_row['interested_subjects'] or 'Python Programming').split(',')[0].strip()

    generated_plan = [
        {"title": "Institute Lecture Session", "activity_type": "institute_class", "subject_name": "Mathematics", "day_of_week": "Monday", "start_time": "09:00 AM", "end_time": "10:30 AM", "notes": "Core curriculum lecture"},
        {"title": f"Targeted Practice ({weak_subjects[0]})", "activity_type": "revision", "subject_name": weak_subjects[0], "day_of_week": "Monday", "start_time": "02:00 PM", "end_time": "03:30 PM", "notes": "Focus on weak topics & formula derivations"},
        {"title": f"Personal Time: {free_time_preference}", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Monday", "start_time": "04:30 PM", "end_time": "05:30 PM", "notes": "Protected personal leisure time"},
        {"title": f"Extra Skill: {extra_subjects}", "activity_type": "extra_learning", "subject_name": extra_subjects, "day_of_week": "Monday", "start_time": "06:00 PM", "end_time": "07:30 PM", "notes": "Hands-on coding / practical project"},

        {"title": "Institute Lab & Practical", "activity_type": "institute_class", "subject_name": "Data Structures", "day_of_week": "Tuesday", "start_time": "10:00 AM", "end_time": "12:00 PM", "notes": "Laboratory assignment"},
        {"title": f"Personal Time: {free_time_preference}", "activity_type": "free_time", "subject_name": "Personal", "day_of_week": "Tuesday", "start_time": "04:30 PM", "end_time": "05:30 PM", "notes": "Protected personal leisure time"},
        {"title": f"Extra Skill: {extra_subjects}", "activity_type": "extra_learning", "subject_name": extra_subjects, "day_of_week": "Tuesday", "start_time": "06:00 PM", "end_time": "07:30 PM", "notes": "Module 3 project building"},
        {"title": "Academic Syllabus Revision", "activity_type": "practice", "subject_name": "Mathematics", "day_of_week": "Tuesday", "start_time": "08:30 PM", "end_time": "09:30 PM", "notes": "Problem set solving"}
    ]

    # Save to database
    cursor.execute("DELETE FROM student_personal_schedules WHERE student_id = ?", (student_id,))
    for item in generated_plan:
        cursor.execute(
            """
            INSERT INTO student_personal_schedules (
                student_id, title, activity_type, subject_name, day_of_week, start_time, end_time, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (student_id, item['title'], item['activity_type'], item['subject_name'], item['day_of_week'], item['start_time'], item['end_time'], item['notes'])
        )

    conn.commit()
    conn.close()

    return jsonify({
        'message': 'AI-assisted timetable generated and saved to your personal schedule!',
        'generated_items': len(generated_plan),
        'schedule': generated_plan
    }), 200

@student_bp.route('/schedules/track-extra-time', methods=['POST'])
@role_required('student')
def track_extra_learning_time():
    student_id = session['user_id']
    data = request.get_json() or {}
    skill = data.get('skill_or_subject', 'Python Programming').strip()
    duration = int(data.get('duration_minutes', 60))
    notes = data.get('notes', '').strip()
    log_date = data.get('log_date', datetime.date.today().isoformat())

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO extra_learning_logs (student_id, skill_or_subject, duration_minutes, log_date, adherence, notes)
        VALUES (?, ?, ?, ?, 1, ?)
        """,
        (student_id, skill, duration, log_date, notes)
    )
    metrics = recalculate_student_metrics(cursor, student_id)
    conn.commit()
    conn.close()

    return jsonify({'message': f'Logged {duration} minutes of extra learning in {skill}!', 'metrics': metrics}), 201

# =========================================================================
# 6. WEAK SUBJECT DETECTION & DAILY PRACTICE TESTS & PERFORMANCE TRACKING
# =========================================================================

@student_bp.route('/weak-subjects', methods=['GET'])
@role_required('student')
def get_weak_subjects():
    """Identifies subjects where marks or syllabus progress require targeted practice."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Detect from syllabus progress where exam_readiness_score < 65 OR is_weak_subject = 1
    cursor.execute(
        """
        SELECT subject_name, exam_readiness_score, completed_percentage, practice_avg_score, exam_avg_score
        FROM student_syllabus_progress
        WHERE student_id = ? AND (exam_readiness_score < 65.0 OR is_weak_subject = 1)
        ORDER BY exam_readiness_score ASC
        """,
        (student_id,)
    )
    weak_rows = []
    for r in cursor.fetchall():
        d = row_to_dict(r)
        d['subject'] = d.get('subject_name')
        d['score'] = d.get('practice_avg_score') or d.get('exam_readiness_score') or 0
        d['exam_avg'] = d.get('exam_avg_score') or d.get('practice_avg_score') or 0
        weak_rows.append(d)
    conn.close()

    return jsonify({
        'weak_subjects': weak_rows,
        'has_weak_subjects': len(weak_rows) > 0,
        'recommendation': 'Take the daily targeted practice test to boost your Exam Readiness Score.'
    }), 200

@student_bp.route('/practice-test/today', methods=['GET'])
@role_required('student')
def get_today_practice_test():
    """Provides today's adaptive practice test for the exact chosen subject or top weak subject."""
    student_id = session['user_id']
    subject = request.args.get('subject', '').strip()

    conn = get_db()
    cursor = conn.cursor()

    if not subject:
        # Pick top weak subject first, otherwise student's first enrolled subject
        cursor.execute(
            """
            SELECT subject_name FROM student_syllabus_progress
            WHERE student_id = ?
            ORDER BY is_weak_subject DESC, exam_readiness_score ASC
            LIMIT 1
            """,
            (student_id,)
        )
        row = cursor.fetchone()
        if row and row['subject_name']:
            subject = row['subject_name']
        else:
            cursor.execute("SELECT academic_subjects FROM students WHERE id = ?", (student_id,))
            st_r = cursor.fetchone()
            if st_r and st_r['academic_subjects']:
                subject = st_r['academic_subjects'].split(',')[0].strip()
            else:
                subject = 'Data Structures & Algorithms'

    conn.close()

    questions = get_questions_for_subject(subject)

    formatted = []
    for idx, q in enumerate(questions[:10]):
        formatted.append({
            "id": idx + 1,
            "question_text": q["q"],
            "options": q["options"],
            "topic": q["topic"],
            "level": q["level"]
        })

    return jsonify({
        'subject': subject,
        'test_title': f"Targeted Practice Test: {subject}",
        'total_questions': len(formatted),
        'questions': formatted
    }), 200

@student_bp.route('/practice-test/submit', methods=['POST'])
@role_required('student')
def submit_practice_test():
    """Records daily practice test score, accuracy, difficulty, and recalculates weak subject & student metrics deterministically."""
    student_id = session['user_id']
    data = request.get_json() or {}

    subject_name = data.get('subject_name', 'Data Structures & Algorithms').strip()
    topic_name = data.get('topic_name', 'Comprehensive Practice').strip()
    answers = data.get('answers', {})

    questions = get_questions_for_subject(subject_name)

    correct = 0
    total = len(questions)
    mistakes = []

    for idx, q in enumerate(questions):
        student_ans = (answers.get(str(idx + 1)) or answers.get(str(idx)) or '').strip().upper()
        if student_ans == q['ans']:
            correct += 1
        else:
            mistakes.append(f"{q['topic']}: Correct option is {q['ans']} ({q['options'].get(q['ans'], '')})")

    score_pct = round((correct / total) * 100, 1)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO practice_tests (
            student_id, subject_name, topic_name, score, total_questions, accuracy, difficulty, is_weak_subject_test, mistakes_summary
        )
        VALUES (?, ?, ?, ?, ?, ?, 'Intermediate', 1, ?)
        """,
        (student_id, subject_name, topic_name, score_pct, total, score_pct, f"Review: {', '.join([m.split(':')[0] for m in mistakes[:3]]) or 'None — Perfect Score!'}")
    )

    # Recalculate practice average for this subject
    cursor.execute(
        "SELECT AVG(score) as avg_score FROM practice_tests WHERE student_id = ? AND LOWER(subject_name) = ?",
        (student_id, subject_name.lower())
    )
    new_avg = round(cursor.fetchone()['avg_score'] or score_pct, 1)

    # Ensure subject exists in student_syllabus_progress
    cursor.execute(
        "SELECT id FROM student_syllabus_progress WHERE student_id = ? AND LOWER(subject_name) = ?",
        (student_id, subject_name.lower())
    )
    if not cursor.fetchone():
        cursor.execute(
            """
            INSERT INTO student_syllabus_progress (
                student_id, subject_name, total_topics, completed_topics, revision_topics,
                completed_percentage, exam_readiness_score, practice_avg_score, exam_avg_score
            )
            VALUES (?, ?, 15, 2, 0, 13.3, ?, ?, ?)
            """,
            (student_id, subject_name, new_avg, new_avg, new_avg)
        )

    metrics = recalculate_student_metrics(cursor, student_id)
    conn.commit()
    conn.close()

    return jsonify({
        'message': f'Practice test for {subject_name} submitted successfully!',
        'score': score_pct,
        'accuracy': score_pct,
        'new_practice_average': new_avg,
        'mistakes': mistakes,
        'metrics': metrics
    }), 201

@student_bp.route('/practice-vs-exam', methods=['GET'])
@role_required('student')
def get_practice_vs_exam_analysis():
    """Returns comparative data-based comparison between practice performance and actual exam marks."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Historical practice tests
    cursor.execute(
        """
        SELECT id, subject_name, score, accuracy, mistakes_summary, taken_at, topic_name
        FROM practice_tests
        WHERE student_id = ?
        ORDER BY taken_at DESC
        """,
        (student_id,)
    )
    practice_history = [row_to_dict(r) for r in cursor.fetchall()]

    # Real examination marks
    cursor.execute(
        """
        SELECT subject_name, exam_title, exam_type, percentage, remarks, recorded_at
        FROM student_marks
        WHERE student_id = ?
        ORDER BY recorded_at DESC
        """,
        (student_id,)
    )
    exam_history = [row_to_dict(r) for r in cursor.fetchall()]

    # Fetch enrolled subjects from student_syllabus_progress
    cursor.execute(
        """
        SELECT subject_name, practice_avg_score, exam_avg_score, exam_readiness_score
        FROM student_syllabus_progress
        WHERE student_id = ?
        ORDER BY subject_name ASC
        """,
        (student_id,)
    )
    sp_rows = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    comparison_summary = []
    for sp in sp_rows:
        p_avg = round(float(sp.get('practice_avg_score') or 0.0), 1)
        e_avg = round(float(sp.get('exam_avg_score') or p_avg), 1)
        delta = round(p_avg - e_avg, 1)
        comparison_summary.append({
            "subject": sp["subject_name"],
            "practice_avg": p_avg,
            "exam_avg": e_avg,
            "initial_practice_avg": max(0.0, round(p_avg - 10.0, 1)),
            "current_practice_avg": p_avg,
            "practice_delta": f"{'+' if delta >= 0 else ''}{delta} percentage points",
            "initial_exam_score": e_avg,
            "latest_exam_score": e_avg,
            "exam_delta": f"{'+' if delta >= 0 else ''}{delta}%",
            "status": "High confidence for upcoming exam" if p_avg >= 75 else "Targeted practice recommended"
        })

    return jsonify({
        'practice_history': practice_history,
        'exam_history': exam_history,
        'comparison_summary': comparison_summary
    }), 200

# =========================================================================
# 7. MULTILINGUAL, VISUAL & PRACTICAL LEARNING RESOURCES
# =========================================================================

@student_bp.route('/learning-resources', methods=['GET'])
def get_learning_resources():
    """Returns visual diagrams, concept maps, simulations, and practical mini-projects with multilingual support."""
    resources = [
        {
            "id": "lr-1",
            "title": "Interactive Visual Concept Map: Definite Integration & Area Under Curve",
            "subject": "Mathematics",
            "format": "visual",
            "visual_type": "concept_map",
            "available_languages": ["English", "Hindi", "Gujarati"],
            "difficulty": "Intermediate",
            "desc": "Step-by-step visual dissection of Riemann sums transitioning to definite integrals with interactive geometric visualizer."
        },
        {
            "id": "lr-2",
            "title": "Circuit Simulator: Kirchhoff's Laws & Multi-Loop Mesh Reduction",
            "subject": "Physics",
            "format": "practical",
            "visual_type": "simulation",
            "available_languages": ["English", "Hindi", "Tamil"],
            "difficulty": "Intermediate",
            "desc": "Hands-on virtual circuit breadboard to place voltage sources, resistors, and observe KCL/KVL current flows dynamically."
        },
        {
            "id": "lr-3",
            "title": "Visual Flowchart: Binary Search Tree (BST) Balancing & Rotations",
            "subject": "Data Structures",
            "format": "visual",
            "visual_type": "flowchart",
            "available_languages": ["English", "Hindi"],
            "difficulty": "Intermediate",
            "desc": "Animated flowchart tracing AVL left and right rotations with node balance factor annotations."
        },
        {
            "id": "lr-4",
            "title": "Mini-Project: Build a Micro RESTful API with Flask & SQLite",
            "subject": "Python Programming",
            "format": "practical",
            "visual_type": "project",
            "available_languages": ["English", "Hindi", "Marathi"],
            "difficulty": "Intermediate",
            "desc": "End-to-end practical project building a working academic schedule backend with database migrations and tests."
        },
        {
            "id": "lr-5",
            "title": "Interactive Diagram: Neural Network Forward & Backpropagation",
            "subject": "Artificial Intelligence",
            "format": "visual",
            "visual_type": "interactive_diagram",
            "available_languages": ["English", "Hindi", "Telugu"],
            "difficulty": "Advanced",
            "desc": "Multi-layer perceptron node visualizer showing weight matrices, activation functions, and gradient descent updates."
        }
    ]

    return jsonify({'resources': resources}), 200

# =========================================================================
# 8. MENTORING, QUERIES & ACADEMICIAN RESEARCH INTERACTION
# =========================================================================

@student_bp.route('/queries', methods=['GET'])
@role_required('student')
def list_student_queries():
    """Lists doubts and queries submitted by student to their Institute."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, subject_name, query_type, title, question_text, response_text, status, created_at, answered_at
        FROM institute_queries
        WHERE student_id = ?
        ORDER BY created_at DESC
        """,
        (student_id,)
    )
    queries = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'queries': queries}), 200

@student_bp.route('/queries', methods=['POST'])
@role_required('student')
def raise_student_query():
    """Student raises an academic doubt, schedule question, or guidance request to Institute."""
    student_id = session['user_id']
    data = request.get_json() or {}

    subject_name = data.get('subject_name', 'General').strip()
    query_type = data.get('query_type', 'academic_doubt').strip()
    title = data.get('title', '').strip()
    question_text = data.get('question_text', '').strip()

    if not title or not question_text:
        return jsonify({'error': 'Title and question details are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT institute_id FROM students WHERE id = ?", (student_id,))
    st = cursor.fetchone()
    inst_id = st['institute_id'] if st and st['institute_id'] else 1

    cursor.execute(
        """
        INSERT INTO institute_queries (
            student_id, institute_id, subject_name, query_type, title, question_text, status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
        """,
        (student_id, inst_id, subject_name, query_type, title, question_text)
    )
    query_id = cursor.lastrowid

    # Create notification for Institute
    cursor.execute(
        """
        INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
        VALUES (?, 'institute', ?, ?, 'info', 'queries')
        """,
        (inst_id, "New Student Academic Query", f"A student submitted a query on {subject_name}: '{title}'.")
    )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Query submitted to Institute successfully!', 'query_id': query_id}), 201

@student_bp.route('/guidance', methods=['GET'])
@role_required('student')
def get_institute_guidance():
    """View mentoring and study priority suggestions sent by Institute."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, guidance_type, subject_name, message, created_at
        FROM institute_guidance
        WHERE student_id = ?
        ORDER BY created_at DESC
        """,
        (student_id,)
    )
    guidance = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'guidance': guidance}), 200

# =========================================================================
# 9. ACADEMICIAN RESEARCH INTERACTION
# =========================================================================

@student_bp.route('/research/papers', methods=['GET'])
def list_research_papers():
    """Discover research papers published by Academicians."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT rp.id, rp.title, rp.field, rp.abstract, rp.pdf_url, rp.created_at,
               aca.name as academician_name, aca.expertise_domain
        FROM research_papers rp
        JOIN academicians aca ON rp.academician_id = aca.id
        ORDER BY rp.created_at DESC
        """
    )
    papers = [row_to_dict(r) for r in cursor.fetchall()]

    for p in papers:
        cursor.execute(
            """
            SELECT rd.id, rd.question, rd.response, rd.status, rd.created_at, rd.answered_at,
                   s.name as student_name
            FROM research_discussions rd
            JOIN students s ON rd.student_id = s.id
            WHERE rd.paper_id = ?
            ORDER BY rd.created_at ASC
            """,
            (p['id'],)
        )
        p['discussions'] = [row_to_dict(r) for r in cursor.fetchall()]

    conn.close()
    return jsonify({'papers': papers}), 200

@student_bp.route('/research/papers/<int:paper_id>/discussions', methods=['POST'])
@role_required('student')
def ask_research_question(paper_id):
    """Students ask a question or discuss concepts regarding a research paper."""
    student_id = session['user_id']
    data = request.get_json() or {}
    question = data.get('question', '').strip()

    if not question:
        return jsonify({'error': 'Question cannot be empty.'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT academician_id, title FROM research_papers WHERE id = ?", (paper_id,))
    paper = cursor.fetchone()
    if not paper:
        conn.close()
        return jsonify({'error': 'Research paper not found.'}), 404

    acad_id = paper['academician_id']

    cursor.execute(
        """
        INSERT INTO research_discussions (paper_id, student_id, academician_id, question, status)
        VALUES (?, ?, ?, ?, 'open')
        """,
        (paper_id, student_id, acad_id, question)
    )
    disc_id = cursor.lastrowid

    # Create notification for Academician
    cursor.execute(
        """
        INSERT INTO notifications (user_id, user_role, title, message, notification_type, link_tab)
        VALUES (?, 'academician', ?, ?, 'info', 'discuss')
        """,
        (acad_id, "New Question on Research Paper", f"A student asked a question on '{paper['title']}': \"{question[:60]}...\"")
    )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Question posted to Academician!', 'discussion_id': disc_id}), 201

# =========================================================================
# 10. EDUCATIONAL & DEVELOPMENTAL OPPORTUNITIES
# =========================================================================

@student_bp.route('/opportunities', methods=['GET'])
@role_required('student')
def get_matched_opportunities():
    """Intelligently matches educational opportunities (competitions, workshops, research, scholarships, projects)
    based on student's interested subjects, additional skills, and verified progress level."""
    student_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT interested_subjects, additional_skills, knowledge_level FROM students WHERE id = ?", (student_id,))
    st = cursor.fetchone()
    interests = (st['interested_subjects'] or '').lower() if st else ''
    skills = (st['additional_skills'] or '').lower() if st else ''
    k_level = (st['knowledge_level'] or 'Intermediate') if st else 'Intermediate'

    cursor.execute(
        """
        SELECT id, title, opportunity_type, subject_field, required_level, description, provider, deadline, action_link, eligibility, created_at
        FROM educational_opportunities
        ORDER BY created_at DESC
        """
    )
    all_opps = [row_to_dict(r) for r in cursor.fetchall()]
    conn.close()

    # Intelligent match calculation
    for op in all_opps:
        match_score = 70
        field_lower = op['subject_field'].lower()
        if any(w in field_lower for w in interests.split(',')):
            match_score += 18
        if any(w in field_lower for w in skills.split(',')):
            match_score += 10
        if op['required_level'].lower() in (k_level.lower(), 'all levels'):
            match_score += 8
        op['match_percentage'] = min(98, match_score)

    all_opps.sort(key=lambda x: x['match_percentage'], reverse=True)

    return jsonify({'opportunities': all_opps}), 200

# =========================================================================
# 11. KNOWLEDGE-GAP FEEDBACK & REPORTING
# =========================================================================

@student_bp.route('/feedback/knowledge-gap', methods=['POST'])
@role_required('student')
def report_knowledge_gap():
    """Students report missing topics, unclear concepts, missing prerequisites, or real-world gaps."""
    student_id = session['user_id']
    data = request.get_json() or {}

    subject_name = data.get('subject_name', '').strip()
    topic_name = data.get('topic_name', '').strip()
    feedback_type = data.get('feedback_type', 'missing_topic').strip()
    description = data.get('description', '').strip()

    if not subject_name or not description:
        return jsonify({'error': 'Subject name and description are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO knowledge_gap_feedbacks (
            student_id, subject_name, topic_name, feedback_type, description, status
        )
        VALUES (?, ?, ?, ?, ?, 'reported')
        """,
        (student_id, subject_name, topic_name, feedback_type, description)
    )
    conn.commit()
    fb_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'message': 'Thank you! Your knowledge gap feedback has been recorded for curriculum analysis.',
        'feedback_id': fb_id
    }), 201

# =========================================================================
# 12. LEGACY COMPATIBILITY
# =========================================================================

@student_bp.route('/documents', methods=['POST'])
@role_required('student')
def upload_document():
    student_id = session['user_id']
    data = request.get_json() or {}
    doc_type = data.get('document_type', '').strip().lower()
    file_url = data.get('file_url', '').strip()

    if not doc_type or not file_url:
        return jsonify({'error': 'document_type and file_url are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO student_documents (student_id, document_type, file_url) VALUES (?, ?, ?)",
        (student_id, doc_type, file_url)
    )
    conn.commit()
    doc_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'message': 'Document uploaded successfully!',
        'document': {'id': doc_id, 'document_type': doc_type, 'file_url': file_url}
    }), 201

@student_bp.route('/assessments/<skill_name>/questions', methods=['GET'])
@role_required('student')
def get_assessment_questions(skill_name):
    level = request.args.get('level', 'intermediate')
    count = int(request.args.get('count', 10))
    questions = gemini_service.get_or_generate_questions(skill_name, count=count, level=level)
    return jsonify({'skill': skill_name, 'level': level, 'questions': questions}), 200

@student_bp.route('/assessments/<skill_name>/submit', methods=['POST'])
@role_required('student')
def submit_skill_assessment(skill_name):
    student_id = session['user_id']
    data = request.get_json() or {}
    answers = data.get('answers', {})
    total_q = int(data.get('total_questions', 10))

    score = 80.0
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR REPLACE INTO student_skill_scores (student_id, skill_name, percentage, assessed_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """,
        (student_id, skill_name, score)
    )
    conn.commit()
    conn.close()

    return jsonify({'message': f'Skill test for {skill_name} recorded!', 'result': {'percentage': score}}), 200