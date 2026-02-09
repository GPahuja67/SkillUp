// client/js/createprofile.js
let profileData = {
    interests: [],
    learningTime: '',
    sessionDuration: 60,
    location: '',
    skillLevel: '',
    goals: '',
    profilePicture: null,            // File object
    profilePictureBase64: null,      // data:image/... string
    expertiseSkills: '',
    portfolioFiles: []               // File objects
};

let currentQuestion = 1;
const totalQuestions = 9;

document.addEventListener("DOMContentLoaded", async function () {
    await checkExistingProfile();   // check if user already has a profile
    updateProgress();
    setupEventListeners();
    // ensure preview starts with placeholder
    const profilePicPreview = document.getElementById('profilePicPreview');
    if (profilePicPreview) profilePicPreview.innerHTML = '<span class="profile-pic-placeholder">📷</span>';
});

async function checkExistingProfile() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) return;

    try {
        const res = await fetch("http://localhost:5000/api/profiles", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const profiles = await res.json();
        // handle populated userId objects or plain strings
        const existingProfile = profiles.find(p => String(p.userId?._id || p.userId) === String(userId));
        if (existingProfile) {
            window.location.href = "explore.html";
            return;
        }
    } catch (error) {
        console.log("Profile check failed:", error);
    }
}

function setupEventListeners() {
    // CACHE frequently used elements (after DOM loaded)
    const interestsGroup = document.getElementById('interestsGroup');
    const optionCards = document.querySelectorAll('.option-card');
    const durationSlider = document.getElementById('durationSlider');
    const durationValue = document.getElementById('durationValue');
    const goalsInput = document.getElementById('goals');
    const expertiseInput = document.getElementById('expertiseSkills');
    const portfolioArea = document.getElementById('portfolioUploadArea');
    const portfolioInput = document.getElementById('portfolioInput');
    const profilePicPreview = document.getElementById('profilePicPreview');
    const profilePicInput = document.getElementById('profilePicInput');

    // ------------- Interests (checkboxes) -------------
    if (interestsGroup) {
        interestsGroup.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const parent = this.closest('.checkbox-item');
                if (this.checked) {
                    parent && parent.classList.add('checked');
                    if (!profileData.interests.includes(this.value)) profileData.interests.push(this.value);
                } else {
                    parent && parent.classList.remove('checked');
                    profileData.interests = profileData.interests.filter(i => i !== this.value);
                }
                updateNextButton();
            });
        });
    }

    // ------------- Navigation buttons -------------
    const nextBtnEl = document.getElementById('nextBtn');
    const prevBtnEl = document.getElementById('prevBtn');

    if (nextBtnEl) {
        nextBtnEl.addEventListener('click', (e) => { e.preventDefault(); nextQuestion(); });
    }
    if (prevBtnEl) {
        prevBtnEl.addEventListener('click', (e) => { e.preventDefault(); previousQuestion(); });
    }

    // ------------- Option cards -------------
    if (optionCards) {
        optionCards.forEach(card => {
            card.addEventListener('click', function () {
                const question = this.closest('.question');
                if (!question) return;
                const questionNum = parseInt(question.dataset.question);
                question.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');

                const value = this.dataset.value;
                switch (questionNum) {
                    case 2:
                        profileData.learningTime = value;
                        break;
                    case 4:
                        profileData.location = value;
                        break;
                    case 5:
                        profileData.skillLevel = value;
                        break;
                }
                updateNextButton();
            });
        });
    }

    // ------------- Duration slider -------------
    if (durationSlider && durationValue) {
        durationSlider.addEventListener('input', function () {
            const value = this.value;
            durationValue.textContent = value + ' minutes';
            profileData.sessionDuration = parseInt(value);
            updateNextButton();
        });
    }

    // ------------- Goals textarea -------------
    if (goalsInput) {
        goalsInput.addEventListener('input', function () {
            profileData.goals = this.value;
            updateNextButton();
        });
    }

    // ------------- Expertise skills -------------
    if (expertiseInput) {
        expertiseInput.addEventListener('input', function () {
            profileData.expertiseSkills = this.value;
            updateNextButton();
        });
    }

    // ===========================
    // PROFILE PICTURE UPLOAD (robust & CSP-safe)
    // ===========================
    if (profilePicPreview && profilePicInput) {
        profilePicPreview.addEventListener("click", () => profilePicInput.click());

        profilePicInput.addEventListener("change", function () {
            const file = this.files && this.files[0];
            if (!file) {
                // user cancelled selection
                profilePicPreview.innerHTML = '<span class="profile-pic-placeholder">📷</span>';
                profileData.profilePicture = null;
                profileData.profilePictureBase64 = null;
                updateNextButton();
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Profile picture must be less than 5MB");
                profilePicInput.value = "";
                profilePicPreview.innerHTML = '<span class="profile-pic-placeholder">📷</span>';
                profileData.profilePicture = null;
                profileData.profilePictureBase64 = null;
                updateNextButton();
                return;
            }

            // read file
            const reader = new FileReader();
            reader.onload = function (e) {
                const dataUrl = e.target.result;
                if (!dataUrl) {
                    profilePicPreview.innerHTML = '<span class="profile-pic-placeholder">📷</span>';
                    profileData.profilePicture = null;
                    profileData.profilePictureBase64 = null;
                    updateNextButton();
                    return;
                }

                // build preview image element (no inline onclick)
                profilePicPreview.innerHTML = ''; // clear placeholder
                const img = document.createElement('img');
                img.alt = 'Profile Preview';
                img.src = dataUrl;
                img.style.maxWidth = '120px';
                img.style.maxHeight = '120px';
                img.style.borderRadius = '10px';
                img.style.objectFit = 'cover';
                profilePicPreview.appendChild(img);

                profileData.profilePicture = file;
                profileData.profilePictureBase64 = dataUrl;
                updateNextButton();
            };

            reader.onerror = function (err) {
                console.error('FileReader error', err);
                alert('Failed to read file. Try another image.');
                profilePicPreview.innerHTML = '<span class="profile-pic-placeholder">📷</span>';
                profileData.profilePicture = null;
                profileData.profilePictureBase64 = null;
                profilePicInput.value = "";
                updateNextButton();
            };

            reader.readAsDataURL(file);
        });
    }

    // ===========================
    // Portfolio upload (drag/drop + previews)
    // ===========================
    if (portfolioArea && portfolioInput) {
        portfolioArea.addEventListener('click', () => portfolioInput.click());
        portfolioArea.addEventListener('dragover', e => { e.preventDefault(); portfolioArea.classList.add('dragover'); });
        portfolioArea.addEventListener('dragleave', e => { e.preventDefault(); portfolioArea.classList.remove('dragover'); });
        portfolioArea.addEventListener('drop', e => { e.preventDefault(); portfolioArea.classList.remove('dragover'); handlePortfolioFiles(e.dataTransfer.files); });
        portfolioInput.addEventListener('change', function () { handlePortfolioFiles(this.files); });
    }
}

