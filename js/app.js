// Blood donation compatibility checker
const canDonateTo = (donorBlood, recipientBlood) => {
    const compatibility = {
        'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        'O+': ['O+', 'A+', 'B+', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'A+': ['A+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'B+': ['B+', 'AB+'],
        'AB-': ['AB-', 'AB+'],
        'AB+': ['AB+']
    };
    return compatibility[donorBlood]?.includes(recipientBlood) || false;
};

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
                ${(() => {
                    const user = Store.getCurrentUser();
                    if (!user) {
                        return `<a href="#" onclick="app.navigate('login', event)" class="btn btn-primary" style="text-decoration: none;">
                           <i data-lucide="log-in"></i> Login
                       </a>`;
                    }
                    if (user.userType === 'recipient') {
                        return `<button class="btn btn-primary" onclick="app.navigate('request')">
                           <i data-lucide="activity"></i> Request Blood
                       </button>
                       <button class="btn btn-secondary" onclick="app.navigate('dashboard')">
                           <i data-lucide="layout-dashboard"></i> Dashboard
                       </button>`;
                    } else {
                        return `<button class="btn btn-primary" onclick="app.navigate('dashboard')">
                           <i data-lucide="layout-dashboard"></i> Dashboard
                       </button>`;
                    }
                })()}
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

    login: () => `
        <div class="view stagger-1" style="max-width: 450px; width: 100%; margin: 2rem auto; padding: 1rem;">
            <div class="card glass">
                <div class="auth-tabs flex justify-between mb-3" style="border-bottom: 1px solid var(--border-color);">
                    <button class="btn btn-secondary w-full" style="border: none; border-radius: 0; border-bottom: 2px solid var(--primary);" onclick="loginApp.toggleAuthMode('login')" id="tab-login">Login</button>
                    <button class="btn btn-secondary w-full" style="border: none; border-radius: 0; color: var(--text-secondary);" onclick="loginApp.toggleAuthMode('register')" id="tab-register">Register</button>
                </div>

                <form id="auth-form" onsubmit="loginApp.handleAuth(event)">
                    <div id="role-section" style="display: none;">
                        <div class="form-group mb-3">
                            <label class="form-label" style="margin-bottom: 0.5rem; display: block; color: var(--text-secondary);">Continue as</label>
                            <div class="auth-tabs flex justify-between" style="border-bottom: 1px solid var(--border-color);">
                                <button class="btn btn-secondary w-full" style="border: none; border-radius: 0; border-bottom: 2px solid var(--primary);" onclick="loginApp.toggleUserType('donor')" type="button" id="tab-donor">Donor</button>
                                <button class="btn btn-secondary w-full" style="border: none; border-radius: 0; color: var(--text-secondary);" onclick="loginApp.toggleUserType('recipient')" type="button" id="tab-recipient">Recipient</button>
                            </div>
                        </div>
                    </div>

                    <div id="register-fields" style="display: none;">
                        <div class="form-group slide-up">
                            <label class="form-label">Full Name</label>
                            <input type="text" id="auth-name" class="form-input" placeholder="Rahul Sharma">
                        </div>
                        <div class="form-group slide-up">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" id="auth-phone" class="form-input" placeholder="+91 98765 43210">
                        </div>
                        <div class="form-group slide-up">
                            <label class="form-label">Campus Location / Dorm</label>
                            <input type="text" id="auth-location" class="form-input" placeholder="Kaveri Hostel, Block A">
                        </div>
                        <div class="form-group slide-up" id="blood-group-field" style="display: none;">
                            <label class="form-label">Blood Group</label>
                            <input type="hidden" id="auth-blood-group" value="">
                            <div class="blood-group-selector">
                                <div class="blood-group-option" onclick="loginApp.selectBloodGroup('A+')" id="bg-Aplus">A+</div>
                                <div class="blood-group-option" onclick="loginApp.selectBloodGroup('A-')" id="bg-Aminus">A-</div>
                                <div class="blood-group-option" onclick="loginApp.selectBloodGroup('B+')" id="bg-Bplus">B+</div>
                                <div class="blood-group-option" onclick="loginApp.selectBloodGroup('B-')" id="bg-Bminus">B-</div>
                                <div class="blood-group-option" onclick="loginApp.selectBloodGroup('AB+')" id="bg-ABplus">AB+</div>
                                <div class="blood-group-option" onclick="loginApp.selectBloodGroup('AB-')" id="bg-ABminus">AB-</div>
                                <div class="blood-group-option" onclick="loginApp.selectBloodGroup('O+')" id="bg-Oplus">O+</div>
                                <div class="blood-group-option" onclick="loginApp.selectBloodGroup('O-')" id="bg-Ominus">O-</div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group stagger-2">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="auth-email" class="form-input" placeholder="student@iitd.ac.in" required>
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



    dashboard: async () => {
        const user = Store.getCurrentUser();
        if (!user) {
            app.navigate('login');
            return '';
        }

        const requests = await Store.getRequests();
        const activeRequests = requests.filter(r => r.status === 'active' && r.requesterId !== user.id);
        const myRequests = await Store.getMyRequests(user.id);
        const users = await Store.getUsers();
        const donorList = users.filter(u => u.userType === 'donor' && u.bloodGroup);

        let content = '';

        if (user.userType === 'donor') {
            // Donor dashboard: Focus on donating
            content = `
                <div class="stagger-2">
                    <div class="flex justify-between align-center mb-2">
                        <h3><i data-lucide="heart" class="pulse-indicator"></i> Available to Donate</h3>
                        <button class="btn btn-primary" onclick="app.toggleDonorAvailability()" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                            ${user.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        </button>
                    </div>
                    ${activeRequests.length === 0 
                        ? `<div class="card glass text-center"><p>No active blood requests currently. Check back later to help save lives.</p></div>`
                        : activeRequests.map(req => `
                            <div class="card glass card-hover mb-2" style="border-left: 4px solid var(--primary);">
                                <div class="flex justify-between">
                                    <h4>${req.patientName} <span class="badge badge-danger ml-2">${req.bloodGroup} Needed</span></h4>
                                    <span class="badge ${req.urgency === 'High' ? 'badge-danger' : 'badge-success'}">${req.urgency} Urgency</span>
                                </div>
                                <p class="mt-1 text-sm"><i data-lucide="map-pin" style="width: 14px;"></i> ${req.hospital}</p>
                                <p class="mt-1 text-sm"><i data-lucide="phone" style="width: 14px;"></i> Contact: ${req.contact}</p>
                                <p class="mt-1 text-sm text-muted">Requested by: ${req.requesterName} • ${new Date(req.createdAt).toLocaleDateString()}</p>
                                
                                ${canDonateTo(user.bloodGroup, req.bloodGroup) ? `
                                    <button class="btn btn-primary w-full mt-2" onclick="app.navigate('donate_form', event, '${req.id}')">
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
            `;
        } else {
            // Recipient dashboard: Focus on requesting
            content = `
                <div class="stagger-3">
                    <div class="card glass mb-3">
                        <div class="flex justify-between align-center mb-2">
                            <div>
                                <h3>Registered Donors</h3>
                                <p class="text-sm text-muted">Browse donors already registered on campus.</p>
                            </div>
                        </div>
                        ${donorList.length === 0 ? `
                            <div class="card glass text-center"><p>No donors registered yet.</p></div>
                        ` : `
                            <div class="grid-2" style="gap: 1rem;">
                                ${donorList.map(donor => `
                                    <div class="card glass p-3" style="border: 1px solid rgba(255,255,255,0.08);">
                                        <div class="flex justify-between align-center mb-2">
                                            <div>
                                                <strong>${donor.name}</strong>
                                                <p class="text-sm text-muted" style="margin: 0.25rem 0 0;">${donor.location || 'Campus'}</p>
                                            </div>
                                            <span class="badge badge-danger">${donor.bloodGroup}</span>
                                        </div>
                                        <p class="text-sm">${donor.phone}</p>
                                        <a href="tel:${donor.phone}" class="btn btn-secondary mt-2" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Call Donor</a>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    <div class="flex justify-between align-center mb-2">
                        <h3>My Blood Requests</h3>
                        <button class="btn btn-primary" onclick="app.navigate('request')" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                            + New Request
                        </button>
                    </div>
                    ${myRequests.length === 0 
                        ? `<div class="card glass text-center"><p>You haven't made any requests yet. Click "New Request" to get started.</p></div>`
                        : myRequests.map(req => `
                            <div class="card glass mb-2">
                                <div class="flex justify-between align-center">
                                    <h4>${req.patientName} (${req.bloodGroup})</h4>
                                    <span class="badge badge-success">Active</span>
                                </div>
                                <p class="mt-1 text-sm text-muted">Posted on ${new Date(req.createdAt).toLocaleDateString()}</p>
                                
                                ${req.responses && req.responses.length > 0 ? `
                                    <div class="mt-2 p-2" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                                        <h5 style="margin-bottom: 0.5rem; color: var(--success); font-size: 0.9rem;"><i data-lucide="check-circle" style="width:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> Donors Found:</h5>
                                        ${req.responses.map(resp => `
                                            <div class="flex justify-between align-center mb-1 pb-1" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                                <div>
                                                    <strong>${resp.donorName}</strong> <span class="badge badge-danger" style="font-size:0.7rem; padding: 0.1rem 0.3rem;">${resp.donorBlood}</span>
                                                </div>
                                                <a href="tel:${resp.donorPhone}" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Call: ${resp.donorPhone}</a>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <p class="mt-2 text-sm" style="color: var(--warning);"><i data-lucide="clock" style="width:14px; display:inline-block; margin-right:4px; vertical-align:middle;"></i> Waiting for donors...</p>
                                `}
                                
                                ${req.status !== 'fulfilled' ? `
                                    <button class="btn btn-secondary w-full mt-2" onclick="app.resolveRequest('${req.id}')">Mark as Fulfilled</button>
                                ` : `
                                    <button class="btn w-full mt-2" disabled style="opacity:0.5; background:var(--success);">Fulfilled</button>
                                `}
                            </div>
                        `).join('')
                    }
                </div>
            `;
        }

        return `
            <div class="view stagger-1" style="max-width: 900px; margin: 2rem auto; width: 100%;">
                
                <div class="card glass mb-3 flex justify-between align-center">
                    <div>
                        <h2 style="font-size: 1.8rem;">Welcome, ${user.name || 'User'}</h2>
                        <p class="mt-1 flex align-center gap-2">
                            <span class="badge badge-danger" style="font-size: 1rem;">${user.bloodGroup || 'N/A'}</span>
                            <span>${user.location || 'Unknown'}</span>
                            <span class="badge ${user.userType === 'donor' ? 'badge-primary' : 'badge-warning'}">${user.userType === 'donor' ? 'Donor' : 'Recipient'}</span>
                        </p>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-secondary" onclick="Store.logout(); app.navigate('home')">
                            <i data-lucide="log-out"></i> Logout
                        </button>
                    </div>
                </div>

                <div class="grid-1">
                    ${content}
                </div>
            </div>
        `;
    },

    request: () => {
        const user = Store.getCurrentUser();
        if (!user) {
            this.navigate('login');
            return '';
        }
        if (user.userType === 'donor') {
            this.navigate('home');
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
                            <input type="text" id="req-location" class="form-input" placeholder="AIIMS, New Delhi, Ward 3" required>
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
    },

    donate_form: async (reqId) => {
        const user = Store.getCurrentUser();
        const request = await Store.getRequestById(reqId);
        if (!request) return `<p>Request not found.</p>`;

        return `
            <div class="view stagger-1" style="max-width: 600px; margin: 2rem auto; width: 100%;">
                <div class="card glass">
                    <button class="btn btn-secondary mb-2" style="padding: 0.3rem 0.6rem;" onclick="app.navigate('dashboard', event)">
                        <i data-lucide="arrow-left" style="width:16px;"></i> Back
                    </button>
                    <h2 class="mb-1 text-center"><span class="gradient-text">Donor</span> Screening</h2>
                    <p class="text-center text-muted mb-3">You are offering to donate to <strong>${request.patientName}</strong> (${request.bloodGroup}). Please answer the following truthfully.</p>
                    
                    <form onsubmit="app.submitDonationForm(event, '${reqId}')">
                        <div class="form-group stagger-2">
                            <label class="form-label">Are you over 18 years old?</label>
                            <select id="don-age" class="form-select" required>
                                <option value="" disabled selected>Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="form-group stagger-2">
                            <label class="form-label">Is your weight above 50 kg?</label>
                            <select id="don-weight" class="form-select" required>
                                <option value="" disabled selected>Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="form-group stagger-3">
                            <label class="form-label">Have you donated blood in the last 3 months?</label>
                            <select id="don-recent" class="form-select" required>
                                <option value="" disabled selected>Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="form-group stagger-3">
                            <label class="form-label">Any recent tattoos, piercings, or major surgeries (last 6 months)?</label>
                            <select id="don-medical" class="form-select" required>
                                <option value="" disabled selected>Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        <div class="form-group stagger-4 mt-2">
                            <button type="submit" class="btn btn-primary w-full">
                                <i data-lucide="heart"></i> Submit & Contact Requester
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

    async navigate(route, event, ...args) {
        if (event) event.preventDefault();
        
        const root = document.getElementById('app');
        if (Views[route]) {
            this.currentRoute = route;
            root.innerHTML = await Views[route](...args);
            if (typeof lucide !== 'undefined') lucide.createIcons(); // re-initialize icons in new html
            this.updateNav();
            if (route === 'login' && typeof loginApp !== 'undefined') {
                loginApp.updateRoleUI();
            }
            window.scrollTo(0, 0);
        }
    },

    updateNav() {
        const nav = document.getElementById('nav-links');
        const user = Store.getCurrentUser();
        
        if (user) {
            nav.innerHTML = `
                <a class="nav-link ${this.currentRoute === 'home' ? 'active' : ''}" onclick="app.navigate('home', event)">Home</a>
                <a class="nav-link ${this.currentRoute === 'dashboard' ? 'active' : ''}" onclick="app.navigate('dashboard', event)">Dashboard</a>
                ${user.userType === 'recipient' ? `<a class="nav-link ${this.currentRoute === 'request' ? 'active' : ''}" onclick="app.navigate('request', event)">Request</a>` : ''}
                <span class="nav-link" style="color: var(--text-primary); cursor: default;">
                    <i data-lucide="user" style="width: 18px; margin-right: 5px; vertical-align:-3px; color: var(--primary);"></i>${(user.name || 'User').split(' ')[0]}
                </span>
                <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.9rem; margin-left: 10px;" onclick="Store.logout(); app.toast('Logged out successfully', 'info'); app.navigate('login');">
                    Log out
                </button>
            `;
        } else {
            nav.innerHTML = `
                <a class="nav-link ${this.currentRoute === 'home' ? 'active' : ''}" onclick="app.navigate('home', event)">Home</a>
                <a href="#" onclick="app.navigate('login', event)" class="btn btn-primary" style="padding: 0.5rem 1rem; text-decoration: none;">Login / Join</a>
            `;
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },


    async submitRequest(e) {
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

        await Store.createRequest(reqData);
        this.toast('Emergency request broadcasted!', 'success');
        this.navigate('dashboard');
    },

    async submitDonationForm(e, reqId) {
        e.preventDefault();
        const age = document.getElementById('don-age').value;
        const weight = document.getElementById('don-weight').value;
        const recent = document.getElementById('don-recent').value;
        const medical = document.getElementById('don-medical').value;

        if (age === 'no' || weight === 'no' || recent === 'yes' || medical === 'yes') {
            this.toast('Unfortunately, you do not meet the criteria to donate right now.', 'error');
            return;
        }

        const user = Store.getCurrentUser();
        const responseData = {
            donorId: user.id,
            donorName: user.name,
            donorPhone: user.phone,
            donorBlood: user.bloodGroup,
            submittedAt: new Date().toISOString()
        };

        await Store.addResponseToRequest(reqId, responseData);
        
        this.toast('Donor intent verified and sent to the requester!', 'success');
        this.navigate('dashboard');
    },

    async resolveRequest(reqId) {
        await Store.resolveRequest(reqId);
        this.toast('Request marked as fulfilled. Good job!', 'success');
        this.navigate('dashboard');
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
    },

    toggleDonorAvailability() {
        const user = Store.getCurrentUser();
        if (user) {
            user.isAvailable = !user.isAvailable;
            Store.setCurrentUser(user);
            // Update in database too
            Store.updateUser(user);
            this.toast(`You are now ${user.isAvailable ? 'available' : 'unavailable'} for donations`, 'info');
            this.navigate('dashboard');
        }
    }
};

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
