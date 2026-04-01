// Local Storage Mock Database
const Store = {
    init() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('requests')) {
            localStorage.setItem('requests', JSON.stringify([]));
        }
    },

    // Users
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem('users')) || [];
        } catch { return []; }
    },

    getUserByEmail(email) {
        return this.getUsers().find(u => u.email === email);
    },

    saveUser(user) {
        const users = this.getUsers();
        users.push({ ...user, id: Date.now().toString(), createdAt: new Date().toISOString() });
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    },

    // Current Auth User
    login(email, password) {
        const user = this.getUserByEmail(email);
        if (user && user.password === password) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem('currentUser');
    },

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        if (!user || user === 'undefined') return null;
        try {
            return JSON.parse(user);
        } catch { return null; }
    },

    // Requests
    getRequests() {
        try {
            return JSON.parse(localStorage.getItem('requests')) || [];
        } catch { return []; }
    },

    createRequest(request) {
        const requests = this.getRequests();
        const newReq = {
            ...request,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'active', // active, fulfilled
            responses: []
        };
        requests.unshift(newReq);
        localStorage.setItem('requests', JSON.stringify(requests));
        return newReq;
    },

    getMyRequests(userId) {
        return this.getRequests().filter(r => r.requesterId === userId);
    },

    // Donors (Search functionality)
    searchDonors(bloodGroup, location) {
        const users = this.getUsers();
        const currentUser = this.getCurrentUser();
        
        return users.filter(u => {
            if (currentUser && u.id === currentUser.id) return false;
            let match = true;
            if (bloodGroup && bloodGroup !== 'Any') {
                match = match && u.bloodGroup === bloodGroup;
            }
            if (location) {
                match = match && u.location.toLowerCase().includes(location.toLowerCase());
            }
            return match && u.canDonate; // Assuming user has a canDonate flag
        });
    }
};

// Initialize store on script load
Store.init();
