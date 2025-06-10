// Admin Authentication and Dashboard Management
class AdminDashboard {
    constructor() {
        this.jobs = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.db = new DatabaseService();
        this.subscription = null;
        
        this.init();
    }

    init() {
        // Check if we're on login page or admin page
        if (document.body.classList.contains('login-page')) {
            this.initLogin();
        } else if (document.body.classList.contains('admin-page')) {
            this.checkAuthentication();
            this.initDashboard();
        }
    }

    // Login functionality
    initLogin() {
        const loginForm = document.getElementById('login-form');
        const togglePassword = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        // Toggle password visibility
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                const icon = togglePassword.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }

        // Login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        const loginBtn = document.querySelector('.login-btn');

        // Show loading state
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        loginBtn.disabled = true;

        const result = await this.db.signIn(email, password);
        
        if (result.success) {
            // Redirect to admin dashboard
            window.location.href = 'admin.html';
        } else {
            // Show error message
            errorMessage.style.display = 'flex';
            document.getElementById('error-text').textContent = result.error;
            
            // Clear form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            
            // Reset button
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginBtn.disabled = false;
            
            // Hide error after 3 seconds
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    }

    // Authentication check
    async checkAuthentication() {
        const result = await this.db.getCurrentUser();
        
        if (!result.success || !result.user) {
            // Not authenticated
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Dashboard initialization
    async initDashboard() {
        await this.loadJobs();
        await this.updateStats();
        this.renderJobsTable();
        this.bindEvents();
        this.setupRealTimeUpdates();
    }

    bindEvents() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }

        // Add job button
        const addJobBtn = document.getElementById('add-job-btn');
        if (addJobBtn) {
            addJobBtn.addEventListener('click', this.openAddJobModal.bind(this));
        }

        // Modal close buttons
        const closeModal = document.getElementById('close-modal');
        const closeDeleteModal = document.getElementById('close-delete-modal');
        const cancelBtn = document.getElementById('cancel-btn');
        const cancelDelete = document.getElementById('cancel-delete');

        if (closeModal) closeModal.addEventListener('click', this.closeJobModal.bind(this));
        if (closeDeleteModal) closeDeleteModal.addEventListener('click', this.closeDeleteModal.bind(this));
        if (cancelBtn) cancelBtn.addEventListener('click', this.closeJobModal.bind(this));
        if (cancelDelete) cancelDelete.addEventListener('click', this.closeDeleteModal.bind(this));

        // Job form submission
        const jobForm = document.getElementById('job-form');
        if (jobForm) {
            jobForm.addEventListener('submit', this.handleJobSubmit.bind(this));
        }

        // Confirm delete button
        const confirmDelete = document.getElementById('confirm-delete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', this.confirmDelete.bind(this));
        }

