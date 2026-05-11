let API_URL = window.location.origin;
if (window.location.port === '5500' || window.location.port === '8080') {
    API_URL = 'http://' + window.location.hostname + ':3000';
}

const Store = {
    // Current Auth User (Local Session)
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        if (!user || user === 'undefined') return null;
        try {
            return JSON.parse(user);
        } catch { return null; }
    },
    
    setCurrentUser(user) {
        if (user) localStorage.setItem('currentUser', JSON.stringify(user));
        else localStorage.removeItem('currentUser');
    },

    logout() {
        this.setCurrentUser(null);
    },

    // Users
    async getUsers() {
        try {
            const res = await fetch(`${API_URL}/users`);
            return await res.json();
        } catch (e) { console.error("DB Error", e); return []; }
    },

    async getUserByEmail(email) {
        try {
            const res = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}`);
            const users = await res.json();
            return users[0] || null;
        } catch (e) { console.error("DB Error", e); return null; }
    },

    async saveUser(user) {
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, id: Date.now().toString(), createdAt: new Date().toISOString() })
            });
            return await res.json();
        } catch (e) { console.error("DB Error", e); return null; }
    },

    // Auth
    async login(email, password) {
        const user = await this.getUserByEmail(email);
        if (user && user.password === password) {
            this.setCurrentUser(user);
            return true;
        }
        return false;
    },

    // Requests
    async getRequestById(reqId) {
        try {
            const res = await fetch(`${API_URL}/requests/${reqId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) { console.error("DB Error", e); return null; }
    },

    async getRequests() {
        try {
            const res = await fetch(`${API_URL}/requests?_sort=createdAt&_order=desc`);
            return await res.json();
        } catch (e) { console.error("DB Error", e); return []; }
    },

    async createRequest(request) {
        try {
            const res = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...request, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'active', responses: [] })
            });
            return await res.json();
        } catch (e) { console.error("DB Error", e); return null; }
    },

    async getMyRequests(userId) {
        try {
            const res = await fetch(`${API_URL}/requests?requesterId=${userId}&_sort=createdAt&_order=desc`);
            return await res.json();
        } catch (e) { console.error("DB Error", e); return []; }
    },

    async addResponseToRequest(reqId, responseData) {
        try {
            const request = await this.getRequestById(reqId);
            if (!request) return null;
            
            const responses = request.responses || [];
            responses.push(responseData);

            const res = await fetch(`${API_URL}/requests/${reqId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses })
            });
            return await res.json();
        } catch (e) { console.error("DB Error", e); return null; }
    },

    async resolveRequest(reqId) {
        try {
            const res = await fetch(`${API_URL}/requests/${reqId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'fulfilled' })
            });
            return await res.json();
        } catch (e) { console.error("DB Error", e); return null; }
    }
};
