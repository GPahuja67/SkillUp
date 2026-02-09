let conversationState = {
  greeted: false,
  step: 0
};

// socket only for REAL users
const socket = io("http://localhost:5000");

// ----------- PARAMS -----------
const params = new URLSearchParams(window.location.search);
const room = params.get("profile") || "Skill Partner";
const isDemoChat = room.startsWith("demo-");

// ----------- PROFILE META (DEMO DATA MAP) -----------
const demoProfileMap = {
  "demo-pseudo-1": { name: "UI/UX Designer", pic: "/assets/p1.jpeg" },
  "demo-pseudo-2": { name: "Full Stack Dev", pic: "/assets/p2.jpeg" },
  "demo-pseudo-3": { name: "Mobile App Dev", pic: "/assets/p3.jpg" },
  "demo-pseudo-4": { name: "Data Scientist", pic: "/assets/p4.jpg" }
};

const header = document.getElementById("chatUser");
const statusEl = document.createElement("div");
statusEl.className = "chat-status";

header.innerHTML = "";
header.appendChild(statusEl);

// ----------- HEADER SETUP -----------
let chatName = "Skill Partner";
let chatPic = "/assets/default-avatar.png";

if (isDemoChat) {
  const demo = demoProfileMap[room];
  if (demo) {
    chatName = demo.name;
    chatPic = demo.pic;
  }
  statusEl.innerText = "🟢 Online";
} else {
  statusEl.innerText = "🟢 Online";
  socket.emit("joinRoom", room);
}

header.innerHTML = `
  <img src="${chatPic}" class="chat-header-pic" />
  <div>
    <div class="chat-title">${chatName}</div>
    <div class="chat-status">${statusEl.innerText}</div>
  </div>
`;

// ----------- INPUT -----------
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

// ----------- SEND MESSAGE -----------
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "you");
  saveHistory(text, "you");

  if (!isDemoChat) {
    socket.emit("sendMessage", { room, sender: "You", message: text });
  }

  input.value = "";

  // AI reply (demo OR fallback)
  setTimeout(() => {
    const reply = generateAIReply(chatName, text);
    addMessage(reply, "other");
    saveHistory(reply, "other");
  }, 800);
}

// ----------- RECEIVE (REAL USERS) -----------
socket.on("receiveMessage", (data) => {
  if (data.sender !== "You") {
    addMessage(data.message, "other");
    saveHistory(data.message, "other");
  }
});

// ----------- MESSAGE UI -----------
function addMessage(text, type) {
  const box = document.getElementById("messages");

  const row = document.createElement("div");
  row.className = `message-row ${type}`;

  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.innerHTML = `
    <div class="msg-text">${text}</div>
    <div class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;

  row.appendChild(msg);
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
}

// ----------- PERSIST HISTORY (LOCAL) -----------
function saveHistory(text, type) {
  const key = `chat_${room}`;
  const history = JSON.parse(localStorage.getItem(key) || "[]");
  history.push({ text, type, time: Date.now() });
  localStorage.setItem(key, JSON.stringify(history));
}

(function loadHistory() {
  const key = `chat_${room}`;
  const history = JSON.parse(localStorage.getItem(key) || "[]");
  history.forEach(m => addMessage(m.text, m.type));
})();

// ----------- PREDICTABLE AI LOGIC -----------
function generateAIReply(skill, userMsg) {
  const flows = [
    `Nice to meet you 😊 What’s your experience with ${skill}?`,
    `That’s interesting! What are you trying to achieve in ${skill}?`,
    `Most people struggle at the beginning — consistency helps a lot.`,
    `Would you like resource suggestions or project ideas?`,
    `Small projects are the best way to grow in ${skill}.`
  ];

  const reply = flows[conversationState.step % flows.length];
  conversationState.step++;
  return reply;
}
