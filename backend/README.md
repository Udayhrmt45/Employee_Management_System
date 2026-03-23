# HR SaaS Backend

Production-grade Node.js backend scaffold for a multi-tenant HR SaaS application built with Express, PostgreSQL, Redis, Clerk, and Razorpay.

## Folder Structure

```text
src/
  config/
  controllers/
  services/
  repositories/
  routes/
  middleware/
  models/
  utils/
  validations/
  jobs/
```

## Getting Started

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm install`.
3. Create the PostgreSQL schema from `src/models/schema.sql` or `../hr_saas_pgSql.sql`.
4. Start the server with `npm run dev`.

## Attendance Time Settings

Late-arrival dashboard metrics use backend environment configuration:

- `ATTENDANCE_TIMEZONE`: timezone used when evaluating check-in lateness
- `ATTENDANCE_LATE_ARRIVAL_CUTOFF`: cutoff time in `HH:mm:ss` format

If these are not set, the backend defaults to `UTC` and `09:00:00`.
Attendance timestamps are interpreted as UTC before being converted to the configured attendance timezone for late-arrival calculations.

## Example APIs

### Create employee

`POST /api/v1/employees`

```json
{
  "firstName": "Asha",
  "lastName": "Kulkarni",
  "email": "asha@example.com",
  "role": "Software Engineer",
  "department": "Engineering",
  "joinDate": "2026-03-10"
}
```

### Check in attendance

`POST /api/v1/attendance/check-in`

```json
{
  "employeeId": 1,
  "workDate": "2026-03-10",
  "checkInTime": "2026-03-10T09:15:00.000Z",
  "status": "present"
}
```
