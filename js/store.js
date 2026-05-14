let API_URL = window.location.origin;
if (window.location.port === '5500' || window.location.port === '8080') {
    API_URL = 'http://' + window.location.hostname + ':3000';
}

const Store = {
    isBackendDown: false,
    
    // HashMap storage (ES6 Map equivalent to Java HashMap)
    usersMap: new Map(),      // Key: email, Value: user object
    usersById: new Map(),     // Key: userId, Value: user object
    requestsMap: new Map(),   // Key: requestId, Value: request object
    requestsByUser: new Map(), // Key: userId, Value: array of requests

    // Current Auth User (Local Session)
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        if (!user || user === 'undefined') return null;
        try {
            const parsedUser = JSON.parse(user);
            // Add defaults for missing fields
            if (!parsedUser.userType) {
                parsedUser.userType = parsedUser.canDonate ? 'donor' : 'recipient';
            }
            if (parsedUser.isAvailable === undefined) {
                parsedUser.isAvailable = parsedUser.userType === 'donor';
            }
            return parsedUser;
        } catch { return null; }
    },
    
    setCurrentUser(user) {
        if (user) localStorage.setItem('currentUser', JSON.stringify(user));
        else localStorage.removeItem('currentUser');
    },

    logout() {
        this.setCurrentUser(null);
    },

    normalizeUser(user) {
        if (!user.userType) {
            user.userType = user.canDonate ? 'donor' : 'recipient';
        }
        if (user.isAvailable === undefined) {
            user.isAvailable = user.userType === 'donor';
        }
        return user;
    },

    // Convert HashMap data to localStorage format
    getLocalDB() {
        const defaultDB = { users: [], requests: [] };
        const db = localStorage.getItem('localDB');
        if (!db) return defaultDB;
        
        const parsed = JSON.parse(db);
        // Load Maps from localStorage
        this.usersMap.clear();
        this.usersById.clear();
        this.requestsMap.clear();
        this.requestsByUser.clear();
        
        parsed.users?.forEach(user => {
            const normalized = this.normalizeUser(user);
            this.usersMap.set(normalized.email, normalized);
            this.usersById.set(normalized.id, normalized);
        });
        
        parsed.requests?.forEach(request => {
            this.requestsMap.set(request.id, request);
            if (!this.requestsByUser.has(request.requesterId)) {
                this.requestsByUser.set(request.requesterId, []);
            }
            this.requestsByUser.get(request.requesterId).push(request);
        });
        
        return parsed;
    },
    
    // Save HashMap data to localStorage
    saveLocalDB(db) {
        const data = {
            users: Array.from(this.usersMap.values()),
            requests: Array.from(this.requestsMap.values())
        };
        localStorage.setItem('localDB', JSON.stringify(data));
    },

    async getStaticDB() {
        try {
            const res = await fetch('db.json');
            if (!res.ok) throw new Error('Static DB not available');
            return await res.json();
        } catch (e) {
            console.warn('Static db.json load failed', e);
            return null;
        }
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
            const users = await this.safeFetch(`${API_URL}/users`);
            // Load into HashMap
            this.usersMap.clear();
            this.usersById.clear();
            const normalizedUsers = users.map(u => this.normalizeUser(u));
            normalizedUsers.forEach(user => {
                this.usersMap.set(user.email, user);
                this.usersById.set(user.id, user);
            });
            return normalizedUsers;
        } catch (e) {
            const staticDB = await this.getStaticDB();
            if (staticDB?.users) {
                this.usersMap.clear();
                this.usersById.clear();
                const normalizedUsers = staticDB.users.map(u => this.normalizeUser(u));
                normalizedUsers.forEach(user => {
                    this.usersMap.set(user.email, user);
                    this.usersById.set(user.id, user);
                });
                return normalizedUsers;
            }
            this.getLocalDB(); // Populate maps from localStorage
            return Array.from(this.usersMap.values());
        }
    },

    async getUserByEmail(email) {
        try {
            const users = await this.safeFetch(`${API_URL}/users?email=${encodeURIComponent(email)}`);
            const user = users[0] || null;
            if (user) {
                const normalized = this.normalizeUser(user);
                this.usersMap.set(email, normalized);
                this.usersById.set(normalized.id, normalized);
                return normalized;
            }
            return null;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            return this.usersMap.get(email) || null;
        }
    },

    async saveUser(user) {
        const newUser = this.normalizeUser({ ...user, id: Date.now().toString(), createdAt: new Date().toISOString() });
        try {
            const savedUser = await this.safeFetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const normalized = this.normalizeUser(savedUser);
            // Add to HashMap and local cache
            this.usersMap.set(normalized.email, normalized);
            this.usersById.set(normalized.id, normalized);
            this.saveLocalDB();
            return normalized;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            this.usersMap.set(newUser.email, newUser);
            this.usersById.set(newUser.id, newUser);
            this.saveLocalDB();
            return newUser;
        }
    },

    async updateUser(user) {
        try {
            const updatedUser = await this.safeFetch(`${API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            const normalized = this.normalizeUser(updatedUser);
            // Update in HashMap and local cache
            this.usersMap.set(normalized.email, normalized);
            this.usersById.set(normalized.id, normalized);
            this.saveLocalDB();
            return normalized;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            const normalized = this.normalizeUser(user);
            this.usersMap.set(normalized.email, normalized);
            this.usersById.set(normalized.id, normalized);
            this.saveLocalDB();
            return normalized;
        }
    },

    // Auth
    async login(email, password) {
        const user = await this.getUserByEmail(email);
        if (user && user.password === password) {
            this.setCurrentUser(this.normalizeUser(user));
            return true;
        }
        return false;
    },

    // Requests
    async getRequestById(reqId) {
        try {
            const request = await this.safeFetch(`${API_URL}/requests/${reqId}`);
            this.requestsMap.set(reqId, request);
            return request;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            return this.requestsMap.get(reqId) || null;
        }
    },

    async getRequests() {
        try {
            const requests = await this.safeFetch(`${API_URL}/requests?_sort=createdAt&_order=desc`);
            // Load into HashMap
            this.requestsMap.clear();
            this.requestsByUser.clear();
            requests.forEach(request => {
                this.requestsMap.set(request.id, request);
                if (!this.requestsByUser.has(request.requesterId)) {
                    this.requestsByUser.set(request.requesterId, []);
                }
                this.requestsByUser.get(request.requesterId).push(request);
            });
            return requests;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            const allRequests = Array.from(this.requestsMap.values());
            return allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    },

    async createRequest(request) {
        const newReq = { ...request, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'active', responses: [] };
        try {
            const savedReq = await this.safeFetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReq)
            });
            // Add to HashMap
            this.requestsMap.set(savedReq.id, savedReq);
            if (!this.requestsByUser.has(savedReq.requesterId)) {
                this.requestsByUser.set(savedReq.requesterId, []);
            }
            this.requestsByUser.get(savedReq.requesterId).push(savedReq);
            return savedReq;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            this.requestsMap.set(newReq.id, newReq);
            if (!this.requestsByUser.has(newReq.requesterId)) {
                this.requestsByUser.set(newReq.requesterId, []);
            }
            this.requestsByUser.get(newReq.requesterId).push(newReq);
            this.saveLocalDB();
            return newReq;
        }
    },

    async getMyRequests(userId) {
        try {
            const requests = await this.safeFetch(`${API_URL}/requests?requesterId=${userId}&_sort=createdAt&_order=desc`);
            // Update HashMap
            requests.forEach(request => {
                this.requestsMap.set(request.id, request);
            });
            if (!this.requestsByUser.has(userId)) {
                this.requestsByUser.set(userId, []);
            }
            this.requestsByUser.set(userId, requests);
            return requests;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            const userRequests = this.requestsByUser.get(userId) || [];
            return userRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    },

    async addResponseToRequest(reqId, responseData) {
        try {
            let request = await this.safeFetch(`${API_URL}/requests/${reqId}`);
            if (!request) return null;
            
            const responses = request.responses || [];
            responses.push(responseData);

            const updated = await this.safeFetch(`${API_URL}/requests/${reqId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses })
            });
            this.requestsMap.set(reqId, updated);
            return updated;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            let request = this.requestsMap.get(reqId);
            if (request) {
                if (!request.responses) request.responses = [];
                request.responses.push(responseData);
                this.requestsMap.set(reqId, request);
                this.saveLocalDB();
                return request;
            }
            return null;
        }
    },

    async resolveRequest(reqId) {
        try {
            const updated = await this.safeFetch(`${API_URL}/requests/${reqId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'fulfilled' })
            });
            this.requestsMap.set(reqId, updated);
            return updated;
        } catch (e) { 
            this.getLocalDB(); // Ensure maps are loaded
            let request = this.requestsMap.get(reqId);
            if (request) {
                request.status = 'fulfilled';
                this.requestsMap.set(reqId, request);
                this.saveLocalDB();
                return request;
            }
            return null;
        }
    }
};
