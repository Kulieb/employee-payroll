# Employee management and payroll

React/TypeScript frontend and NestJS/TypeScript API with employee CRUD, JWT roles, monthly payroll, and saved payslips. HR manages employees and calculates salaries; employees view their own payslips. Authorization is enforced on the server.

## Demo login

Open the [live application on Vercel](https://employee-payroll-two.vercel.app/).

Use this HR account to try the assessment app:

| Login field | Value               |
| ----------- | ------------------- |
| Email       | `hr@interface.com`  |
| Password    | `PayrollDemo@2026!` |

These credentials are public and intended for demo data only. HR can create employee accounts and provide their email/password to those users. Website visitors do not need environment files or Railway access.

Fresh local installations create this account from the supplied environment example. For the deployed demo, the operator must set the same `HR_EMAIL` and `HR_PASSWORD` values in Railway before the first startup. Publishing credentials in this README does not create the account by itself.

To try the employee flow:

1. Log in as HR with the demo credentials above.
2. Create an employee, entering their email and password in the form.
3. Calculate a salary for that employee and a selected month/year.
4. Log out, then log in using that employee's email and password.
5. On the employee page, select the same month/year and look up the saved payslip.

Only the initial HR account is created automatically. Employee accounts are created by HR; no sample employee account or public signup is provided.

## Local setup

Use Node.js 22.12 or later in the 22.x release line, npm, and Git.

Copy `api/.env.example` to `api/.env` and `ui/.env.example` to `ui/.env`. The API example already contains the demo login above; keep those values to use it. Set a random `JWT_SECRET`. Keep local URLs and ports from the examples. Operators hosting a private installation can replace the demo login with their own credentials.

```sh
npm run setup
npm start
```

Run these commands from the repository root. `npm run setup` installs both projects, generates the Prisma client, and applies migrations to the local database. Afterward, `npm start` builds and starts both projects. Open http://localhost:3001. API: http://localhost:3000; Swagger: http://localhost:3000/docs. Ctrl+C stops both. Vite preview serves the built frontend locally.

First startup creates an HR account using the API environment credentials and hashes its password. Log in with those credentials, then create employees through the UI, including their initial passwords. No sample employees or payslips are seeded. An existing account with `HR_EMAIL` is left unchanged: environment edits do not rotate its password. Keep that email stable after provisioning. No password-reset flow exists yet.

## Configuration

| API variable   | Purpose                                                                          |
| -------------- | -------------------------------------------------------------------------------- |
| DATABASE_URL   | Local `file:./dev.db`; Railway `file:/data/app.db`                               |
| JWT_SECRET     | Private token-signing secret                                                     |
| JWT_EXPIRES_IN | Token lifetime, default `1h`                                                     |
| CORS_ORIGINS   | Comma-separated frontend origins including scheme/port, without trailing slashes |
| PORT           | Default 3000; supplied by Railway in production                                  |
| HR_EMAIL       | Demo login: `hr@interface.com`                                                   |
| HR_PASSWORD    | Demo password: `PayrollDemo@2026!`; private installations can override it        |

The UI's `VITE_API_URL` is the public API base URL, embedded at build time. Never put secrets in frontend variables. Commit examples, lockfiles, schema, and migrations; ignore environment files, databases, generated clients, and builds.

## Architecture and dependency choices

NestJS feature modules separate authentication, employees, and payroll. Controllers handle HTTP input, DTOs validate it, and services coordinate operations. Employee and payslip repository interfaces have Prisma implementations and can be replaced by test mocks. Authentication currently accesses Prisma directly. A global filter returns consistent Problem Details errors; Swagger documents the API.

The payroll calculator in `api/src/payroll/domain` has no framework or database dependency. A separate configuration object supplies allowances, tax brackets, and insurance settings so core rules can be tested independently.

Prisma provides typed database access and migrations. SQLite keeps installation simple. JWT and bcrypt handle authentication and password hashing. React supplies the UI, MUI consistent components, React Router navigation/role guards, TanStack Query server state, Axios HTTP, and Yup form validation. Jest runs isolated unit tests.

## Payroll assumptions

- Money inputs and stored amounts use integer Egyptian pounds; fractional salaries are rejected. Rates use thousandths. This is an assessment model, not statutory payroll guidance.
- Monthly allowances: transport 500 and housing 1,000 pounds. The calculator supports zero allowances.
- Annual taxable income is monthly gross multiplied by 12, without subtracting insurance or applying personal exemptions. Progressive annual brackets: 0% up to 40,000; 10% up to 55,000; 15% up to 70,000; 20% up to 200,000; 22.5% up to 400,000; 25% above that. Each rate applies only to its portion.
- An exact upper boundary belongs to the bracket ending at that amount. At annual gross of 400,000 pounds, the portion from 200,000 to 400,000 is taxed at 22.5%, and nothing is taxed at 25%. Total annual tax is 74,750 pounds. At 400,001 pounds, only the extra pound is taxed at 25%, making annual tax 74,750.25 pounds before monthly conversion and rounding.
- Monthly tax is annual tax divided by 12. Insurance is 11% of base salary clamped to an insurable wage of 2,700–16,700 pounds.
- Tax and insurance are each rounded upward to the next multiple of 10 pounds, leaving exact multiples unchanged. Intermediate rounding first uses thousandths. Net is gross minus these deductions; other deductions are zero.
- Each calculation uses a full month's current base salary and fixed allowances. The selected month/year labels the saved payslip; hire dates, attendance, partial months, and historical salary changes do not affect the calculation.
- There is no minimum net-pay floor. For a very low salary, minimum insurance can exceed gross pay and produce a negative net amount; the calculator returns that result.
- Inactive employees cannot receive new calculations. Duplicate employee/month/year calculations are rejected. Saved payslips are snapshots; later salary/configuration edits do not recalculate them.
- Selected employees' payslips are saved in one database transaction: all are saved, or none are. A concurrent duplicate is rejected with HTTP 409 and rolls back the entire batch.
- Bulk calculation fetches the selected employees together, validates the batch, and inserts payslips with Prisma's bulk-create operation inside that transaction. Duplicate IDs are calculated once; results follow the requested employee order.
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

## GitHub Actions CI

[CI workflow](.github/workflows/ci.yml) runs on pushes to `main`, pull requests targeting `main`, and manual runs. It uses Node.js 22 on an Ubuntu runner, installs both projects from their lockfiles, generates the Prisma client, runs isolated backend unit tests and frontend lint, and builds both projects.

No repository secrets, running database, or deployed API are required. The workflow's database URL is only used to generate the Prisma client; no database migrations or application startup run in CI. Its frontend URL is a build-time placeholder, and the generated build is not deployed.

After pushing the workflow, open the repository's **Actions** tab, select **CI**, and inspect each step's result. To run it manually, select **Run workflow** on `main`. The test, lint, and build commands above reproduce the checks locally after setup. Railway and Vercel continue deploying through their existing Git integrations; CI reports results without making those deployments wait for the checks.

## Railway backend

`GET /health` is public and performs a read-only database query. A successful check returns HTTP 200 with `{"status":"ok","database":"up"}`. Database errors return HTTP 503 in the standard Problem Details format without database details. Locally, open http://localhost:3000/health; the deployed endpoint is https://employee-payroll-production.up.railway.app/health.

Railway's configuration uses `/health` to check readiness before activating a deployment. This is a deployment check, not continuous uptime monitoring. A successful query confirms database connectivity, not the correctness of payroll data or every application feature.

Prisma is the backend's database-access and migration tool, not the host for this SQLite database. No Prisma account or database upload is needed. Railway stores the database file on its volume. A fresh deployment starts without local employee data and provisions only the configured HR account.

Connect the GitHub repository, choose branch `main`, and root directory `/api`.

| Setting                 | Value                                      |
| ----------------------- | ------------------------------------------ |
| Build command           | `npm run prisma:generate && npm run build` |
| Start command           | `npm run start:railway`                    |
| Persistent volume mount | `/data`                                    |
| Replicas                | 1                                          |

Set `NODE_ENV=production`, `DATABASE_URL=file:/data/app.db`, a strong `JWT_SECRET`, `JWT_EXPIRES_IN=1h`, and `CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app`. For the published assessment demo, set these exact initial login values in Railway:

```env
HR_EMAIL=hr@interface.com
HR_PASSWORD=PayrollDemo@2026!
```

This is a one-time operator setup; users log in directly with the README credentials. Keep the private signing secret separate from the public demo password. Let Railway supply `PORT`; the app listens on `0.0.0.0`. Generate a public backend domain.

The Prisma CLI is a runtime dependency because it runs migrations at startup. `api/railway.json` records the build/start commands; for a monorepo, select `/api/railway.json` as the Railway config-file path if it is not detected automatically. Select Node.js 22.x on Vercel; the API package also specifies Node.js 22.x. The start script applies checked-in pending migrations before launching the API. On an empty volume it creates the tables; subsequent deployments preserve data. Never run `migrate reset` against production.

Run SQLite migrations at startup: Railway volumes are unavailable during builds and pre-deploy commands. Keep the volume and arrange backups before storing important data. See [volumes](https://docs.railway.com/volumes) and [pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command).

## Vercel frontend

Import the same repository, production branch `main`, root directory `ui`, framework Vite, build command `npm run build`, output directory `dist`. Set the production variable `VITE_API_URL=https://YOUR-BACKEND.up.railway.app` and deploy.

Vercel serves static assets directly; it does not run the root local start command. `ui/vercel.json` handles deep links. Update Railway's CORS setting to the final frontend origin and redeploy. Changes to `VITE_API_URL` require a frontend rebuild/deployment.

No separate hosted development environment is required. Preview domains need explicit CORS entries if used. Verify Swagger, login, employee CRUD, payroll, employee access, and refreshing a nested route. See [Vercel's Vite guide](https://vercel.com/docs/frameworks/frontend/vite).

## Known limitations and next steps

- Employee search and sorting are currently handled on the UI side over the loaded list. Next step: add server-side pagination, filtering, and sorting so the API returns only the requested page of matching employees in the chosen order. Include status, hire-date range, and salary-range filters to support larger employee lists.
- Docker and Docker Compose are not included yet. Next step: package the API and frontend in containers and provide a Compose file to start both together, with a persistent volume for SQLite. This would give reviewers a consistent local runtime without installing Node.js or project dependencies on their machine, and simplify startup to `docker compose up --build` after environment configuration. The current Railway/Vercel deployment does not require this setup.
- SQLite targets a small single-instance deployment; horizontal scaling would require database/adapter/migration changes, for example PostgreSQL.
- No password reset, token revocation, SSO, or comprehensive browser/integration tests yet.
- Some error paths and narrow-screen layouts need refinement. The UI build reports a large bundle warning; API lint has existing warnings.

## AI usage

AI assisted review, implementation, tests, and documentation. See [AI usage](ai-usage/README.md) for the disclosure and conversation link.