        // Close modals when clicking outside
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    async logout() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        await this.db.signOut();
        window.location.href = 'login.html';
    }

    // Job management
    generateJobId() {
        return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    openAddJobModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Add New Job';
        this.resetJobForm();
        document.getElementById('job-modal').classList.add('active');
    }

    openEditJobModal(jobId) {
        this.currentEditId = jobId;
        const job = this.jobs.find(j => j.id === jobId);
        if (job) {
            document.getElementById('modal-title').textContent = 'Edit Job';
            this.populateJobForm(job);
            document.getElementById('job-modal').classList.add('active');
        }
    }

    closeJobModal() {
        document.getElementById('job-modal').classList.remove('active');
        this.resetJobForm();
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').classList.remove('active');
        this.currentDeleteId = null;
    }

    resetJobForm() {
        const form = document.getElementById('job-form');
        if (form) {
            form.reset();
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('job-date').value = today;
            // Set default status to pending
            document.getElementById('job-status').value = 'pending';
        }
    }

    populateJobForm(job) {
        document.getElementById('customer-name').value = job.customerName || '';
        document.getElementById('customer-phone').value = job.customerPhone || '';
        document.getElementById('service-type').value = job.serviceType || '';
        document.getElementById('job-date').value = job.jobDate || '';
        document.getElementById('job-time').value = job.jobTime || '';
        document.getElementById('job-cost').value = job.jobCost || '';
        document.getElementById('customer-address').value = job.customerAddress || '';
        document.getElementById('assigned-staff').value = job.assignedStaff || '';
        document.getElementById('job-status').value = job.jobStatus || 'pending';
    }

    async handleJobSubmit(e) {
        e.preventDefault();
        
        const saveBtn = document.querySelector('.save-btn');
        const originalHTML = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        const formData = new FormData(e.target);
        const jobData = {
            customerName: formData.get('customerName'),
            customerPhone: formData.get('customerPhone'),
            serviceType: formData.get('serviceType'),
            jobDate: formData.get('jobDate'),
            jobTime: formData.get('jobTime'),
            jobCost: parseFloat(formData.get('jobCost')),
            customerAddress: formData.get('customerAddress'),
            assignedStaff: formData.get('assignedStaff'),
            jobStatus: formData.get('jobStatus')
        };

        let result;
        if (this.currentEditId) {
            // Update existing job
            result = await this.db.updateJob(this.currentEditId, jobData);
        } else {
            // Add new job
            result = await this.db.createJob(jobData);
        }

        if (result.success) {
            await this.loadJobs();
            await this.updateStats();
            this.renderJobsTable();
            this.closeJobModal();
        } else {
            alert('Error saving job: ' + result.error);
        }
        
        saveBtn.innerHTML = originalHTML;
        saveBtn.disabled = false;
    }

    deleteJob(jobId) {
        this.currentDeleteId = jobId;
        document.getElementById('delete-modal').classList.add('active');
    }

    async confirmDelete() {
        if (this.currentDeleteId) {
            const result = await this.db.deleteJob(this.currentDeleteId);
            
            if (result.success) {
                await this.loadJobs();
                await this.updateStats();
                this.renderJobsTable();
                this.closeDeleteModal();
            } else {
                alert('Error deleting job: ' + result.error);
            }
        }
    }

    async updateJobStatus(jobId, newStatus) {
        const result = await this.db.updateJobStatus(jobId, newStatus);
        
        if (result.success) {
            await this.loadJobs();
            await this.updateStats();
            this.renderJobsTable();
        } else {
            alert('Error updating job status: ' + result.error);
        }
    }

    async updateAssignedStaff(jobId, staffName) {
        const result = await this.db.updateAssignedStaff(jobId, staffName);
        
        if (result.success) {
            await this.loadJobs();
            this.renderJobsTable();
        } else {
            alert('Error updating staff assignment: ' + result.error);
        }
    }

    async loadJobs() {
        const result = await this.db.getAllJobs();
        
        if (result.success) {
            this.jobs = result.data.map(job => ({
                id: job.id,
                customerName: job.customer_name,
                customerPhone: job.customer_phone,
                serviceType: job.service_type,
                jobDate: job.job_date,
                jobTime: job.job_time,
                jobCost: job.job_cost,
                customerAddress: job.customer_address,
                assignedStaff: job.assigned_staff,
                jobStatus: job.job_status,
                createdAt: job.created_at
            }));
        }
    }

    setupRealTimeUpdates() {
        this.subscription = this.db.subscribeToJobs((payload) => {
            console.log('Real-time update:', payload);
            // Reload jobs and update UI when changes occur
            this.loadJobs().then(() => {
                this.updateStats();
                this.renderJobsTable();
            });
        });
    }

    // Stats calculation
    async updateStats() {
        const result = await this.db.getJobStats();
        
        if (result.success) {
            const { pending, assigned, completed, totalRevenue } = result.data;
            
            document.getElementById('pending-count').textContent = pending;
            document.getElementById('assigned-count').textContent = assigned;
            document.getElementById('completed-count').textContent = completed;
            document.getElementById('total-revenue').textContent = `£${totalRevenue}`;
        }
    }

    // Table rendering
    renderJobsTable() {
        const tbody = document.getElementById('jobs-table-body');
        const noJobs = document.getElementById('no-jobs');
        
        if (this.jobs.length === 0) {
            tbody.innerHTML = '';
            noJobs.style.display = 'block';
            return;
        }

        noJobs.style.display = 'none';
        
        // Sort jobs by date (newest first)
        const sortedJobs = [...this.jobs].sort((a, b) => new Date(b.jobDate) - new Date(a.jobDate));
        
        tbody.innerHTML = sortedJobs.map(job => this.createJobRow(job)).join('');
        
        // Bind events for dynamic elements
        this.bindTableEvents();
    }

    createJobRow(job) {
        const serviceDisplayName = job.serviceType === 'exterior' ? 'Exterior Wash' : 'Full Valet';
        const formattedDate = new Date(job.jobDate).toLocaleDateString('en-GB');
        const formattedTime = job.jobTime || 'Not set';
        
        return `
            <tr>
                <td>
                    <div style="font-weight: 600;">${job.customerName}</div>
                </td>
                <td>${job.customerPhone}</td>
                <td>${serviceDisplayName}</td>
                <td>
                    <div>${formattedDate}</div>
                    <div style="font-size: 0.8rem; color: #888;">${formattedTime}</div>
                </td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${job.customerAddress}</td>
                <td>
                    <div class="staff-input ${job.assignedStaff ? '' : 'empty'}" 
                         data-job-id="${job.id}" 
                         onclick="this.makeEditable()">
                        ${job.assignedStaff || 'Click to assign'}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${job.jobStatus}">${job.jobStatus.toUpperCase()}</span>
                </td>
                <td style="font-weight: 600;">£${job.jobCost}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="dashboard.openEditJobModal('${job.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="dashboard.deleteJob('${job.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${job.jobStatus === 'pending' ? 
                            `<button class="action-btn assign-btn" onclick="dashboard.updateJobStatus('${job.id}', 'assigned')">
                                <i class="fas fa-user-check"></i>
                            </button>` : ''}
                        ${job.jobStatus === 'assigned' ? 
                            `<button class="action-btn complete-btn" onclick="dashboard.updateJobStatus('${job.id}', 'completed')">
                                <i class="fas fa-check"></i>
                            </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    bindTableEvents() {
        // Make staff inputs editable
        document.querySelectorAll('.staff-input').forEach(input => {
            input.makeEditable = function() {
                if (this.classList.contains('editing')) return;
                
                const jobId = this.dataset.jobId;
                const currentText = this.textContent === 'Click to assign' ? '' : this.textContent;
                
                this.classList.add('editing');
                this.innerHTML = `<input type="text" value="${currentText}" style="width: 100%; border: none; background: transparent; outline: none;">`;
                
                const inputField = this.querySelector('input');
                inputField.focus();
                inputField.select();
                
                const finishEditing = () => {
                    const newValue = inputField.value.trim();
                    this.classList.remove('editing');
                    this.textContent = newValue || 'Click to assign';
                    dashboard.updateAssignedStaff(jobId, newValue);
                };
                
                inputField.addEventListener('blur', finishEditing);
                inputField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        finishEditing();
                    }
                });
            };
        });
    }
}

