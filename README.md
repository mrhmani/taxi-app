# Taxi Livo Trip Sheet App

[![Google Antigravity AI](https://img.shields.io/badge/Google%20Antigravity%20AI-Gemini%203.1%20Pro-8A2BE2?style=flat-square&logo=google)](https://deepmind.google/)
[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19.x-blue?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Hosting-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![PWA](https://img.shields.io/badge/PWA-Supported-orange?style=flat-square&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

A modern, cloud-hosted web application and Progressive Web App (PWA) developed
for **Taxi Livo**, a taxi company operating in Zeeland, a province in the
southwest of the Netherlands.

This project digitizes the traditional paper-based workflows of taxi drivers,
enabling them to log daily shifts and manage delivery forms seamlessly from any
mobile or desktop device.

---

## Purpose

Traditionally, Taxi Livo drivers completed trip sheets (_rittenstaten_) and
cargo delivery forms (_pakbonnen_) by hand on paper. The **Taxi Livo Trip Sheet
App** transition this manual process into a paperless digital workflow.

Drivers can:

- **Create Digital Trip Sheets:** Record start/end odometer readings, fuel
  replenishment details, and specific shifts.
- **Fill Out Delivery Forms (Packing Slips):** Create digital slips with
  recipient details, trip pricing, cargo locations, vessel names, and client
  signatures.
- **Submit Remotely:** Submissions are processed instantly and stored securely
  in the cloud.
- **Access Anywhere:** Optimized for use in the field via smartphones or tablets
  as an installable PWA.

This digital solution reduces administrative overhead, minimizes paperwork
errors, and supports sustainable operations at Taxi Livo.

---

## Features

- **Digital Trip Sheets (Rittenstaten):** Simple inputs for daily vehicle usage,
  driver details, and shift schedules.
- **Digital Delivery Forms (Pakbonnen):** Collects client details, trip costs,
  and cargo transfer fields.
- **In-App Drawing Canvas:** Allows drivers and clients to sign forms directly
  on screen.
- **Secure Authentication:** Driver registration and secure sign-in managed via
  Supabase.
- **Progressive Web App (PWA):** Installable directly onto mobile devices with
  support for offline capabilities and app-like navigation.
- **Export functionality:** PDF document generation for trip sheets and delivery
  receipts.
- **Automated Emailing:** Supabase Edge Functions send confirmation emails
  automatically.
- **Responsive Layout:** Adaptive design tailored for smartphones, tablets, and
  desktop computers.

---

## Technology Stack

The application is built on a modern, serverless architecture for ease of
maintenance and rapid deployments.

- **AI Assistant:** Google Antigravity AI Agent powered by Gemini 3.1 Pro.
- **Frontend Framework:** React (v19) with Vite as the build tool.
- **Runtime Environment:** Node.js.
- **Package Manager:** npm.
- **Backend Database & Services:** Supabase.
  - **Database:** PostgreSQL (with Row-Level Security policies).
  - **Authentication:** Supabase Authentication.
  - **Edge Functions:** Deno runtime for serverless logic (e.g. sending emails).
- **Hosting & Deployment:** Vercel.
  - The project features continuous integration and is automatically deployed to
    Vercel upon pushes to the GitHub repository.

### Deployment URL

The live production application can be accessed at: 👉
**[taxi-app-puce.vercel.app](https://taxi-app-puce.vercel.app)**

---

## Project Structure

A high-level view of the project's codebase layout:

```text
├── docs/                      # Architectural decisions, schema design, and git guidelines
│   ├── supabase-schema.md     # PostgreSQL tables and relationship descriptions
│   └── git-workflow-branching-strategy (English).md
├── supabase/                  # Supabase local configurations and edge functions
│   └── functions/
│       └── send-email/        # Edge function to automate email delivery of reports
├── public/                    # Static assets (PWA manifest, icons, and logos)
└── src/                       # Application source code
    ├── components/            # React UI components and their corresponding stylesheets
    │   ├── ActionDialog.jsx   # Context-aware action confirmation dialog
    │   ├── Login.jsx          # Secure driver login interface
    │   ├── MyTripLogs.jsx     # Driver dashboard showing previous trips
    │   ├── Navigation.jsx     # Main navigation header
    │   ├── RittenstaatForm.jsx# Dynamic multi-step trip sheet form
    │   └── SignatureDialog.jsx# Canvas drawing component for signature collection
    ├── utils/                 # General utility scripts
    │   └── pdfGenerator.jsx   # Client-side PDF generation for trip logs
    ├── supabase.js            # Initialized Supabase client instance
    ├── index.css              # Global styling variables and typography configurations
    └── main.jsx               # Application bootstrap mount point
```

For detailed documentation on the database schemas, refer to the
[Supabase Schema Documentation](docs/supabase-schema.md).

---

## Local Development

Follow these steps to run the project locally on your machine.

### Prerequisites

- **Node.js** (v20 or higher recommended)
- **npm** (v10 or higher)

### Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/taxi-app.git
   cd taxi-app
   ```

2. **Configure Environment Variables:** Create a `.env` file in the root
   directory and specify your Supabase configurations:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Available Scripts:**

   - **Run Development Server:**
     ```bash
     npm run dev
     ```
     Starts the Vite local development server. Open
     [http://localhost:5173](http://localhost:5173) in your browser.

   - **Build for Production:**
     ```bash
     npm run build
     ```
     Compiles and optimizes the React application assets into the `/dist`
     directory.

   - **Preview Production Build locally:**
     ```bash
     npm run preview
     ```
     Serves the built application locally for manual quality checks.

   - **Network Preview (PWA Testing):**
     ```bash
     npm run preview -- --host
     ```
     Serves the build on your local network. This is the recommended way to test
     the PWA installation flow on physical mobile devices connected to the same
     Wi-Fi.

### Using a Local Database (Alternative)

Yes, it is absolutely possible to use a local database instead of the live
Supabase cloud service. However, because this is a client-side React app that
queries the database directly using the `@supabase/supabase-js` client, there
are three primary ways a developer can achieve this:

#### Option 1: Supabase Local Development (Recommended & Easiest)

Since Supabase is open-source and built on top of PostgreSQL, they provide a
local development environment that runs on Docker.

This option allows developers to run a local PostgreSQL database along with
local mock versions of Supabase services (Auth, Storage, and PostgREST API) on
their own machine. No changes to the frontend React code are required.

**How a developer sets it up:**

1. Install Docker Desktop on their local machine.
2. Initialize Supabase CLI in the project directory:
   ```bash
   npx supabase init
   ```
3. Start the local stack:
   ```bash
   npx supabase start
   ```
   _This will download and run Docker containers containing PostgreSQL, Auth
   (GoTrue), and the API Gateway._
4. Update the local environment variables in the `.env` file to point to the
   local instance (e.g., `http://127.0.0.1:54321` and the local anon key).
5. Run the migrations/seed files to populate the local PostgreSQL database:
   ```bash
   npx supabase db push
   ```

#### Option 2: Replacing Supabase Entirely with a Raw Postgres DB

If a developer wants to use standard, direct PostgreSQL (e.g., via PGAdmin,
Drizzle ORM, Prisma, or a standard connection string) and bypass Supabase
completely, they cannot do it directly from the browser code.

**Why?** Browsers cannot make direct TCP connections to a standard PostgreSQL
port (typically `5432`) due to security restrictions and protocol
incompatibility. Sharing database credentials (username/password) directly in
frontend code is also a security vulnerability.

To do this, the developer would need to:

1. Create a backend API server (e.g., Node.js/Express, Python/FastAPI, Go, or
   Next.js API Routes).
2. Use a PostgreSQL driver or ORM (like `pg`, Prisma, or Drizzle) inside that
   backend to query the local database.
3. Refactor the frontend to fetch data from their backend API server (e.g. using
   `fetch()` or `axios`) instead of using the `supabase` client library.

#### Option 3: Mocking for Local Testing

If the goal is simply writing unit/integration tests without needing a running
database at all, a developer can mock the Supabase client inside their test
suites (e.g. using Vitest or Jest) to return mock data:

```javascript
// Example test mock
vi.mock("./src/supabase.js", () => ({
  supabase: {
    from: () => ({
      select: () =>
        Promise.resolve({ data: [{ id: 1, name: "Mock Taxi" }], error: null }),
    }),
  },
}));
```

---

## Progressive Web App (PWA)

The application uses `vite-plugin-pwa` to act as an installable Progressive Web
App.

### How to Install on Mobile Devices

1. Navigate to the application URL in a supported mobile browser (such as Safari
   on iOS or Google Chrome on Android).
2. Open the browser's menu options (e.g., the Share button on iOS or the
   triple-dot menu on Android).
3. Select **Add to Home Screen** (or tap **Install App** if prompted by the
   browser banner).
4. Launch the application directly from your device home screen for a
   fullscreen, app-like experience.

### Local PWA Testing

To test the PWA behavior during development:

1. Run the local preview command: `npm run preview -- --host`
2. Connect your mobile device to the same local network (Wi-Fi) as your
   development machine.
3. Access the application using your machine's local IP address displayed in the
   terminal.
4. Follow the installation steps above.

---

## Contributing

We welcome contributions to improve the application. Please follow the standard
workflow:

1. **Fork the Repository** to your own GitHub account.
2. **Create a Feature Branch** off the `develop` branch following our
   [Git Workflow Guidelines](docs/git-workflow-branching-strategy%20(English).md).
3. **Commit your Changes** using clear and descriptive commit messages.
4. **Push to your Branch** and submit a **Pull Request (PR)** targeting the
   `develop` branch.

### Workflow Rules & Review Process

- **Develop Branch First:** All contributions and new changes must go to the
  `develop` branch first.
- **Pull Request (PR):** When making a contribution, you must create a Pull
  Request targeting the `develop` branch.
- **Merge Process:** After the Pull Request is reviewed, the author of the
  branch is responsible for merging it into the `develop` branch.
- **Production Release:** Only after successful approval and integration into
  `develop` will the changes be pushed to the `master` branch.
- Currently, code review is conducted by the project creator
  (`Admins of Taxi Livo`).
- In the future, administrators and maintainers from Taxi Livo will also
  participate in the contribution review process.

---

## Acknowledgements

We would like to express our gratitude to **Taxi Livo** for their cooperation
and for providing the opportunity to develop this digital solution to improve
operational workflows.

---

<div align="center">
  <img src="docs/login.png" width="24%" alt="Login Page">
  <img src="docs/form.png" width="24%" alt="Form">
  <img src="docs/pakbon.png" width="24%" alt="Pakbon">
  <img src="docs/trip-log.png" width="24%" alt="Trip Log Page">
</div>
