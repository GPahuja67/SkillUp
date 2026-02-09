// client/js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('regForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = new FormData(form);
        const payload = { name: f.get('name'), email: f.get('email'), password: f.get('password') };

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let data;
            try { data = await res.json(); } catch (err) { data = { error: 'Invalid JSON response' }; }

            console.log('Register response:', res.status, data);

            if (res.ok) {
                alert('Account created — redirecting to login.');
                window.location.href = 'login.html';
            } else {
                alert(data.error || data.message || 'Registration failed. See console.');
            }
        } catch (err) {
            console.error('Network/Fetch error during register:', err);
            alert('Network error while registering. Is the server running at http://localhost:5000 ?');
        }
    });
});
