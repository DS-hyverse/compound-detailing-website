// Supabase Configuration
// Replace these with your actual Supabase project details
const SUPABASE_URL = 'https://bzyesiicyhgdksbtusob.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6eWVzaWljeWhnZGtzYnR1c29iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI4OTQ1NCwiZXhwIjoyMDY0ODY1NDU0fQ.cpHrKwOkvUlVasuhL_3lKbIZ8Gvdlvcv-72kSypavN8';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database service class
class DatabaseService {
    constructor() {
        this.supabase = supabase;
    }

    // Authentication methods
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            if (error) throw error;
            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Jobs CRUD operations
    async getAllJobs() {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createJob(jobData) {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .insert([{
                    customer_name: jobData.customerName,
                    customer_phone: jobData.customerPhone,
                    service_type: jobData.serviceType,
                    job_date: jobData.jobDate,
                    job_time: jobData.jobTime,
                    job_cost: jobData.jobCost,
                    customer_address: jobData.customerAddress,
                    assigned_staff: jobData.assignedStaff,
                    job_status: jobData.jobStatus || 'pending'
                }])
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateJob(jobId, jobData) {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .update({
                    customer_name: jobData.customerName,
                    customer_phone: jobData.customerPhone,
                    service_type: jobData.serviceType,
                    job_date: jobData.jobDate,
                    job_time: jobData.jobTime,
                    job_cost: jobData.jobCost,
                    customer_address: jobData.customerAddress,
                    assigned_staff: jobData.assignedStaff,
                    job_status: jobData.jobStatus
                })
                .eq('id', jobId)
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteJob(jobId) {
        try {
            const { error } = await this.supabase
                .from('jobs')
                .delete()
                .eq('id', jobId);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateJobStatus(jobId, status) {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .update({ job_status: status })
                .eq('id', jobId)
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateAssignedStaff(jobId, staffName) {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .update({ assigned_staff: staffName })
                .eq('id', jobId)
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Customer quotes (for future integration)
    async createQuote(quoteData) {
        try {
            const { data, error } = await this.supabase
                .from('quotes')
                .insert([{
                    customer_name: quoteData.customerName,
                    customer_phone: quoteData.customerPhone,
                    service_type: quoteData.serviceType,
                    car_size: quoteData.carSize,
                    car_condition: quoteData.carCondition,
                    estimated_price: quoteData.estimatedPrice,
                    status: 'pending'
                }])
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Real-time subscriptions
    subscribeToJobs(callback) {
        return this.supabase
            .channel('jobs')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'jobs'
                },
                callback
            )
            .subscribe();
    }

    // Statistics
    async getJobStats() {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .select('job_status, job_cost');
            
            if (error) throw error;

            const stats = {
                pending: data.filter(job => job.job_status === 'pending').length,
                assigned: data.filter(job => job.job_status === 'assigned').length,
                completed: data.filter(job => job.job_status === 'completed').length,
                totalRevenue: data
                    .filter(job => job.job_status === 'completed')
                    .reduce((sum, job) => sum + (job.job_cost || 0), 0)
            };

            return { success: true, data: stats };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Export for use in other files
window.DatabaseService = DatabaseService; 