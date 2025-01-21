 

// Handle Sign Up
async function signUp() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await axios.post('https://chat-app-sharpner.onrender.com/user/signup', { username, email, password });
        alert('Signup successful! Please login.');
        showLogin();
    } catch (error) {
        alert('Signup failed. Please try again.');
    }
}

// Handle Login
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await axios.post('https://chat-app-sharpner.onrender.com/user/login', { email, password });
        localStorage.setItem('token', res.data.token);
        alert('Login successful!');
        window.location.href = 'home.html';  // Redirect to chat page
    } catch (error) {
        alert('Invalid email or password.');
    }
}
