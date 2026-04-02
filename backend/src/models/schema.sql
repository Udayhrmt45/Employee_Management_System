CREATE TYPE plan_type_enum AS ENUM ('FREE','STARTER','GROWTH');
CREATE TYPE user_role_enum AS ENUM ('ADMIN','EMPLOYEE','SUPER_ADMIN','OWNER');
CREATE TYPE employment_type_enum AS ENUM ('FULL_TIME','PART_TIME','CONTRACT');
CREATE TYPE employee_status_enum AS ENUM ('ACTIVE','INACTIVE');
CREATE TYPE attendance_status_enum AS ENUM ('PRESENT','ABSENT','HALF_DAY');
CREATE TYPE leave_status_enum AS ENUM ('PENDING','APPROVED','REJECTED');
CREATE TYPE payment_plan_enum AS ENUM ('FREE','STARTER','GROWTH');
CREATE TYPE payment_status_enum AS ENUM ('CREATED','PAID','FAILED','REFUNDED');
CREATE TYPE notification_scope_enum AS ENUM ('PLATFORM','COMPANY');
CREATE TYPE notification_target_type_enum AS ENUM ('ALL_USERS','ALL_OWNERS','COMPANY_ALL','COMPANY_ADMINS','SELECTED_OWNERS');

CREATE TABLE companies (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  plan_type plan_type_enum DEFAULT 'FREE',
  is_active BOOLEAN DEFAULT TRUE,
  razorpay_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_plan ON companies(plan_type);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  company_id BIGINT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role user_role_enum DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE departments (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_departments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_departments_company ON departments(company_id);

CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  user_id BIGINT,
  employee_code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  department_id BIGINT,
  designation VARCHAR(100),
  joining_date DATE,
  employment_type employment_type_enum DEFAULT 'FULL_TIME',
  status employee_status_enum DEFAULT 'ACTIVE',
  manager_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_employees_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_employees_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_department ON employees(department_id);

CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  employee_id BIGINT NOT NULL,
  date DATE NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  total_hours DECIMAL(5,2),
  status attendance_status_enum DEFAULT 'PRESENT',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE (employee_id, date)
);

CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_company ON attendance(company_id);
CREATE INDEX idx_attendance_date ON attendance(date);

CREATE TABLE leave_types (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  max_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_leave_types_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_leave_types_company ON leave_types(company_id);

CREATE TABLE leave_balances (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  leave_type_id BIGINT NOT NULL,
  balance INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_leave_balances_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_leave_balances_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  UNIQUE (employee_id, leave_type_id)
);

CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id);

CREATE TABLE leave_requests (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  employee_id BIGINT NOT NULL,
  leave_type_id BIGINT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status leave_status_enum DEFAULT 'PENDING',
  approved_by BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_leave_requests_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_leave_requests_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  CONSTRAINT fk_leave_requests_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_leave_requests_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_company ON leave_requests(company_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  razorpay_payment_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'INR',
  plan payment_plan_enum,
  status payment_status_enum DEFAULT 'CREATED',
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_payments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_company ON payments(company_id);

CREATE TABLE company_settings (
  company_id BIGINT PRIMARY KEY,
  support_email VARCHAR(255),
  website VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_company_settings_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sender_id BIGINT NOT NULL,
  sender_role user_role_enum NOT NULL,
  scope notification_scope_enum NOT NULL,
  company_id BIGINT,
  target_type notification_target_type_enum NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_sender ON notifications(sender_id);
CREATE INDEX idx_notifications_company ON notifications(company_id);
CREATE INDEX idx_notifications_scope_target ON notifications(scope, target_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE TABLE notification_recipients (
  id BIGSERIAL PRIMARY KEY,
  notification_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  CONSTRAINT fk_notification_recipients_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_recipients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (notification_id, user_id)
);

CREATE INDEX idx_notification_recipients_user ON notification_recipients(user_id, is_read);
CREATE INDEX idx_notification_recipients_notification ON notification_recipients(notification_id);
