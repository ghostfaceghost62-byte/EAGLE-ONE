// Initialize database safely
let users = JSON.parse(localStorage.getItem('eagle_users')) || [];

if (users.length === 0) {
    users = [{ username: 'admin', password: '1234', role: 'admin' }];
    localStorage.setItem('eagle_users', JSON.stringify(users));
}

// LOGIN
function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const error = document.getElementById('auth-error');

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('eagle_active_user', JSON.stringify(user));
        // Use replace() to prevent hitting 'back' to return to login
        window.location.replace(user.role === 'admin' ? 'admin.html' : 'shop.html');
    } else {
        error.innerText = "ACCESS DENIED: INVALID CREDENTIALS";
        error.classList.remove('hidden');
    }
}

// REGISTER
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const error = document.getElementById('reg-error');

    if (!username || !password) {
        error.innerText = "ALL FIELDS REQUIRED";
        error.classList.remove('hidden');
        return;
    }

    if (users.find(u => u.username === username)) {
        error.innerText = "OPERATOR ID ALREADY EXISTS";
        error.classList.remove('hidden');
        return;
    }

    users.push({ username, password, role: 'user' });
    localStorage.setItem('eagle_users', JSON.stringify(users));

    alert("REGISTRATION SUCCESSFUL. UPLINK ESTABLISHED.");
    window.location.replace("login.html");
}