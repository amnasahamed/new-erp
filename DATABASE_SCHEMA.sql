-- Claps Learn ERP - Database Schema
-- PostgreSQL Database Schema
-- Version: 1.0
-- Date: October 30, 2025

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'coordinator', 'teacher', 'parent', 'hr', 'accountant');
CREATE TYPE department_code AS ENUM ('AA', 'BB', 'CC', 'DD', 'EE');
CREATE TYPE student_status AS ENUM ('demo', 'ongoing', 'paused', 'stopped');
CREATE TYPE teacher_status AS ENUM ('pending', 'interviewed', 'approved', 'active');
CREATE TYPE class_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled', 'disputed');
CREATE TYPE billing_status AS ENUM ('pending', 'billed', 'disputed');
CREATE TYPE dispute_status AS ENUM ('open', 'resolved', 'escalated');
CREATE TYPE demo_status AS ENUM ('pending', 'assigned', 'completed');
CREATE TYPE demo_outcome AS ENUM ('registered', 'not_interested', 'follow_up');
CREATE TYPE payment_origin AS ENUM ('domestic', 'international');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code department_code UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(20), -- Department WhatsApp number for notifications
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., ADM001, CRD001, TCH001, PAR001
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Hashed password (should be DOB: DD-MM-YYYY)
    role user_role NOT NULL,
    department_id UUID REFERENCES departments(id),
    phone VARCHAR(20),
    whatsapp VARCHAR(20), -- WhatsApp number for notifications
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Coordinator must have department
    CONSTRAINT coordinator_must_have_dept CHECK (
        role != 'coordinator' OR department_id IS NOT NULL
    )
);

-- Students Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., STU001
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id) NOT NULL,
    parent_id UUID REFERENCES users(id) NOT NULL, -- Foreign key to parent user
    balance DECIMAL(10, 2) DEFAULT 0, -- Current balance in ₹
    balance_hours DECIMAL(5, 2) DEFAULT 0, -- Remaining hours
    status student_status DEFAULT 'demo',
    class_syllabus VARCHAR(100), -- e.g., CBSE Class 10, ICSE Class 9
    gmeet_link TEXT, -- Static GMeet link assigned to student
    parent_whatsapp VARCHAR(20), -- Parent WhatsApp for notifications
    demo_completed_date DATE,
    first_class_date DATE,
    feedback_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers Table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., TCH001
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    syllabus TEXT,
    medium VARCHAR(50), -- English, Malayalam, etc.
    rating DECIMAL(3, 2), -- Average rating (0-5)
    conversion_ratio DECIMAL(5, 2), -- Demo to conversion ratio %
    hourly_salary DECIMAL(10, 2) NOT NULL,
    status teacher_status DEFAULT 'pending',
    phone VARCHAR(20),
    teaching_style TEXT, -- Free-text field for teaching style notes
    gadgets TEXT, -- Equipment owned
    internet_type VARCHAR(50), -- Broadband, 4G, etc.
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Demo Requests Table
CREATE TABLE demo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_name VARCHAR(100) NOT NULL,
    student_name VARCHAR(100),
    parent_id UUID REFERENCES users(id),
    student_id UUID REFERENCES students(id), -- Null until student created
    preferred_time TIMESTAMP WITH TIME ZONE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    status demo_status DEFAULT 'pending',
    teacher_id UUID REFERENCES teachers(id), -- Assigned teacher
    gmeet_link TEXT, -- GMeet link for demo
    outcome demo_outcome,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Business rule: Only one active demo per student at a time
    CONSTRAINT one_active_demo_per_student UNIQUE (student_id, status)
        WHERE status IN ('pending', 'assigned')
);

-- Timetable Table (supports both recurring and one-time classes)
CREATE TABLE timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) NOT NULL,
    teacher_id UUID REFERENCES teachers(id) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    day_of_week INTEGER, -- 0-6, Sunday = 0 (for recurring)
    specific_date DATE, -- For one-time classes
    time TIME NOT NULL,
    duration INTEGER NOT NULL, -- Duration in minutes
    recurring BOOLEAN DEFAULT TRUE,
    gmeet_link TEXT, -- Can override student's default link
    is_active BOOLEAN DEFAULT TRUE, -- For pausing/resuming
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Either day_of_week (recurring) or specific_date (one-time) must be set
    CONSTRAINT recurring_or_specific CHECK (
        (recurring = TRUE AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
        (recurring = FALSE AND specific_date IS NOT NULL)
    )
);

-- Classes/Sessions Table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    time TIME NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_id UUID REFERENCES teachers(id) NOT NULL,
    student_id UUID REFERENCES students(id) NOT NULL,
    duration INTEGER NOT NULL, -- Duration in minutes
    gmeet_link TEXT NOT NULL,
    status class_status DEFAULT 'upcoming',
    attendance_marked BOOLEAN DEFAULT FALSE,
    marked_at TIMESTAMP WITH TIME ZONE, -- When attendance was marked
    billing_status billing_status DEFAULT 'pending', -- Billing status for 24h grace period
    topic TEXT, -- Topic covered in class
    homework TEXT, -- Homework assigned
    teacher_joined BOOLEAN,
    student_joined BOOLEAN,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disputes Table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) NOT NULL,
    class_id UUID REFERENCES classes(id) NOT NULL,
    class_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status dispute_status DEFAULT 'open',
    teacher_response TEXT,
    resolution_notes TEXT,
    final_adjustment_hours DECIMAL(5, 2), -- Hours to credit back
    resolved_by UUID REFERENCES users(id), -- Coordinator who resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Account Ledger Table
