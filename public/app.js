 

async function signUp() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await axios.post('http://localhost:5000/user/signup', { username, email, password });
        alert('Signup successful! Please login.');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Signup failed. Please try again.');
    }
}

async function login() {
    console.log("hello")
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await axios.post('http://localhost:5000/user/login', { email, password });
        localStorage.setItem('token', res.data.token);
        alert('Login successful!');
        window.location.href = 'home.html';
    } catch (error) {
        alert('Invalid email or password.');
    }
}
