const socket = io();

const chatList = document.getElementById("chatList");
const chatBox = document.getElementById("chatBox");
const header = document.getElementById("activeChatHeader");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const params = new URLSearchParams(window.location.search);
const autoChatUser = params.get("chat");

const userId = localStorage.getItem("userId");
let activeRoom = null;

/* TEMP DEMO USERS */
const users = [
  { id: "u1", name: "Aarav", online: true },
  { id: "u2", name: "Simran", online: false },
  { id: "u3", name: "Rohan", online: true }
];

function renderChatList() {
  chatList.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.innerHTML = `
      <img src="https://i.pravatar.cc/150?u=${u.id}">
      <span class="name">${u.name}</span>
      <span class="status ${u.online ? "online" : "offline"}"></span>
    `;
    div.onclick = () => openChat(u);
    chatList.appendChild(div);
  });
}

function openChat(user) {
  activeRoom = [userId, user.id].sort().join("_");
  header.innerText = user.name || "Chat";
  chatBox.innerHTML = "";
  socket.emit("joinRoom", activeRoom);
}

sendBtn.onclick = sendMessage;

function sendMessage() {
  if (!input.value || !activeRoom) return;

  const msg = input.value;
  addMessage(msg, "me");

  socket.emit("sendMessage", {
    room: activeRoom,
    sender: userId,
    message: msg
  });

  input.value = "";
}

socket.on("receiveMessage", data => {
  if (data.room === activeRoom && data.sender !== userId) {
    addMessage(data.message, "other");
  }
});

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

renderChatList();

if (autoChatUser) {
  openChat({ id: autoChatUser, name: "Chat" });
}
