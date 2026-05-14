const loginApp = {
    userType: 'donor',
    authMode: 'login',
    hasSelectedMode: false,

    toggleUserType(type) {
        this.userType = type;
        const tabDonor = document.getElementById('tab-donor');
        const tabRecipient = document.getElementById('tab-recipient');

        if (tabDonor && tabRecipient) {
            if (type === 'recipient') {
                tabRecipient.style.borderBottom = '2px solid var(--primary)';
                tabRecipient.style.color = 'var(--text-primary)';
                tabDonor.style.borderBottom = 'none';
                tabDonor.style.color = 'var(--text-secondary)';
            } else {
                tabDonor.style.borderBottom = '2px solid var(--primary)';
                tabDonor.style.color = 'var(--text-primary)';
                tabRecipient.style.borderBottom = 'none';
                tabRecipient.style.color = 'var(--text-secondary)';
            }
        }
        this.updateRoleUI();
    },

    updateRoleUI() {
        const submitBtn = document.getElementById('auth-submit-btn');
        const bloodGroupField = document.getElementById('blood-group-field');
        const roleSection = document.getElementById('role-section');

        if (roleSection) {
            roleSection.style.display = this.hasSelectedMode ? 'block' : 'none';
        }

        if (submitBtn) {
            if (this.authMode === 'register') {
                submitBtn.textContent = this.userType === 'donor' ? 'Register as Donor' : 'Register as Recipient';
            } else {
                submitBtn.textContent = this.userType === 'donor' ? 'Login as Donor' : 'Login as Recipient';
            }
        }

        if (bloodGroupField) {
            bloodGroupField.style.display = this.userType === 'donor' ? 'block' : 'none';
        }
    },

    toggleAuthMode(mode) {
        this.authMode = mode;
        this.hasSelectedMode = true;
        const regFields = document.getElementById('register-fields');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');

        if (mode === 'register') {
            regFields.style.display = 'block';
            tabRegister.style.borderBottom = '2px solid var(--primary)';
            tabRegister.style.color = 'var(--text-primary)';
            tabLogin.style.borderBottom = 'none';
            tabLogin.style.color = 'var(--text-secondary)';
        } else {
            regFields.style.display = 'none';
            tabLogin.style.borderBottom = '2px solid var(--primary)';
            tabLogin.style.color = 'var(--text-primary)';
            tabRegister.style.borderBottom = 'none';
            tabRegister.style.color = 'var(--text-secondary)';
        }
        this.updateRoleUI();
    },

    selectBloodGroup(bg) {
        document.querySelectorAll('.blood-group-option').forEach(el => el.classList.remove('selected'));
        const elId = 'bg-' + bg.replace('+', 'plus').replace('-', 'minus');
        document.getElementById(elId).classList.add('selected');
        document.getElementById('auth-blood-group').value = bg;
    },


    async handleAuth(e) {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (this.authMode === 'login') {
            if (await Store.login(email, password)) {
                const currentUser = Store.getCurrentUser();
                if (currentUser && currentUser.userType !== this.userType) {
                    Store.logout();
                    this.toast(`Please login as ${currentUser.userType}`, 'error');
                    return;
                }
                this.toast('Login successful!', 'success');
                setTimeout(() => {
                    app.navigate('home');
                }, 500);
            } else {
                this.toast('Invalid email or password.', 'error');
            }
        } else {
            const name = document.getElementById('auth-name').value;
            const phone = document.getElementById('auth-phone').value;
            const location = document.getElementById('auth-location').value;
            const bloodGroup = document.getElementById('auth-blood-group').value;

            if (!name || !phone || !location) {
                this.toast('Please fill all required fields.', 'error');
                return;
            }

            if (this.userType === 'donor' && !bloodGroup) {
                this.toast('Please select your blood group.', 'error');
                return;
            }

            if (await Store.getUserByEmail(email)) {
                this.toast('Email already in use.', 'error');
                return;
            }

            const newUser = { 
                name, 
                phone, 
                email, 
                password, 
                location, 
                userType: this.userType, 
                canDonate: this.userType === 'donor',
                ...(this.userType === 'donor' && { bloodGroup })
            };
            const savedUser = await Store.saveUser(newUser);
            if (savedUser) {
                await Store.login(email, password); // Auto login
                this.toast('Account created successfully!', 'success');
                setTimeout(() => {
                    app.navigate('home');
                }, 500);
            } else {
                this.toast('Failed to create account. Check connection.', 'error');
            }
        }
    },

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

window.addEventListener('DOMContentLoaded', () => {
    loginApp.updateRoleUI();
    loginApp.toggleUserType('donor');
});