CREATE TABLE account_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    student_id UUID REFERENCES students(id) NOT NULL,
    particulars VARCHAR(255) NOT NULL,
    credit DECIMAL(10, 2) DEFAULT 0, -- Money in
    debit DECIMAL(10, 2) DEFAULT 0, -- Money out
    balance DECIMAL(10, 2) NOT NULL, -- Balance after this transaction
    invoice_no VARCHAR(50),
    narration TEXT NOT NULL, -- Required for audit
    payment_origin payment_origin,
    created_by UUID REFERENCES users(id), -- Who made the entry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Either credit or debit must be non-zero
    CONSTRAINT credit_or_debit CHECK (credit > 0 OR debit > 0)
);

-- Salary Records Table
CREATE TABLE salary_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) NOT NULL,
    month DATE NOT NULL, -- First day of the month
    hours_taught DECIMAL(5, 2) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    gst DECIMAL(10, 2) NOT NULL, -- 18% GST
    net_salary DECIMAL(10, 2) NOT NULL, -- gross + gst
    paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (teacher_id, month)
);

-- Teacher Availability Table
CREATE TABLE teacher_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0-6, Sunday = 0
    time_slot VARCHAR(20) NOT NULL, -- e.g., "10:00 AM", "2:00 PM"
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (teacher_id, day_of_week, time_slot)
);

-- Feedback Table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) NOT NULL,
    teacher_id UUID REFERENCES teachers(id) NOT NULL,
    class_id UUID REFERENCES classes(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exams Table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    score DECIMAL(5, 2),
    max_score DECIMAL(5, 2) NOT NULL,
    teacher_comments TEXT,
    logged_by UUID REFERENCES teachers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
    message TEXT NOT NULL,
    action_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table (for compliance - 8 years retention)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_by_name VARCHAR(100),
    changed_by_role user_role,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);

-- Students
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_students_balance ON students(balance);

-- Teachers
CREATE INDEX idx_teachers_status ON teachers(status);
CREATE INDEX idx_teachers_available ON teachers(is_available);

-- Classes
CREATE INDEX idx_classes_date ON classes(date);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_student ON classes(student_id);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_classes_billing_status ON classes(billing_status);
CREATE INDEX idx_classes_marked_at ON classes(marked_at);

-- Disputes
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_student ON disputes(student_id);
CREATE INDEX idx_disputes_created_at ON disputes(created_at);

-- Ledger
CREATE INDEX idx_ledger_student ON account_ledger(student_id);
CREATE INDEX idx_ledger_date ON account_ledger(date);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Audit Log
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- =====================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Function to log changes
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), current_setting('app.current_user_id', TRUE)::UUID);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id', TRUE)::UUID);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), current_setting('app.current_user_id', TRUE)::UUID);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_students AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_classes AFTER INSERT OR UPDATE OR DELETE ON classes
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_disputes AFTER INSERT OR UPDATE OR DELETE ON disputes
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_ledger AFTER INSERT OR UPDATE OR DELETE ON account_ledger
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER audit_teachers AFTER INSERT OR UPDATE OR DELETE ON teachers
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_requests_updated_at BEFORE UPDATE ON demo_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timetable_updated_at BEFORE UPDATE ON timetable
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_ledger_updated_at BEFORE UPDATE ON account_ledger
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_ledger ENABLE ROW LEVEL SECURITY;

-- Policy: Coordinators can only see their department's data
CREATE POLICY coordinator_department_access ON students
    FOR ALL
    USING (
        department_id = current_setting('app.current_user_department_id', TRUE)::UUID
        AND current_setting('app.current_user_role', TRUE) = 'coordinator'
    );

-- Policy: Admins can see all data
CREATE POLICY admin_full_access ON students
    FOR ALL
    USING (current_setting('app.current_user_role', TRUE) = 'admin');

-- Policy: Parents can only see their own children
CREATE POLICY parent_own_children ON students
    FOR ALL
    USING (
        parent_id = current_setting('app.current_user_id', TRUE)::UUID
        AND current_setting('app.current_user_role', TRUE) = 'parent'
    );

-- =====================================================
-- SEED DATA (DEPARTMENTS)
-- =====================================================

INSERT INTO departments (code, name, whatsapp_number) VALUES
    ('AA', 'Department AA', '+919876543210'),
    ('BB', 'Department BB', '+919876543211'),
    ('CC', 'Department CC', '+919876543212'),
    ('DD', 'Department DD', '+919876543213'),
    ('EE', 'Department EE', '+919876543214');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE students IS 'Student records with balance tracking and static GMeet links';
COMMENT ON TABLE classes IS 'Class sessions with billing status for 24-hour grace period';
COMMENT ON TABLE account_ledger IS 'Financial ledger with mandatory narration for audit compliance';
COMMENT ON TABLE audit_log IS 'Audit trail for all changes (8-year retention required)';
COMMENT ON COLUMN classes.billing_status IS 'Billing status: pending (waiting 24h), billed (charged), disputed (refund pending)';
COMMENT ON COLUMN classes.marked_at IS 'Timestamp when attendance was marked - used for 24h grace period calculation';
COMMENT ON COLUMN students.gmeet_link IS 'Static Google Meet link assigned at demo and reused for all classes';
COMMENT ON COLUMN account_ledger.narration IS 'Required field for audit compliance - explains the transaction';