// Initialize dashboard
const dashboard = new AdminDashboard();

// Add some sample data if none exists (for demo purposes)
if (dashboard.jobs.length === 0 && document.body.classList.contains('admin-page')) {
    const sampleJobs = [
        {
            id: 'job_sample_1',
            customerName: 'John Smith',
            customerPhone: '07712345678',
            serviceType: 'full',
            jobDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            jobTime: '10:00',
            jobCost: 35,
            customerAddress: '123 Main Street, Northampton, NN1 1AA',
            assignedStaff: 'Tom Wilson',
            jobStatus: 'assigned',
            createdAt: new Date().toISOString()
        },
        {
            id: 'job_sample_2',
            customerName: 'Sarah Johnson',
            customerPhone: '07798765432',
            serviceType: 'exterior',
            jobDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
            jobTime: '14:30',
            jobCost: 15,
            customerAddress: '456 Oak Avenue, Sywell, NN6 0BN',
            assignedStaff: '',
            jobStatus: 'pending',
            createdAt: new Date().toISOString()
        },
        {
            id: 'job_sample_3',
            customerName: 'Mike Davis',
            customerPhone: '07723456789',
            serviceType: 'full',
            jobDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
            jobTime: '09:00',
            jobCost: 40,
            customerAddress: '789 High Street, Overstone, NN6 0AD',
            assignedStaff: 'Dom Smith',
            jobStatus: 'completed',
            createdAt: new Date().toISOString()
        }
    ];
    
    dashboard.jobs = sampleJobs;
    dashboard.saveJobs();
    dashboard.updateStats();
    dashboard.renderJobsTable();
}