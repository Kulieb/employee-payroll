# Employee management and payroll

React/TypeScript frontend and NestJS/TypeScript API with employee CRUD, JWT roles, monthly payroll, and saved payslips. HR manages employees and calculates salaries; employees view their own payslips. Authorization is enforced on the server.

## Local setup

Use Node.js 22.12 or later in the 22.x release line, npm, and Git.

Copy `api/.env.example` to `api/.env` and `ui/.env.example` to `ui/.env`. Set a random `JWT_SECRET`, your chosen `HR_EMAIL`, and an `HR_PASSWORD` of at least 12 characters. Replace example credentials before deployment. Keep local URLs and ports from the examples.

```sh
npm run setup
npm start
```

Run these commands from the repository root. `npm run setup` installs both projects, generates the Prisma client, and applies migrations to the local database. Afterward, `npm start` builds and starts both projects. Open http://localhost:3001. API: http://localhost:3000; Swagger: http://localhost:3000/docs. Ctrl+C stops both. Vite preview serves the built frontend locally.

First startup creates an HR account using the API environment credentials and hashes its password. Log in with those credentials, then create employees through the UI, including their initial passwords. No sample employees or payslips are seeded. An existing account with `HR_EMAIL` is left unchanged: environment edits do not rotate its password. Keep that email stable after provisioning. No password-reset flow exists yet.

## Configuration

| API variable | Purpose |
| --- | --- |
| DATABASE_URL | Local `file:./dev.db`; Railway `file:/data/app.db` |
| JWT_SECRET | Private token-signing secret |
| JWT_EXPIRES_IN | Token lifetime, default `1h` |
| CORS_ORIGINS | Comma-separated frontend origins including scheme/port, without trailing slashes |
| PORT | Default 3000; supplied by Railway in production |
| HR_EMAIL | Initial HR account email |
| HR_PASSWORD | Initial password; required when creating the account, at least 12 characters |

The UI's `VITE_API_URL` is the public API base URL, embedded at build time. Never put secrets in frontend variables. Commit examples, lockfiles, schema, and migrations; ignore environment files, databases, generated clients, and builds.

## Architecture and dependency choices

NestJS feature modules separate authentication, employees, and payroll. Controllers handle HTTP input, DTOs validate it, and services coordinate operations. Employee and payslip repository interfaces have Prisma implementations and can be replaced by test mocks. Authentication currently accesses Prisma directly. A global filter returns consistent Problem Details errors; Swagger documents the API.

The payroll calculator in `api/src/payroll/domain` has no framework or database dependency. A separate configuration object supplies allowances, tax brackets, and insurance settings so core rules can be tested independently.

Prisma provides typed database access and migrations. SQLite keeps installation simple. JWT and bcrypt handle authentication and password hashing. React supplies the UI, MUI consistent components, React Router navigation/role guards, TanStack Query server state, Axios HTTP, and Yup form validation. Jest runs isolated unit tests.

## Payroll assumptions

- Money inputs and stored amounts use integer Egyptian pounds; fractional salaries are rejected. Rates use thousandths. This is an assessment model, not statutory payroll guidance.
- Monthly allowances: transport 500 and housing 1,000 pounds. The calculator supports zero allowances.
- Annual taxable income is monthly gross multiplied by 12. Progressive annual brackets: 0% up to 40,000; 10% up to 55,000; 15% up to 70,000; 20% up to 200,000; 22.5% up to 400,000; 25% above that. Each rate applies only to its portion.
- Monthly tax is annual tax divided by 12. Insurance is 11% of base salary clamped to an insurable wage of 2,700–16,700 pounds.
- Tax and insurance are each rounded upward to the next multiple of 10 pounds, leaving exact multiples unchanged. Intermediate rounding first uses thousandths. Net is gross minus these deductions; other deductions are zero.
- Inactive employees cannot receive new calculations. Duplicate employee/month/year calculations are rejected. Saved payslips are snapshots; later salary/configuration edits do not recalculate them.
- Payslips record creation time and creator. Dates are displayed locally. Employee deletion cascades to their payslips; deletion of a creator clears the creator relation on retained payslips.
- Change rules in `api/src/payroll/domain/payroll.config.ts` and rebuild.

## Validation and verification

API validation covers required text, name length, email, positive whole-pound salary, status, hire dates, and employee passwords. Text is trimmed, explicit null updates rejected, and emails uniquely constrained in the database. UI forms also validate.

```sh
npm --prefix api test -- --runInBand
npm --prefix ui run lint
npm run build
```

Unit tests use mocks and require no real database or network. Coverage includes payroll boundaries, rounding, invalid inputs/configuration, inactive employees, and employee validation. Starter e2e setup is not the primary verification suite.

## Railway backend

Prisma is the backend's database-access and migration tool, not the host for this SQLite database. No Prisma account or database upload is needed. Railway stores the database file on its volume. A fresh deployment starts without local employee data and provisions only the configured HR account.

Connect the GitHub repository, choose branch `main`, and root directory `/api`.

| Setting | Value |
| --- | --- |
| Build command | `npm run prisma:generate && npm run build` |
| Start command | `npm run start:railway` |
| Persistent volume mount | `/data` |
| Replicas | 1 |

Set `NODE_ENV=production`, `DATABASE_URL=file:/data/app.db`, a strong `JWT_SECRET`, `JWT_EXPIRES_IN=1h`, initial `HR_EMAIL`/`HR_PASSWORD`, and `CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app`. Let Railway supply `PORT`; the app listens on `0.0.0.0`. Generate a public backend domain.

The Prisma CLI is a runtime dependency because it runs migrations at startup. `api/railway.json` records the build/start commands; for a monorepo, select `/api/railway.json` as the Railway config-file path if it is not detected automatically. Select Node.js 22.x on Vercel; the API package also specifies Node.js 22.x. The start script applies checked-in pending migrations before launching the API. On an empty volume it creates the tables; subsequent deployments preserve data. Never run `migrate reset` against production.

Run SQLite migrations at startup: Railway volumes are unavailable during builds and pre-deploy commands. Keep the volume and arrange backups before storing important data. See [volumes](https://docs.railway.com/volumes) and [pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command).

## Vercel frontend

Import the same repository, production branch `main`, root directory `ui`, framework Vite, build command `npm run build`, output directory `dist`. Set the production variable `VITE_API_URL=https://YOUR-BACKEND.up.railway.app` and deploy.

Vercel serves static assets directly; it does not run the root local start command. `ui/vercel.json` handles deep links. Update Railway's CORS setting to the final frontend origin and redeploy. Changes to `VITE_API_URL` require a frontend rebuild/deployment.

No separate hosted development environment is required. Preview domains need explicit CORS entries if used. Verify Swagger, login, employee CRUD, payroll, employee access, and refreshing a nested route. See [Vercel's Vite guide](https://vercel.com/docs/frameworks/frontend/vite).

## Known limitations and next steps

- Current list pagination/search stays as implemented; server-side pagination/search remains an assessment gap.
- Batch payroll writes are not atomic. Next step: transaction handling and better concurrent duplicate handling.
- SQLite targets a small single-instance deployment; horizontal scaling would require database/adapter/migration changes, for example PostgreSQL.
- No password reset, token revocation, SSO, CI, or comprehensive browser/integration tests yet.
- Some error paths and narrow-screen layouts need refinement. The UI build reports a large bundle warning; API lint has existing warnings.

## AI usage

AI assisted review, implementation, tests, and documentation. See [AI usage](ai-usage/README.md) for the disclosure and conversation link.
