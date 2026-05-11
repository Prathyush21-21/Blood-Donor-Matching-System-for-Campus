let API_URL = window.location.origin;
if (window.location.port === '5500' || window.location.port === '8080') {
    API_URL = 'http://' + window.location.hostname + ':3000';
}

const Store = {
    isBackendDown: false,

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

    // In-memory/localStorage fallback for DB
    getLocalDB() {
        const defaultDB = { users: [], requests: [] };
        const db = localStorage.getItem('localDB');
        return db ? JSON.parse(db) : defaultDB;
    },
    
    saveLocalDB(db) {
        localStorage.setItem('localDB', JSON.stringify(db));
    },

    async safeFetch(url, options = {}) {
        if (this.isBackendDown) throw new Error("Backend is marked as down");
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return await res.json();
        } catch (e) {
            this.isBackendDown = true;
            console.warn("Falling back to local storage due to DB Error", e);
            throw e;
        }
    },

    // Users
    async getUsers() {
        try {
            return await this.safeFetch(`${API_URL}/users`);
        } catch (e) { 
            return this.getLocalDB().users; 
        }
    },

    async getUserByEmail(email) {
        try {
            const users = await this.safeFetch(`${API_URL}/users?email=${encodeURIComponent(email)}`);
            return users[0] || null;
        } catch (e) { 
            const users = this.getLocalDB().users;
            return users.find(u => u.email === email) || null;
        }
    },

    async saveUser(user) {
        const newUser = { ...user, id: Date.now().toString(), createdAt: new Date().toISOString() };
        try {
            return await this.safeFetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
        } catch (e) { 
            const db = this.getLocalDB();
            db.users.push(newUser);
            this.saveLocalDB(db);
            return newUser;
        }
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
            return await this.safeFetch(`${API_URL}/requests/${reqId}`);
        } catch (e) { 
            const db = this.getLocalDB();
            return db.requests.find(r => r.id === reqId) || null;
        }
    },

    async getRequests() {
        try {
            return await this.safeFetch(`${API_URL}/requests?_sort=createdAt&_order=desc`);
        } catch (e) { 
            const db = this.getLocalDB();
            return db.requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    },

    async createRequest(request) {
        const newReq = { ...request, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'active', responses: [] };
        try {
            return await this.safeFetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReq)
            });
        } catch (e) { 
            const db = this.getLocalDB();
            db.requests.push(newReq);
            this.saveLocalDB(db);
            return newReq;
        }
    },

    async getMyRequests(userId) {
        try {
            return await this.safeFetch(`${API_URL}/requests?requesterId=${userId}&_sort=createdAt&_order=desc`);
        } catch (e) { 
            const db = this.getLocalDB();
            return db.requests.filter(r => r.requesterId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    },

    async addResponseToRequest(reqId, responseData) {
        try {
            const request = await this.getRequestById(reqId);
            if (!request) return null;
            
            const responses = request.responses || [];
            responses.push(responseData);

            return await this.safeFetch(`${API_URL}/requests/${reqId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses })
            });
        } catch (e) { 
            const db = this.getLocalDB();
            const reqIndex = db.requests.findIndex(r => r.id === reqId);
            if (reqIndex !== -1) {
                if (!db.requests[reqIndex].responses) db.requests[reqIndex].responses = [];
                db.requests[reqIndex].responses.push(responseData);
                this.saveLocalDB(db);
                return db.requests[reqIndex];
            }
            return null;
        }
    },

    async resolveRequest(reqId) {
        try {
            return await this.safeFetch(`${API_URL}/requests/${reqId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'fulfilled' })
            });
        } catch (e) { 
            const db = this.getLocalDB();
            const reqIndex = db.requests.findIndex(r => r.id === reqId);
            if (reqIndex !== -1) {
                db.requests[reqIndex].status = 'fulfilled';
                this.saveLocalDB(db);
                return db.requests[reqIndex];
            }
            return null;
        }
    }
};
