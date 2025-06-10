-- Compound Detailing Database Schema
-- Run this SQL in your Supabase SQL editor to set up the required tables

-- Create jobs table
CREATE TABLE public.jobs (
    id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('exterior', 'full')),
    job_date DATE NOT NULL,
    job_time TIME,
    job_cost DECIMAL(10,2) NOT NULL,
    customer_address TEXT NOT NULL,
    assigned_staff VARCHAR(255),
    job_status VARCHAR(20) DEFAULT 'pending' CHECK (job_status IN ('pending', 'assigned', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table (for future use)
CREATE TABLE public.quotes (
    id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('exterior', 'full')),
    car_size VARCHAR(20) CHECK (car_size IN ('small', 'medium', 'large')),
    car_condition VARCHAR(20) CHECK (car_condition IN ('clean', 'dirty')),
    estimated_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
-- Jobs policies
CREATE POLICY "Authenticated users can view jobs" ON public.jobs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert jobs" ON public.jobs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update jobs" ON public.jobs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete jobs" ON public.jobs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Quotes policies
CREATE POLICY "Authenticated users can view quotes" ON public.quotes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert quotes" ON public.quotes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update quotes" ON public.quotes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_jobs_status ON public.jobs(job_status);
CREATE INDEX idx_jobs_date ON public.jobs(job_date);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at);

-- Insert sample data (optional - for testing)
INSERT INTO public.jobs (customer_name, customer_phone, service_type, job_date, job_time, job_cost, customer_address, assigned_staff, job_status) VALUES
('John Smith', '07712345678', 'full', CURRENT_DATE + INTERVAL '1 day', '10:00', 35.00, '123 Main Street, Northampton, NN1 1AA', 'Tom Wilson', 'assigned'),
('Sarah Johnson', '07798765432', 'exterior', CURRENT_DATE + INTERVAL '2 days', '14:30', 15.00, '456 Oak Avenue, Sywell, NN6 0BN', '', 'pending'),
('Mike Davis', '07723456789', 'full', CURRENT_DATE - INTERVAL '1 day', '09:00', 40.00, '789 High Street, Overstone, NN6 0AD', 'Dom Smith', 'completed');

-- Grant necessary permissions
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.quotes TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated; 