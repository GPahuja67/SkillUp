// client/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('logForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = new FormData(form);

        try {
            // -------------------------
            // 1) LOGIN CALL
            // -------------------------
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: f.get('email'),
                    password: f.get('password')
                })
            });

            const data = await res.json();
            console.log("Login response:", data);

            if (!res.ok) {
                alert(data.error || "Invalid credentials");
                return;
            }

            // -------------------------
            // 2) SAVE TOKEN + USER
            // -------------------------
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("userId", data.user._id);

            const token = data.token;
            const userId = data.user._id;

            // -------------------------
            // 3) FETCH ALL PROFILES
            // -------------------------
            const profilesRes = await fetch('/api/profiles', {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const profiles = await profilesRes.json();

            // -------------------------
            // 4) FIND USER PROFILE
            // -------------------------
            const existingProfile = profiles.find(p => String(p.userId?._id || p.userId) === String(userId));

            if (existingProfile) {
                console.log("Profile exists:", existingProfile);

                // Save profile picture locally for navbar
                if (existingProfile.profilePicture) {
                    localStorage.setItem("profilePic", existingProfile.profilePicture);
                }

                window.location.href = "dashboard.html";
                return;
            }

            // -------------------------
            // 5) IF NO PROFILE — ASK USER
            // -------------------------
            const goCreate = window.confirm("New to SkillUp? Do you want to create your profile now?");
            if (goCreate) {
                window.location.href = "createprofile.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } catch (err) {
            console.error("Login error:", err);
            alert("⚠️ Server not responding. Check if backend is running.");
        }
    });
});
