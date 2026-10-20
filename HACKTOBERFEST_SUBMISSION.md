# SlothSort AI — The Privacy-First Offline AI File Organizer

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

---

## What I Built

I built **SlothSort AI**, an offline-capable, privacy-first AI file organizer designed for the Hacktoberfest 2026 "Slow and Steady" challenge.

### What does it do?
Every developer, student, and knowledge worker has a chaotic **Downloads** or **Desktop** folder filled with hundreds of cryptically named files:
- `IMG_9482.jpg`, `IMG_9483.jpg` (random camera snapshots)
- `hw3_cs101_draft_final_v2.docx` (student assignments)
- `invoice_unpaid_2026_10.pdf` (financial records and receipts)
- `budget_q4_forecast_FINAL.xlsx` (work spreadsheets)
- `.env.local` and `id_rsa_backup.key` (sensitive developer credentials accidentally left in downloads)

Existing file organizers either run opaque scripts that blindly move files into wrong places, or require uploading your personal files and metadata to cloud-hosted proprietary AI APIs (OpenAI, Anthropic). 

**SlothSort AI** takes the opposite approach:
1. **100% Offline & Private**: Uses local open-weight language models via **Ollama** (`llama3.2`, `mistral`, `phi3`). Not a single byte of metadata or file content ever leaves your machine.
2. **Slow and Steady Safety**:
   - **Default Dry-Run Simulation**: Simulates the exact organization without modifying a single bit on disk.
   - **Sensitive File Shield**: Automatically detects and excludes private credentials (`.env`, `id_rsa`, `*.pem`, `*.key`).
   - **Protected System Boundaries**: Blocks accidental selection of root drives (`C:\`) or Windows system folders (`C:\Windows`, `System32`, `Program Files`).
   - **Non-Destructive Collisions**: Auto-numbers conflicting files (`Photo_1.jpg`) or skips them—**never overwriting or deleting files**.
   - **Atomic 1-Click Rollback**: Every batch is recorded in a recoverable local JSON history log, allowing instant undo of all moves and renames.
3. **Interactive Plan Preview**: Displays proposed categories and clean filenames with an inline editable table so you can tweak suggestions before approving.
4. **Honest Demo Mode**: If Ollama is offline or uninstalled, the app seamlessly falls back to a deterministic semantic heuristic engine with clear visual labeling ("Simulated AI").

### Who gets to be a little lazier because of it?
**Anyone who dreads organizing their messy Downloads or Desktop folders!** Instead of spending 45 minutes manually opening, reading, renaming, and dragging files into subdirectories, you can:
1. Select your folder (or click *"Create Demo Test Folder"* for a zero-risk test).
2. Click **Scan Files**.
3. Click **Organize My Mess**.
4. Review the preview and click **Apply Approved Changes**.

---

## Demo

- **Repository**: [https://github.com/your-username/SlothSort-AI](https://github.com/your-username/SlothSort-AI)
- **Local Dashboard**: Runs locally on `http://localhost:5173` with FastAPI backend on `http://127.0.0.1:8000`.

### Workflow Walkthrough:
1. **Dashboard & Folder Selection**: Friendly sloth-inspired sage-green and cream aesthetic with live local AI status and privacy shield indicators.
2. **Metadata Scan**: Instantly shows file volume, category distribution, and shielded sensitive credentials.
3. **Interactive AI Plan Preview**: Table showing original names, proposed categories (Documents, Images, College, Projects, Code, Spreadsheets, Archives), inline editable filenames, destination paths, and collision checks.
4. **Dry-Run & Execution**: Clear before-and-after summary showing files moved, renamed, or skipped.
5. **Undo Last Operation**: 1-click rollback restoring all files to their original directories and cleaning up empty folders.

---

## Code

The project is fully open-sourced under the **MIT License**:

🔗 **GitHub Repository**: [https://github.com/your-username/SlothSort-AI](https://github.com/your-username/SlothSort-AI)

### Architecture Overview

```
SlothSort AI/
├── backend/
│   ├── app/
│   │   ├── config.py          # Model settings (OLLAMA_HOST, OLLAMA_MODEL, DRY_RUN)
│   │   ├── safety.py          # Path validation, traversal guards, Windows reserved names
│   │   ├── scanner.py         # Metadata scanner & sensitive credential detector
│   │   ├── organizer.py       # Ollama integration & deterministic heuristic demo engine
│   │   ├── executor.py        # File move/rename executor with collision auto-numbering
│   │   ├── undo.py            # Local JSON history storage and atomic rollback manager
│   │   ├── models.py          # Pydantic data schemas
│   │   └── main.py            # FastAPI REST application
│   └── tests/
│       ├── test_safety.py     # Unit tests for path traversal, symlinks, Windows reserved names
│       ├── test_duplicates.py # Unit tests for non-destructive collision resolution
│       ├── test_organizer.py  # Unit tests for AI plan generation & schema parsing
│       ├── test_undo.py       # Unit tests for dry-run safety & atomic rollback
│       └── test_api.py        # Full API integration tests via TestClient (21/21 passed)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Sloth branding, privacy pill & Ollama status badge
│   │   │   ├── FolderSelector.jsx   # Safe folder input, browse dialog & demo generator
│   │   │   ├── ScanStats.jsx        # Metadata counts, volume & privacy shield metrics
│   │   │   ├── PlanPreview.jsx      # Interactive preview table with inline edits & toggles
│   │   │   ├── ExecutionSummary.jsx # Before/after results & dry-run verification
│   │   │   ├── HistoryModal.jsx     # Batch history log & 1-click rollback
│   │   │   └── SettingsModal.jsx    # Ollama host/model configuration & connection tester
│   │   ├── App.jsx            # State orchestration and workflow stepper
│   │   └── index.css          # Sloth sage-green and cream design system
│   ├── package.json
│   └── vite.config.js         # Proxy configuration to FastAPI backend
├── run_slothsort.bat          # 1-click Windows batch launcher
├── README.md                  # Comprehensive documentation and setup guide
└── LICENSE                    # MIT License
```

---

## How I Built It

SlothSort AI was built around modern local open-weight AI and a robust, safety-hardened full-stack architecture:

### 1. Local Open-Weight AI (Ollama)
- Uses **Ollama** running locally on `http://localhost:11434` with lightweight open-weight models such as **Llama 3.2 (3B / 1B)**, **Mistral 7B**, **Phi-3**, or **Qwen 2.5**.
- Injects safe, untrusted metadata into strict JSON format prompts (`format: "json"`).
- Implements rigorous **Pydantic validation** and **output sanitization**:
  - Model suggestions are treated as untrusted input.
  - File extensions are strictly preserved and cannot be stripped or altered.
  - Windows illegal characters (`< > : " / \ | ? *`) and reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`) are neutralized.
- **Honest Demo Mode Fallback**: If Ollama is not installed or the service is offline, SlothSort AI does not crash or fake AI responses. It transparently runs its deterministic heuristic rules engine and marks the output with an amber **"Simulated AI (Demo Mode)"** badge.

### 2. Python & FastAPI Backend
- **Safe Scanner (`scanner.py`)**: Gathers file metadata without uploading anything. Automatically identifies and protects sensitive credentials (`.env`, `id_rsa`, `*.pem`, `*.key`) so they are never renamed or modified.
- **Path Containment & Security (`safety.py`)**: Uses canonical path resolution (`resolve()`) to ensure no file operation escapes the selected root. Traversal attacks (`..`) and symlink escapes are blocked.
- **Collision Resolution (`executor.py`)**: If `Report.pdf` already exists at destination, it resolves to `Report_1.pdf`. Overwriting is strictly prohibited.
- **Atomic Undo Engine (`undo.py`)**: Maintains a persistent local JSON audit log with batch IDs and reverse operations. Reverting a batch moves files back to their exact original locations and cleans up empty folders.

### 3. React & Vite Modern Frontend
- Styled with a **sloth-inspired sage-green and cream palette** (`#20362B`, `#5C8E74`, `#F6F1E7`, `#FFFFFF`) using modern typography (**Outfit** and **Plus Jakarta Sans**).
- Features glassmorphism surfaces, subtle micro-animations (swaying sloth logo), status pills, category badges, and accessible controls.
- Interactive table supports inline editable filenames, category overrides, and individual approve/reject toggles.
- Includes a **1-Click Demo Mess Generator** that creates 13 realistic mock files (including homework drafts, invoices, code, photos, and mock sensitive keys) for immediate, zero-risk testing.

---

## Why Does Open Innovation Matter?

Open innovation is the cornerstone of **SlothSort AI**:

1. **True Privacy Requires Open Local Models**: A file organizer handles your tax forms, medical records, bank statements, and private source code. Sending this data to closed cloud APIs (OpenAI, Anthropic) introduces unacceptable data leakage and telemetry risks. With open-weight models running on Ollama, **your files never leave your computer**.
2. **Zero Recurring API Costs**: Cloud AI costs money for every token processed. Organizing 1,000 files through cloud APIs accumulates continuous subscription or pay-per-call costs. Open-weight models running locally cost **$0.00 forever**.
3. **Air-Gapped & Offline Independence**: Closed APIs require high-speed internet connections and are subject to server outages, rate limits, and policy changes. SlothSort AI runs on a laptop in an airplane, in rural areas, or on high-security air-gapped workstations.
4. **Community Choice & Longevity**: Users can swap between Meta's Llama 3.2, Mistral AI's Apache 2.0 models, Microsoft's Phi-3, or Alibaba's Qwen 2.5 with a single setting. You are never locked into a single proprietary vendor.

---

## The Lazy Payoff

### The "Before" vs. "After":
- **Before SlothSort AI**:
  - 45 minutes of dragging files into folders.
  - Renaming `IMG_9482.jpg` to `Vacation_Photo.jpg` one by one.
  - Accidentally overwriting a file because a name conflicted.
  - Stressing over whether an automated script accidentally moved private `.env` files into a public folder.
- **After SlothSort AI**:
  - **30 seconds total**: Click *Select Folder* → Click *Scan* → Click *Organize My Mess* → Review Preview → Click *Apply*.
  - **Zero stress**: Everything was verified in Dry-Run first.
  - **Instant peace of mind**: If anything wasn't to your liking, one click of **Undo Last Operation** puts every single file right back where it started.

---

## Prize Categories

- **Primary Challenge**: Hacktoberfest 2026 — Week 3: *Slow and Steady*
- **Categories**:
  - Open-Weight AI / Local AI
  - Privacy-Preserving Automation
  - Developer & Everyday Productivity Tools
  - Offline-First Open Innovation

---

*Built with patience, precision, and care for Hacktoberfest 2026. Slow and steady keeps your files safe! 🦥*
