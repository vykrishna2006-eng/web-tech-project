-- InternTrack Pro Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  subscription_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  subscription_end_date TIMESTAMP,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  job_url TEXT,
  location VARCHAR(255),
  salary_range VARCHAR(100),
  status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'oa', 'interview', 'offer', 'rejected', 'withdrawn')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  applied_date DATE DEFAULT CURRENT_DATE,
  deadline DATE,
  resume_id UUID,
  notes TEXT,
  position_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Application tags junction
CREATE TABLE IF NOT EXISTS application_tags (
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (application_id, tag_id)
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add FK for resume in applications
ALTER TABLE applications ADD CONSTRAINT fk_resume 
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL;

-- Interview logs table
CREATE TABLE IF NOT EXISTS interview_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  round_name VARCHAR(255) NOT NULL,
  interview_date TIMESTAMP,
  interviewer_name VARCHAR(255),
  format VARCHAR(50) CHECK (format IN ('phone', 'video', 'onsite', 'technical', 'hr', 'other')),
  questions TEXT,
  feedback TEXT,
  outcome VARCHAR(50) CHECK (outcome IN ('pending', 'passed', 'failed', 'no_show')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'reminder', 'alert', 'success')),
  is_read BOOLEAN DEFAULT false,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity logs (admin)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  plan VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_logs_application_id ON interview_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
