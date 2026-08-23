# FBISE Result Analyzer

A full-stack web application for analyzing and exploring FBISE (Federal Board of Intermediate and Secondary Education) examination results across classes 9th, 10th, 11th, and 12th. Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **MongoDB**.

---

## ✨ Features

### 📊 Result Dashboard
- View student results for a selected institution and class level
- Summary statistics: total enrolled, passed, compartment, absent, and other statuses
- Searchable and filterable student table with grade and marks details
- Export results to Excel (`.xlsx`)

### 🏆 Position Finder
- Enter a marks score to find your board/school merit rank
- Three scopes supported:
  - **Board-wide** — rank among all students in the board
  - **GB (Gilgit-Baltistan)** — regional rank
  - **Institution** — rank within a specific school/college
- Displays percentile, top score, and students who scored higher

### ⚖️ Institution Compare *(10th & 12th only)*
- Select and compare multiple institutions side-by-side
- Breakdown by subject group (Science, Humanities, etc.)
- Metrics: pass %, GPA, grade distribution (A1 → E), enrolled/absent/fail counts
- Top students per institution are listed

---

## 🛠 Tech Stack

| Layer        | Technology                         |
|--------------|------------------------------------|
| Framework    | Next.js 16 (App Router)            |
| UI           | React 19, Tailwind CSS v4          |
| Language     | TypeScript 5                       |
| Database     | MongoDB via Mongoose               |
| Icons        | Lucide React                       |
| Fuzzy Search | Fuse.js                            |
| Excel Export | SheetJS (`xlsx`)                   |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── institutions/         # GET institutions list (fuzzy search)
│   │   ├── students/             # GET student results by class & institution
│   │   ├── export-excel/         # GET export results as Excel file
│   │   ├── tenth-institutions/   # GET 10th class institution stats
│   │   └── twelfth-institutions/ # GET 12th class institution stats
│   ├── institutions/
│   │   └── [classLevel]/         # Institution compare page (dynamic route)
│   ├── services/                 # Client-side API service functions
│   ├── layout.tsx                # Root layout with global fonts & metadata
│   └── page.tsx                  # Home page (ResultAnalyzer entry point)
│
├── components/
│   ├── result-analyzer.tsx       # Main orchestrator component
│   ├── analysis-mode-select.tsx  # Mode switcher (Result / Position / Compare)
│   ├── institution-select.tsx    # Single institution combobox
│   ├── multi-institution-select.tsx  # Multi-select for comparison mode
│   ├── institution-compare-table.tsx # Side-by-side institution stats table
│   ├── position-finder.tsx       # Position/rank finder UI
│   ├── student-table.tsx         # Student result table with search & filters
│   ├── stats-cards.tsx           # Summary stat cards
│   ├── class-tabs.tsx            # Class level tab switcher (9th–12th)
│   ├── header.tsx                # App header
│   └── back-button.tsx           # Navigation back button
│
└── lib/
    ├── models/
    │   ├── Student.ts            # Mongoose student model (multi-collection)
    │   ├── TenthInstitution.ts   # 10th class institution aggregate model
    │   └── TwelfthInstitution.ts # 12th class institution aggregate model
    ├── mongodb.ts                # MongoDB connection helper
    ├── types.ts                  # Shared TypeScript types & interfaces
    └── utils.ts                  # Utility functions (cn, etc.)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- A running **MongoDB** instance (local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/faizullahbalti29/analyze-result.git
cd analyze-result
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/results-analyzer

# Or MongoDB Atlas
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/results-analyzer
```

### 4. Seed the Database

The project expects result data to be imported into the `results-analyzer` MongoDB database across the following collections:

| Collection | Class |
|------------|-------|
| `nineth`   | 9th   |
| `tenth`    | 10th  |
| `eleventh` | 11th  |
| `twelfth`  | 12th  |

The root-level `.json` data files can be imported using `mongoimport`:

```bash
mongoimport --db results-analyzer --collection nineth --file results-analyzer.nineth.json --jsonArray
mongoimport --db results-analyzer --collection tenth  --file results-analyzer.tenth.json  --jsonArray
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Command         | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start the development server         |
| `npm run build` | Build the production bundle          |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run ESLint                           |

---

## 🗄 Database Collections

### `nineth` / `tenth` / `eleventh` / `twelfth` — Student Records

Each document represents a single student result:

```ts
{
  roll_no:     string,   // Student roll number
  name:        string,   // Student name
  status:      string,   // "PASS" | "COMP" | "FAIL" | "ABSENT" | "WITHHELD"
  marks:       number,   // Total marks obtained
  grade:       string,   // Grade awarded (A1, A, B, C, D, E)
  remarks:     string,   // Any board remarks
  institution: string    // School/college name
}
```

### `tenthinstitutions` / `twelfthinstitutions` — Aggregated Institution Stats

Pre-aggregated documents with pass %, GPA, and grade breakdowns per subject group (Science, Humanities, etc.).

---

## 🌐 API Endpoints

| Method | Endpoint                                       | Description                                    |
|--------|------------------------------------------------|------------------------------------------------|
| GET    | `/api/institutions?class=10th&q=abc`           | Fuzzy-search institutions for a class level    |
| GET    | `/api/students?class=10th&institution=XYZ`     | Fetch students for an institution              |
| GET    | `/api/export-excel?class=10th&institution=XYZ` | Download results as an Excel file              |
| GET    | `/api/tenth-institutions`                      | Aggregated stats for 10th class institutions   |
| GET    | `/api/twelfth-institutions`                    | Aggregated stats for 12th class institutions   |

---

## 📄 License

This project is private. All rights reserved.