// Portfolio helpers
function handlePortfolioFiles(files) {
    Array.from(files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) { alert(`File "${file.name}" is too large. Max 10MB.`); return; }
        if (profileData.portfolioFiles.length >= 10) { alert('Maximum 10 files allowed'); return; }

        profileData.portfolioFiles.push(file);
        addFilePreview(file);
    });
    updateNextButton();
}

function addFilePreview(file) {
    const fileIndex = profileData.portfolioFiles.length - 1;
    addFilePreviewWithIndex(file, fileIndex);
}

function removeFile(index) {
    profileData.portfolioFiles.splice(index, 1);
    const grid = document.getElementById('filePreviewGrid');
    if (!grid) return;
    grid.innerHTML = '';
    profileData.portfolioFiles.forEach((file, newIndex) => addFilePreviewWithIndex(file, newIndex));
    updateNextButton();
}

function addFilePreviewWithIndex(file, index) {
    const previewGrid = document.getElementById('filePreviewGrid');
    if (!previewGrid) return;

    const previewItem = document.createElement('div');
    previewItem.className = 'file-preview-item';

    const reader = new FileReader();
    reader.onload = function (e) {
        // clear content and build elements
        previewItem.innerHTML = ''; // ensure empty
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            previewItem.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const vid = document.createElement('video');
            vid.src = e.target.result;
            vid.controls = true;
            previewItem.appendChild(vid);
        } else {
            const fileIcon = document.createElement('div');
            fileIcon.style.padding = '40px';
            fileIcon.style.fontSize = '2em';
            fileIcon.textContent = '📄';
            previewItem.appendChild(fileIcon);
        }

        const nameDiv = document.createElement('div');
        nameDiv.className = 'file-name';
        nameDiv.textContent = file.name;
        previewItem.appendChild(nameDiv);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-remove';
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => removeFile(index));
        previewItem.appendChild(removeBtn);
    };

    reader.readAsDataURL(file);
    previewGrid.appendChild(previewItem);
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = progress + '%';
    if (text) text.textContent = `Step ${currentQuestion} of ${totalQuestions}`;
}

function updateNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) return;
    let canProceed = false;

    switch (currentQuestion) {
        case 1: canProceed = profileData.interests.length > 0; break;
        case 2: canProceed = profileData.learningTime !== ''; break;
        case 3: canProceed = true; break;
        case 4: canProceed = profileData.location !== ''; break;
        case 5: canProceed = profileData.skillLevel !== ''; break;
        case 6: canProceed = true; break;
        case 7: canProceed = (profileData.expertiseSkills || '').trim().length > 20; break;
        case 8: canProceed = true; break;
        case 9:
            canProceed = (profileData.goals || '').trim().length > 10;
            nextBtn.textContent = 'Complete Profile';
            break;
        default:
            canProceed = true;
    }

    // reset text if not last
    if (currentQuestion !== 9) nextBtn.textContent = 'Next';
    nextBtn.disabled = !canProceed;
}

function nextQuestion() {
    const currentEl = document.querySelector(`.question[data-question="${currentQuestion}"]`);
    if (currentQuestion < totalQuestions && currentEl) {
        currentEl.classList.remove('active');
        currentQuestion++;
        const nextEl = document.querySelector(`.question[data-question="${currentQuestion}"]`);
        if (nextEl) nextEl.classList.add('active');
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) prevBtn.style.visibility = 'visible';
        updateProgress();
        updateNextButton();
    } else {
        completeProfile();
    }
}

function previousQuestion() {
    if (currentQuestion > 1) {
        const currentEl = document.querySelector(`.question[data-question="${currentQuestion}"]`);
        currentEl && currentEl.classList.remove('active');
        currentQuestion--;
        const prevEl = document.querySelector(`.question[data-question="${currentQuestion}"]`);
        prevEl && prevEl.classList.add('active');
        const prevBtn = document.getElementById('prevBtn');
        if (currentQuestion === 1 && prevBtn) prevBtn.style.visibility = 'hidden';
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) nextBtn.textContent = 'Next';
        updateProgress();
        updateNextButton();
    }
}

// ------------------ SAVE TO MONGO ------------------
async function completeProfile() {
    try {
        // Convert files to base64 (use cached base64 if available)
        const profilePicBase64 = profileData.profilePictureBase64
            ? profileData.profilePictureBase64
            : (profileData.profilePicture ? await fileToBase64(profileData.profilePicture) : null);

        const portfolioBase64 = await Promise.all(
            profileData.portfolioFiles.map(file => fileToBase64(file))
        );

        const payload = {
            interests: profileData.interests,
            learningTime: profileData.learningTime,
            sessionDuration: profileData.sessionDuration,
            location: profileData.location,
            skillLevel: profileData.skillLevel,
            goals: profileData.goals,
            profilePicture: profilePicBase64,
            expertiseSkills: profileData.expertiseSkills,
            portfolioFiles: portfolioBase64
        };

//        const userId = localStorage.getItem("userId");
//        payload.userId = userId;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("❌ No login token found. Please log in again.");
            return;
        }

        const response = await fetch("http://localhost:5000/api/profiles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            // Save profile picture for navbar (if returned from server, prefer that)
            if (result.profile && result.profile.profilePicture) {
                localStorage.setItem("profilePic", result.profile.profilePicture);
            } else if (payload.profilePicture) {
                localStorage.setItem("profilePic", payload.profilePicture);
            }

            alert("🎉 Profile created successfully!");
            console.log("Saved profile:", result);
            window.location.href = "explore.html";
        } else {
            alert("❌ Error saving profile: " + (result.error || result.message || JSON.stringify(result)));
        }
    } catch (err) {
        console.error(err);
        alert("❌ Something went wrong while saving your profile.");
    }
}

// Helper: file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
        reader.readAsDataURL(file);
    });
}
