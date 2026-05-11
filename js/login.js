const loginApp = {
    authMode: 'login',

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
                this.toast('Login successful!', 'success');
                setTimeout(() => window.location.href = 'index.html', 500);
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

            if (await Store.getUserByEmail(email)) {
                this.toast('Email already in use.', 'error');
                return;
            }

            const newUser = { name, phone, email, password, location, bloodGroup, canDonate: true };
            const savedUser = await Store.saveUser(newUser);
            if (savedUser) {
                await Store.login(email, password); // Auto login
                this.toast('Account created successfully!', 'success');
                setTimeout(() => window.location.href = 'index.html', 500);
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
    // If user is already logged in, redirect to index
    if (Store.getCurrentUser()) {
        window.location.href = 'index.html';
    }
});
