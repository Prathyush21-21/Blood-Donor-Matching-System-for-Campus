// UI Components & Views

const Views = {
    home: () => `
        <div class="view stagger-1" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 4rem 1rem;">
            <div style="margin-bottom: 2rem;">
                <h1 class="stagger-2">Save a <span class="gradient-text">Life</span> Today</h1>
                <p class="stagger-3 mt-1" style="font-size: 1.25rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                    The fastest way to connect blood recipients with willing donors on campus. 
                    Every drop counts. Every person matters.
                </p>
            </div>
            <div class="flex gap-2 justify-center stagger-4 mt-3">
                ${Store.getCurrentUser() 
                    ? `<button class="btn btn-primary" onclick="app.navigate('request')">
                           <i data-lucide="activity"></i> Request Blood
                       </button>
                       <button class="btn btn-secondary" onclick="app.navigate('dashboard')">
                           <i data-lucide="layout-dashboard"></i> Dashboard
                       </button>`
                    : `<button class="btn btn-primary" onclick="app.navigate('auth')">
                           <i data-lucide="user-plus"></i> Join as Donor
                       </button>
                       <button class="btn btn-secondary" onclick="app.navigate('auth')">
                           <i data-lucide="log-in"></i> Login
                       </button>`
                }
            </div>

            <div class="grid-3 mt-4 w-full" style="max-width: 900px;">
                <div class="card glass card-hover text-center stagger-1">
                    <i data-lucide="heart" style="color: var(--primary); width: 32px; height: 32px; margin-bottom: 1rem;"></i>
                    <h3>Be a Hero</h3>
                    <p class="mt-1" style="font-size: 0.9rem;">Your single donation can save up to 3 lives. Register now to make an impact.</p>
                </div>
                <div class="card glass card-hover text-center stagger-2">
                    <i data-lucide="zap" style="color: var(--warning); width: 32px; height: 32px; margin-bottom: 1rem;"></i>
                    <h3>Fast Connections</h3>
                    <p class="mt-1" style="font-size: 0.9rem;">Our matching algorithm finds relevant donors natively inside the campus within seconds.</p>
                </div>
                <div class="card glass card-hover text-center stagger-3">
                    <i data-lucide="shield-check" style="color: var(--success); width: 32px; height: 32px; margin-bottom: 1rem;"></i>
                    <h3>100% Secure</h3>
                    <p class="mt-1" style="font-size: 0.9rem;">Your contact details remain completely verified and private until you agree to donate.</p>
                </div>
            </div>
        </div>
    `,

    auth: () => `
        <div class="view stagger-1" style="max-width: 450px; margin: 2rem auto; width: 100%;">
            <div class="card glass">
                <div class="auth-tabs flex justify-between mb-3" style="border-bottom: 1px solid var(--border-color);">
                    <button class="btn btn-secondary w-full" style="border: none; border-radius: 0; border-bottom: 2px solid var(--primary);" onclick="app.toggleAuthMode('login')" id="tab-login">Login</button>
                    <button class="btn btn-secondary w-full" style="border: none; border-radius: 0; color: var(--text-secondary);" onclick="app.toggleAuthMode('register')" id="tab-register">Register</button>
                </div>
                
                <form id="auth-form" onsubmit="app.handleAuth(event)">
                    <div id="register-fields" style="display: none;">
                        <div class="form-group slide-up">
                            <label class="form-label">Full Name</label>
                            <input type="text" id="auth-name" class="form-input" placeholder="John Doe">
                        </div>
                        <div class="form-group slide-up">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" id="auth-phone" class="form-input" placeholder="+1 234 567 8900">
                        </div>
                        <div class="form-group slide-up">
                            <label class="form-label">Campus Location / Dorm</label>
                            <input type="text" id="auth-location" class="form-input" placeholder="North Campus, Block A">
                        </div>
                        <div class="form-group slide-up">
                            <label class="form-label">Blood Group</label>
                            <input type="hidden" id="auth-blood-group" value="">
                            <div class="blood-group-selector">
                                ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => 
                                    `<div class="blood-group-option" onclick="app.selectBloodGroup('${bg}')" id="bg-${bg.replace('+','plus').replace('-','minus')}">${bg}</div>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group stagger-2">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="auth-email" class="form-input" placeholder="student@university.edu" required>
                    </div>
                    <div class="form-group stagger-3">
                        <label class="form-label">Password</label>
                        <input type="password" id="auth-password" class="form-input" placeholder="••••••••" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary w-full mt-2 stagger-4" id="auth-submit-btn">
                        Login to Account
                    </button>
                </form>
            </div>
        </div>
    `,

    dashboard: () => {
        const user = Store.getCurrentUser();
        if (!user) {
            setTimeout(() => app.navigate('auth'), 0);
            return '';
        }

        const requests = Store.getRequests();
        // Matching rules: if you are O-, anyone. If you are O+, O+ or positive. (Simplified logic for matching demo: precise match)
        const activeRequests = requests.filter(r => r.status === 'active' && r.requesterId !== user.id);
        const myRequests = Store.getMyRequests(user.id);

        return `
            <div class="view stagger-1" style="max-width: 900px; margin: 2rem auto; width: 100%;">
                
                <div class="card glass mb-3 flex justify-between align-center">
                    <div>
                        <h2 style="font-size: 1.8rem;">Welcome, ${user.name}</h2>
                        <p class="mt-1 flex align-center gap-2">
                            <span class="badge badge-danger" style="font-size: 1rem;">${user.bloodGroup}</span>
                            <span>${user.location}</span>
                        </p>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-secondary" onclick="Store.logout(); app.navigate('home')">
                            <i data-lucide="log-out"></i> Logout
                        </button>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="stagger-2">
                        <div class="flex justify-between align-center mb-2">
                            <h3><i data-lucide="radio-receiver" class="pulse-indicator"></i> Active Campus Needs</h3>
                        </div>
                        ${activeRequests.length === 0 
                            ? `<div class="card glass text-center"><p>No active blood requests currently. The campus is safe.</p></div>`
                            : activeRequests.map(req => `
                                <div class="card glass card-hover mb-2" style="border-left: 4px solid var(--primary);">
                                    <div class="flex justify-between">
                                        <h4>${req.patientName} <span class="badge badge-danger ml-2">${req.bloodGroup} Needed</span></h4>
                                        <span class="badge ${req.urgency === 'High' ? 'badge-danger' : 'badge-success'}">${req.urgency} Urgency</span>
                                    </div>
                                    <p class="mt-1 text-sm"><i data-lucide="map-pin" style="width: 14px;"></i> ${req.hospital}</p>
                                    <p class="mt-1 text-sm"><i data-lucide="phone" style="width: 14px;"></i> Contact: ${req.contact}</p>
                                    <p class="mt-1 text-sm text-muted">Requested by: ${req.requesterName} • ${new Date(req.createdAt).toLocaleDateString()}</p>
                                    
                                    ${user.bloodGroup === req.bloodGroup || user.bloodGroup === 'O-' ? `
                                        <button class="btn btn-primary w-full mt-2" onclick="app.toast('Donor intent sent to requester!', 'success')">
                                            I can donate
                                        </button>
                                    ` : `
                                        <button class="btn btn-secondary w-full mt-2" disabled style="opacity: 0.5;">
                                            Not a blood match
                                        </button>
                                    `}
                                </div>
                            `).join('')
                        }
                    </div>

                    <div class="stagger-3">
                        <div class="flex justify-between align-center mb-2">
                            <h3>My Requests</h3>
                            <button class="btn btn-primary" onclick="app.navigate('request')" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                                + New Request
                            </button>
                        </div>
                        ${myRequests.length === 0 
                            ? `<div class="card glass text-center"><p>You haven't made any requests yet.</p></div>`
                            : myRequests.map(req => `
                                <div class="card glass mb-2">
                                    <div class="flex justify-between align-center">
                                        <h4>${req.patientName} (${req.bloodGroup})</h4>
                                        <span class="badge badge-success">Active</span>
                                    </div>
                                    <p class="mt-1 text-sm text-muted">Posted on ${new Date(req.createdAt).toLocaleDateString()}</p>
                                    <button class="btn btn-secondary w-full mt-1" onclick="app.resolveRequest('${req.id}')">Mark as Fulfilled</button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;
    },

    request: () => {
        const user = Store.getCurrentUser();
        if (!user) {
            setTimeout(() => app.navigate('auth'), 0);
            return '';
        }
        return `
            <div class="view stagger-1" style="max-width: 600px; margin: 2rem auto; width: 100%;">
                <div class="card glass">
                    <h2 class="mb-1 text-center"><span class="gradient-text">Urgent</span> Blood Need</h2>
                    <p class="text-center text-muted mb-3">Broadcast a request to all matching campus donors.</p>
                    
                    <form onsubmit="app.submitRequest(event)">
                        <div class="grid-2">
                            <div class="form-group stagger-2">
                                <label class="form-label">Patient Name</label>
                                <input type="text" id="req-patient" class="form-input" required>
                            </div>
                            <div class="form-group stagger-2">
                                <label class="form-label">Blood Group Needed</label>
                                <select id="req-bg" class="form-select" required>
                                    <option value="" disabled selected>Select Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group stagger-3">
                            <label class="form-label">Hospital / Exact Location</label>
                            <input type="text" id="req-location" class="form-input" placeholder="City General Hospital, Ward 3" required>
                        </div>

                        <div class="grid-2">
                            <div class="form-group stagger-3">
                                <label class="form-label">Contact Number</label>
                                <input type="tel" id="req-contact" class="form-input" value="${user.phone}" required>
                            </div>
                            <div class="form-group stagger-3">
                                <label class="form-label">Urgency Level</label>
                                <select id="req-urgency" class="form-select" required>
                                    <option value="High">High (Immediate)</option>
                                    <option value="Normal">Normal (Within 24-48h)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group stagger-4 mt-2">
                            <button type="submit" class="btn btn-primary w-full">
                                <i data-lucide="broadcast"></i> Broadcast Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};

// Main App Logic
const app = {
    currentRoute: 'home',
    authMode: 'login', // 'login' or 'register'

    init() {
        this.updateNav();
        this.navigate('home');
    },

    navigate(route, event) {
        if (event) event.preventDefault();
        
        const root = document.getElementById('app');
        if (Views[route]) {
            this.currentRoute = route;
            root.innerHTML = Views[route]();
            if (typeof lucide !== 'undefined') lucide.createIcons(); // re-initialize icons in new html
            this.updateNav();
        }
    },

    updateNav() {
        const nav = document.getElementById('nav-links');
        const user = Store.getCurrentUser();
        
        if (user) {
            nav.innerHTML = `
                <a class="nav-link ${this.currentRoute === 'home' ? 'active' : ''}" onclick="app.navigate('home', event)">Home</a>
                <a class="nav-link ${this.currentRoute === 'dashboard' ? 'active' : ''}" onclick="app.navigate('dashboard', event)">Dashboard</a>
                <a class="nav-link ${this.currentRoute === 'request' ? 'active' : ''}" onclick="app.navigate('request', event)">Request</a>
                <span class="nav-link" style="color: var(--text-primary); cursor: default;">
                    <i data-lucide="user" style="width: 18px; margin-right: 5px; vertical-align:-3px; color: var(--primary);"></i>${user.name.split(' ')[0]}
                </span>
                <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem; margin-left: 10px;" onclick="Store.logout(); app.toast('Logged out successfully', 'info'); app.navigate('home')">
                    Log out
                </button>
            `;
        } else {
            nav.innerHTML = `
                <a class="nav-link ${this.currentRoute === 'home' ? 'active' : ''}" onclick="app.navigate('home', event)">Home</a>
                <button class="btn btn-primary" style="padding: 0.5rem 1rem;" onclick="app.navigate('auth')">Login / Join</button>
            `;
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    // Auth Logic
    toggleAuthMode(mode) {
        this.authMode = mode;
        const regFields = document.getElementById('register-fields');
        const submitBtn = document.getElementById('auth-submit-btn');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');

        if (mode === 'register') {
            regFields.style.display = 'block';
            submitBtn.textContent = 'Create Account';
            
            tabRegister.style.borderBottom = '2px solid var(--primary)';
            tabRegister.style.color = 'var(--text-primary)';
            
            tabLogin.style.borderBottom = 'none';
            tabLogin.style.color = 'var(--text-secondary)';
        } else {
            regFields.style.display = 'none';
            submitBtn.textContent = 'Login to Account';
            
            tabLogin.style.borderBottom = '2px solid var(--primary)';
            tabLogin.style.color = 'var(--text-primary)';
            
            tabRegister.style.borderBottom = 'none';
            tabRegister.style.color = 'var(--text-secondary)';
        }
    },

    selectBloodGroup(bg) {
        // Deselect all
        document.querySelectorAll('.blood-group-option').forEach(el => el.classList.remove('selected'));
        // Select one
        const elId = 'bg-' + bg.replace('+', 'plus').replace('-', 'minus');
        document.getElementById(elId).classList.add('selected');
        document.getElementById('auth-blood-group').value = bg;
    },

    handleAuth(e) {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (this.authMode === 'login') {
            if (Store.login(email, password)) {
                this.toast('Login successful!', 'success');
                this.navigate('dashboard');
            } else {
                this.toast('Invalid email or password.', 'error');
            }
        } else {
            const name = document.getElementById('auth-name').value;
            const phone = document.getElementById('auth-phone').value;
            const location = document.getElementById('auth-location').value;
            const bloodGroup = document.getElementById('auth-blood-group').value;

            if (!name || !phone || !location || !bloodGroup) {
                this.toast('Please fill all fields, including blood group.', 'error');
                return;
            }

            if (Store.getUserByEmail(email)) {
                this.toast('Email already in use.', 'error');
                return;
            }

            const newUser = { name, phone, email, password, location, bloodGroup, canDonate: true };
            Store.saveUser(newUser);
            Store.login(email, password); // Auto login
            
            this.toast('Account created successfully!', 'success');
            this.navigate('dashboard');
        }
    },

    // Request Logic
    submitRequest(e) {
        e.preventDefault();
        const user = Store.getCurrentUser();
        
        const reqData = {
            requesterId: user.id,
            requesterName: user.name,
            patientName: document.getElementById('req-patient').value,
            bloodGroup: document.getElementById('req-bg').value,
            hospital: document.getElementById('req-location').value,
            contact: document.getElementById('req-contact').value,
            urgency: document.getElementById('req-urgency').value
        };

        Store.createRequest(reqData);
        this.toast('Emergency request broadcasted!', 'success');
        this.navigate('dashboard');
    },

    resolveRequest(reqId) {
        const requests = Store.getRequests();
        const req = requests.find(r => r.id === reqId);
        if (req) {
            req.status = 'fulfilled';
            localStorage.setItem('requests', JSON.stringify(requests));
            this.toast('Request marked as fulfilled. Good job!', 'success');
            this.navigate('dashboard');
        }
    },

    // Utilities
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'alert-circle';

        toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
