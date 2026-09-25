# Utility for generating comprehensive, interesting, and deeply detailed dual-track learning pathways

def build_rich_pathway_topics(subject_name: str, pathway_type: str = 'academic', score_pct: float = 0.0, understood: list = None, needs_improvement: list = None):
    understood = understood or []
    needs_improvement = needs_improvement or []
    sub_lower = subject_name.lower().strip()

    if any(k in sub_lower for k in ['math', 'calculus', 'algebra', 'linear']):
        if pathway_type == 'academic':
            return [
                {
                    "id": "m1",
                    "title": "Limits, Continuity & Single-Variable Calculus",
                    "status": "mastered" if "Limits & Continuity" in understood or score_pct >= 80 else ("needs_revision" if "Limits & Continuity" in needs_improvement else "in_progress"),
                    "difficulty": "Basic",
                    "est_hours": 8,
                    "type": "visual",
                    "key_concept": r"\lim_{x \to 0} \frac{\sin x}{x} = 1, \quad \text{L'Hôpital: } \lim \frac{f'(x)}{g'(x)}",
                    "real_world_app": "Threshold limit determination in analog signal processing and neural network activations",
                    "summary": "Epsilon-delta formal definitions, one-sided limits, continuity criteria, Intermediate Value Theorem, and differentiability."
                },
                {
                    "id": "m2",
                    "title": "Differentiation Rules, Chain Rule & Extreme Values",
                    "status": "mastered" if "Differentiation & Chain Rule" in understood or score_pct >= 70 else ("needs_revision" if "Differentiation & Chain Rule" in needs_improvement else "in_progress"),
                    "difficulty": "Intermediate",
                    "est_hours": 10,
                    "type": "interactive",
                    "key_concept": r"\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x), \quad \nabla f(x) = 0",
                    "real_world_app": "Gradient Descent loss optimization in Deep Learning and rate of chemical reaction kinetics",
                    "summary": "Product, quotient, and chain rules; implicit differentiation, Taylor and Maclaurin polynomial expansions, local extrema, concavity, and optimization."
                },
                {
                    "id": "m3",
                    "title": "Definite & Indefinite Integrals with Applications",
                    "status": "mastered" if "Integral Calculus" in understood or score_pct >= 75 else ("needs_revision" if "Integral Calculus" in needs_improvement else "in_progress"),
                    "difficulty": "Intermediate",
                    "est_hours": 12,
                    "type": "practical",
                    "key_concept": r"\int u\,dv = uv - \int v\,du, \quad \int_a^b f(x)dx = F(b) - F(a)",
                    "real_world_app": "Continuous probability density functions, digital signal power spectrum, and mechanical work done",
                    "summary": "Fundamental Theorem of Calculus, substitution techniques, integration by parts, partial fractions, improper integrals, arc length, and volumes of solids of revolution."
                },
                {
                    "id": "m4",
                    "title": "Linear Algebra: Vector Spaces, Rank & Matrix Inverses",
                    "status": "mastered" if "Linear Algebra" in understood or score_pct >= 70 else ("needs_revision" if "Linear Algebra" in needs_improvement else "in_progress"),
                    "difficulty": "Intermediate",
                    "est_hours": 12,
                    "type": "interactive",
                    "key_concept": r"\det(A) \neq 0 \iff A^{-1} \text{ exists}, \quad \text{Rank}(A) + \text{Nullity}(A) = n",
                    "real_world_app": "Affine transformations in 3D graphics, solving large electrical node-voltage networks, PageRank",
                    "summary": "Vector subspaces, linear independence, basis and dimension, Gaussian elimination, matrix operations, determinants, and matrix inverses."
                },
                {
                    "id": "m5",
                    "title": "Eigenvalues, Eigenvectors & Diagonalization",
                    "status": "mastered" if score_pct >= 85 else "next",
                    "difficulty": "Advanced",
                    "est_hours": 14,
                    "type": "visual",
                    "key_concept": r"A \mathbf{v} = \lambda \mathbf{v}, \quad \det(A - \lambda I) = 0",
                    "real_world_app": "Principal Component Analysis (PCA) dimensionality reduction, facial recognition, and bridge structural vibration modes",
                    "summary": "Characteristic polynomials, algebraic and geometric multiplicity, diagonalizability, symmetric matrices, and Singular Value Decomposition (SVD)."
                },
                {
                    "id": "m6",
                    "title": "Ordinary & Partial Differential Equations",
                    "status": "mastered" if "Differential Equations" in understood else ("needs_revision" if "Differential Equations" in needs_improvement else "next"),
                    "difficulty": "Advanced",
                    "est_hours": 14,
                    "type": "code",
                    "key_concept": r"\frac{d^2y}{dx^2} + 2\zeta\omega_n \frac{dy}{dx} + \omega_n^2 y = 0, \quad \mathcal{L}\{f(t)\} = F(s)",
                    "real_world_app": "RLC transient circuit response, PID controller feedback tuning, heat diffusion, and vehicle suspension dampers",
                    "summary": "First-order separable and linear ODEs, integrating factors, second-order linear differential equations, Laplace transforms, and heat/wave equations."
                },
                {
                    "id": "m7",
                    "title": "Vector Calculus & Electromagnetic Field Theorems",
                    "status": "mastered" if "Vector Calculus" in understood else "next",
                    "difficulty": "Advanced",
                    "est_hours": 12,
                    "type": "visual",
                    "key_concept": r"\iint_S (\nabla \times \mathbf{F}) \cdot d\mathbf{S} = \oint_C \mathbf{F} \cdot d\mathbf{r}, \quad \iiint_V (\nabla \cdot \mathbf{F}) dV = \iint_S \mathbf{F} \cdot d\mathbf{S}",
                    "real_world_app": "Maxwell's Equations in 5G wireless antenna design, fluid velocity fields, aerodynamics simulation",
                    "summary": "Gradient, divergence, curl, directional derivatives, line and surface integrals, conservative vector fields, Green's Theorem, Divergence Theorem, Stokes' Theorem."
                },
                {
                    "id": "m8",
                    "title": "Infinite Series, Power Series & Fourier Analysis",
                    "status": "mastered" if "Infinite Series" in understood else "next",
                    "difficulty": "Advanced",
                    "est_hours": 12,
                    "type": "code",
                    "key_concept": r"f(x) = \frac{a_0}{2} + \sum_{n=1}^\infty \left(a_n \cos nx + b_n \sin nx\right)",
                    "real_world_app": "Fast Fourier Transform (FFT) for audio compression (MP3/AAC), digital noise cancellation, frequency synthesis",
                    "summary": "Convergence tests (ratio, root, integral, alternating series), radius of convergence, Taylor and Maclaurin series, Fourier series expansion of periodic square/sawtooth waveforms."
                }
            ]
        else: # Track 2: Mathematics of Emerging Tech & Computing
            return [
                {
                    "id": "mt1",
                    "title": "Mathematics of Machine Learning & Convex Optimization",
                    "status": "in_progress",
                    "difficulty": "Intermediate",
                    "est_hours": 12,
                    "type": "code",
                    "key_concept": r"\mathbf{w}_{t+1} = \mathbf{w}_t - \eta \nabla L(\mathbf{w}_t), \quad \mathbf{H}_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}",
                    "real_world_app": "Training deep neural networks, convergence of SGD and Adam optimizers, support vector machine hyperplane optimization",
                    "summary": "Multivariate gradients, Jacobian matrices, Hessian curvature, convex sets, cross-entropy loss, Lagrange multipliers, and Karush-Kuhn-Tucker (KKT) conditions."
                },
                {
                    "id": "mt2",
                    "title": "Modern Cryptographic Number Theory & Elliptic Curves",
                    "status": "next",
                    "difficulty": "Advanced",
                    "est_hours": 14,
                    "type": "code",
                    "key_concept": r"c = m^e \pmod n, \quad y^2 = x^3 + ax + b \pmod p, \quad \gcd(a, b) = ax + by",
                    "real_world_app": "RSA-4096 public key encryption, ECDSA signatures in blockchain, TLS 1.3 cryptographic handshakes",
                    "summary": "Modular arithmetic, Fermat's Little Theorem, Euler's totient function, Extended Euclidean Algorithm, Chinese Remainder Theorem, discrete logarithms, and elliptic curve group laws."
                },
                {
                    "id": "mt3",
                    "title": "3D Computer Graphics Geometry & Quaternions",
                    "status": "next",
                    "difficulty": "Intermediate",
                    "est_hours": 10,
                    "type": "visual",
                    "key_concept": r"\mathbf{q} = w + xi + yj + zk, \quad i^2 = j^2 = k^2 = ijk = -1, \quad \mathbf{v}' = \mathbf{q}\mathbf{v}\mathbf{q}^*",
                    "real_world_app": "Robotics forward kinematics, VR/AR head tracking without gimbal lock, Unity/Unreal 3D camera controls",
                    "summary": "Homogeneous coordinates, 4x4 affine transformation matrices, rotation, scaling, shearing, camera view projection matrices, unit quaternions and spherical linear interpolation (SLERP)."
                },
                {
                    "id": "mt4",
                    "title": "Numerical Analysis & Fast Fourier Transform (FFT)",
                    "status": "next",
                    "difficulty": "Advanced",
                    "est_hours": 12,
                    "type": "practical",
                    "key_concept": r"X_k = \sum_{n=0}^{N-1} x_n \cdot e^{-i 2\pi k n / N} \quad [O(N \log N)]",
                    "real_world_app": "Active noise cancellation headphones, seismic earthquake analysis, MRI medical image frequency reconstruction",
                    "summary": "Root finding algorithms (Newton-Raphson, Bisection), Runge-Kutta 4th order ODE solvers for physics engines, Cooley-Tukey FFT algorithm, and numerical differentiation."
                }
            ]

    elif any(k in sub_lower for k in ['computer', 'data structure', 'algorithm', 'software', 'programming', 'cs', 'python']):
        if pathway_type == 'academic':
            return [
                {
                    "id": "cs1",
                    "title": "Data Structures & Algorithmic Complexity",
                    "status": "mastered" if score_pct >= 70 else "in_progress",
                    "difficulty": "Basic",
                    "est_hours": 12,
                    "type": "code",
                    "key_concept": r"T(n) = aT(n/b) + f(n) \text{ [Master Theorem]}, \quad O(1) \subset O(\log n) \subset O(n \log n)",
                    "real_world_app": "High-throughput database indexing, memory-constrained embedded buffers, router queues",
                    "summary": "Arrays, dynamic lists, stacks, queues, hash tables with open addressing/chaining, trees, heaps, and asymptotic Big-O analysis."
                },
                {
                    "id": "cs2",
                    "title": "Graph Algorithms & Dynamic Programming",
                    "status": "in_progress",
                    "difficulty": "Intermediate",
                    "est_hours": 14,
                    "type": "practical",
                    "key_concept": r"\text{Dijkstra: } O((V+E) \log V), \quad \text{Bellman-Ford: } O(VE)",
                    "real_world_app": "Google Maps GPS navigation, compiler AST dependency resolution, network packet routing",
                    "summary": "BFS/DFS traversals, topological sorting, shortest paths (Dijkstra, Bellman-Ford), minimum spanning trees (Kruskal, Prim), 1D/2D memoization."
                },
                {
                    "id": "cs3",
                    "title": "Operating Systems & Concurrency Internals",
                    "status": "mastered" if score_pct >= 80 else "in_progress",
                    "difficulty": "Intermediate",
                    "est_hours": 14,
                    "type": "visual",
                    "key_concept": r"\text{Peterson's Algorithm, Semaphores: } P(s), V(s), \quad \text{Banker's Deadlock Avoidance}",
                    "real_world_app": "Multithreaded web server thread pooling, kernel interrupt handlers, low-latency trading engines",
                    "summary": "Processes, threads, CPU scheduling algorithms, mutexes, semaphores, deadlock detection/prevention, virtual memory, paging, and TLB translation."
                },
                {
                    "id": "cs4",
                    "title": "Database Systems & Storage Engine Architecture",
                    "status": "next",
                    "difficulty": "Intermediate",
                    "est_hours": 12,
                    "type": "code",
                    "key_concept": r"\text{ACID Properties, 3NF Normalization: } X \to A \implies X \text{ superkey or } A \text{ prime}",
                    "real_world_app": "Financial ledger transactions, distributed sharded databases, query optimizer plan generation",
                    "summary": "Relational algebra, SQL, functional dependencies, 1NF/2NF/3NF/BCNF normalization, B+ tree indexes, WAL logs, and two-phase locking (2PL)."
                },
                {
                    "id": "cs5",
                    "title": "Computer Networks & Layered Protocol Architecture",
                    "status": "next",
                    "difficulty": "Intermediate",
                    "est_hours": 12,
                    "type": "visual",
                    "key_concept": r"\text{TCP 3-Way Handshake: SYN } \to \text{ SYN-ACK } \to \text{ ACK, Sliding Window Protocol}",
                    "real_world_app": "Cloud CDN content distribution, WebSocket real-time chat, HTTP/3 QUIC streaming",
                    "summary": "OSI 7-layer model, Ethernet, IP addressing, CIDR subnetting, routing protocols (BGP, OSPF), TCP reliability & congestion control, UDP, DNS, TLS."
                }
            ]
        else:
            return [
                {
                    "id": "cst1",
                    "title": "Distributed Systems & Microservices Architecture",
                    "status": "in_progress",
                    "difficulty": "Advanced",
                    "est_hours": 16,
                    "type": "code",
                    "key_concept": r"\text{CAP Theorem: Consistency, Availability, Partition Tolerance}",
                    "real_world_app": "Global scale platforms (Netflix, Uber), payment gateways with idempotency keys",
                    "summary": "gRPC RPC communication, event-driven architecture with Kafka, distributed caching with Redis, rate limiting, and circuit breakers."
                },
                {
                    "id": "cst2",
                    "title": "Cloud Native DevOps & Container Orchestration",
                    "status": "next",
                    "difficulty": "Intermediate",
                    "est_hours": 14,
                    "type": "practical",
                    "key_concept": r"\text{Container isolation via Linux cgroups and namespaces, Kubernetes declarative state}",
                    "real_world_app": "Automated zero-downtime deployment pipelines, auto-scaling web application clusters",
                    "summary": "Docker image optimization, multi-stage builds, Kubernetes pods/deployments/services, Helm charts, GitHub Actions CI/CD."
                }
            ]

    elif 'physic' in sub_lower:
        return [
            {
                "id": "ph1",
                "title": "Current Electricity & Temperature Coefficients",
                "status": "mastered" if "Current Electricity" in understood or score_pct >= 70 else "in_progress",
                "difficulty": "Basic",
                "est_hours": 8,
                "type": "visual",
                "key_concept": r"R = \rho \frac{l}{A}, \quad R_t = R_0(1+\alpha \Delta T)",
                "real_world_app": "PTC thermistors, precision semiconductor current sensing, transmission line losses",
                "summary": "Drift velocity, Ohm's law micro-model, resistivity, color coding, internal resistance, and electromotive force."
            },
            {
                "id": "ph2",
                "title": "Kirchhoff's Circuit Laws & Bridge Networks",
                "status": "mastered" if "Kirchhoff's Laws" in understood or score_pct >= 75 else "in_progress",
                "difficulty": "Intermediate",
                "est_hours": 10,
                "type": "interactive",
                "key_concept": r"\sum I_{\text{in}} = \sum I_{\text{out}}, \quad \sum \Delta V = 0, \quad \frac{P}{Q} = \frac{R}{S}",
                "real_world_app": "Strain gauge sensor bridges, analog analog-to-digital converter frontends",
                "summary": "Junction rule (charge conservation), Loop rule (energy conservation), Wheatstone bridge null point conditions."
            },
            {
                "id": "ph3",
                "title": "Electromagnetic Induction & Faraday-Lenz Dynamics",
                "status": "mastered" if "Electromagnetic Induction" in understood else ("needs_revision" if "Electromagnetic Induction" in needs_improvement else "next"),
                "difficulty": "Intermediate",
                "est_hours": 12,
                "type": "visual",
                "key_concept": r"\mathcal{E} = -\frac{d\Phi_B}{dt} = -L \frac{dI}{dt}",
                "real_world_app": "Electric vehicle induction motors, wireless Qi smartphone chargers, power grid transformers",
                "summary": "Magnetic flux, induced EMF, Lenz's law polarity, self & mutual inductance, eddy currents, AC generator principles."
            },
            {
                "id": "ph4",
                "title": "Wave Optics & Electromagnetic Wave Radiation",
                "status": "mastered" if "Wave Optics & Interference" in understood else "next",
                "difficulty": "Advanced",
                "est_hours": 12,
                "type": "practical",
                "key_concept": r"\beta = \frac{\lambda D}{d}, \quad c = \frac{1}{\sqrt{\mu_0 \epsilon_0}}",
                "real_world_app": "Fiber-optic telecommunications, anti-reflective optical lens coatings, laser interferometry (LIGO)",
                "summary": "Huygens' principle, wavefront propagation, coherent sources, Young's double slit experiment, fringe width, diffraction gratings."
            }
        ]

    else:
        # Default high-quality structured pathway
        return [
            {
                "id": "gen1",
                "title": f"{subject_name}: Core Principles & Foundational Theory",
                "status": "mastered" if score_pct >= 60 else "in_progress",
                "difficulty": "Basic",
                "est_hours": 10,
                "type": "visual",
                "key_concept": f"Core theoretical foundations and structural laws of {subject_name}",
                "real_world_app": f"Foundational baseline for engineering workflows in {subject_name}",
                "summary": f"Fundamental terminology, governing equations, prerequisite principles, and taxonomy of {subject_name}."
            },
            {
                "id": "gen2",
                "title": f"{subject_name}: Standard Analytical & Applied Methods",
                "status": "mastered" if score_pct >= 80 else "in_progress",
                "difficulty": "Intermediate",
                "est_hours": 12,
                "type": "interactive",
                "key_concept": f"Procedural algorithms and problem solving paradigms in {subject_name}",
                "real_world_app": f"Applied problem solving and operational diagnostics in {subject_name}",
                "summary": f"Detailed problem-solving strategies, standard analytical procedures, case analysis, and practical exercises."
            },
            {
                "id": "gen3",
                "title": f"{subject_name}: Advanced Paradigms & Industry Implementations",
                "status": "in_progress",
                "difficulty": "Intermediate",
                "est_hours": 14,
                "type": "practical",
                "key_concept": f"Performance optimization, edge cases, and architectural tradeoffs in {subject_name}",
                "real_world_app": f"Production-grade architectures and real-world system integrations",
                "summary": f"Advanced techniques, efficiency metrics, error handling, industry standards, and testing protocols."
            },
            {
                "id": "gen4",
                "title": f"{subject_name}: Hands-on Synthesis & Capstone Portfolio",
                "status": "next",
                "difficulty": "Advanced",
                "est_hours": 16,
                "type": "code",
                "key_concept": f"End-to-end project design, verification, and empirical benchmarking",
                "real_world_app": f"Production-ready open source or research deliverable for portfolio showcase",
                "summary": f"Complete capstone execution, documentation, peer review, and submission-ready practical application."
            }
        ]
