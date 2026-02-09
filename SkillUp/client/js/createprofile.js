let profileData = {
  interests: [],
  learningTime: '',
  sessionDuration: 60,
  location: '',
  skillLevel: '',
  goals: '',
  profilePicture: null,
  expertiseSkills: '',
  portfolioFiles: []
};

let currentQuestion = 1;
const totalQuestions = 9;

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
  updateProgress();
  setupEventListeners();
});

function setupEventListeners() {
  // Checkbox handling for interests
  document.querySelectorAll('#interestsGroup input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const parent = this.closest('.checkbox-item');
      if (this.checked) {
        parent.classList.add('checked');
        profileData.interests.push(this.value);
      } else {
        parent.classList.remove('checked');
        profileData.interests = profileData.interests.filter(interest => interest !== this.value);
      }
      updateNextButton();
    });
  });

  // Option card handling
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', function() {
      const question = this.closest('.question');
      const questionNum = parseInt(question.dataset.question);
      question.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');

      const value = this.dataset.value;
      switch(questionNum) {
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

  // Duration slider
  document.getElementById('durationSlider').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('durationValue').textContent = value + ' minutes';
    profileData.sessionDuration = parseInt(value);
    updateNextButton();
  });

  // Goals textarea
  document.getElementById('goals').addEventListener('input', function() {
    profileData.goals = this.value;
    updateNextButton();
  });

  // Profile picture
  document.getElementById('profilePicInput').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Profile picture must be less than 5MB');
        return;
      }

      profileData.profilePicture = file;

      const reader = new FileReader();
      reader.onload = function(e) {
        const preview = document.getElementById('profilePicPreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
      };
      reader.readAsDataURL(file);
      updateNextButton();
    }
  });

  // Expertise skills
  document.getElementById('expertiseSkills').addEventListener('input', function() {
    profileData.expertiseSkills = this.value;
    updateNextButton();
  });

  // Portfolio upload
  const portfolioArea = document.getElementById('portfolioUploadArea');
  const portfolioInput = document.getElementById('portfolioInput');

  portfolioArea.addEventListener('click', () => portfolioInput.click());
  portfolioArea.addEventListener('dragover', e => { e.preventDefault(); portfolioArea.classList.add('dragover'); });
  portfolioArea.addEventListener('dragleave', e => { e.preventDefault(); portfolioArea.classList.remove('dragover'); });
  portfolioArea.addEventListener('drop', e => { e.preventDefault(); portfolioArea.classList.remove('dragover'); handlePortfolioFiles(e.dataTransfer.files); });
  portfolioInput.addEventListener('change', function() { handlePortfolioFiles(this.files); });
}

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
  document.getElementById('filePreviewGrid').innerHTML = '';
  profileData.portfolioFiles.forEach((file, newIndex) => addFilePreviewWithIndex(file, newIndex));
  updateNextButton();
}

function addFilePreviewWithIndex(file, index) {
  const previewGrid = document.getElementById('filePreviewGrid');
  const previewItem = document.createElement('div');
  previewItem.className = 'file-preview-item';

  const reader = new FileReader();
  reader.onload = function(e) {
    if (file.type.startsWith('image/')) {
      previewItem.innerHTML = `<img src="${e.target.result}" alt="Preview"><div class="file-name">${file.name}</div><button class="file-remove" onclick="removeFile(${index})">×</button>`;
    } else if (file.type.startsWith('video/')) {
      previewItem.innerHTML = `<video src="${e.target.result}" controls></video><div class="file-name">${file.name}</div><button class="file-remove" onclick="removeFile(${index})">×</button>`;
    } else {
      previewItem.innerHTML = `<div style="padding:40px;font-size:2em;">📄</div><div class="file-name">${file.name}</div><button class="file-remove" onclick="removeFile(${index})">×</button>`;
    }
  };
  reader.readAsDataURL(file);
  previewGrid.appendChild(previewItem);
}

function updateProgress() {
  const progress = (currentQuestion / totalQuestions) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  document.getElementById('progressText').textContent = `Step ${currentQuestion} of ${totalQuestions}`;
}

function updateNextButton() {
  const nextBtn = document.getElementById('nextBtn');
  let canProceed = false;

  switch(currentQuestion) {
    case 1: canProceed = profileData.interests.length > 0; break;
    case 2: canProceed = profileData.learningTime !== ''; break;
    case 3: canProceed = true; break;
    case 4: canProceed = profileData.location !== ''; break;
    case 5: canProceed = profileData.skillLevel !== ''; break;
    case 6: canProceed = true; break;
    case 7: canProceed = profileData.expertiseSkills.trim().length > 20; break;
    case 8: canProceed = true; break;
    case 9: canProceed = profileData.goals.trim().length > 10; nextBtn.textContent = 'Complete Profile'; break;
  }

  nextBtn.disabled = !canProceed;
}

function nextQuestion() {
  if (currentQuestion < totalQuestions) {
    document.querySelector(`.question[data-question="${currentQuestion}"]`).classList.remove('active');
    currentQuestion++;
    document.querySelector(`.question[data-question="${currentQuestion}"]`).classList.add('active');
    document.getElementById('prevBtn').style.visibility = 'visible';
    updateProgress();
    updateNextButton();
  } else {
    completeProfile();
  }
}

function previousQuestion() {
  if (currentQuestion > 1) {
    document.querySelector(`.question[data-question="${currentQuestion}"]`).classList.remove('active');
    currentQuestion--;
    document.querySelector(`.question[data-question="${currentQuestion}"]`).classList.add('active');
    if (currentQuestion === 1) document.getElementById('prevBtn').style.visibility = 'hidden';
    document.getElementById('nextBtn').textContent = 'Next';
    updateProgress();
    updateNextButton();
  }
}

// ------------------ SAVE TO MONGO ------------------
async function completeProfile() {
  try {
    // Convert files to base64
    const profilePicBase64 = profileData.profilePicture ? await fileToBase64(profileData.profilePicture) : null;
    const portfolioBase64 = await Promise.all(profileData.portfolioFiles.map(file => fileToBase64(file)));

    const payload = { ...profileData, profilePicture: profilePicBase64, portfolioFiles: portfolioBase64 };

    const response = await fetch('http://localhost:5000/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      alert('🎉 Profile created successfully!');
      console.log('Saved profile:', result);
      // Optionally redirect
      // window.location.href = 'dashboard.html';
    } else {
      alert('❌ Error saving profile: ' + result.error);
    }
  } catch (err) {
    console.error(err);
    alert('❌ Something went wrong while saving your profile.');
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
