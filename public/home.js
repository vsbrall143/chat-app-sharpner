// import { io } from 'socket.io-client';
 


let currentGroupId = null; // Track the selected group ID

// WebSocket connection
const socket = io('https://chat-app-sharpner.onrender.com');

// Listen for real-time messages
socket.on('receiveMessage', (data) => {
  if (data.groupId === currentGroupId) {
    const messagesContainer = document.getElementById('messages');
    const msgDiv = document.createElement('div');
    const token = localStorage.getItem('token');
    const { userId } = parseJwt(token);
    msgDiv.classList.add('message', data.userId === userId ? 'sent' : 'received');
    msgDiv.textContent = data.message;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});



async function createGroup() {
  const groupName = document.getElementById('group-name-input').value.trim();
  const token = localStorage.getItem('token');

  if (!groupName) {
    alert("Please enter a group name.");
    return;
  }

  try {
    const res = await axios.post(
      "https://chat-app-sharpner.onrender.com/groups/create",
      { name: groupName },
      { headers: { Authorization: token } }
    );
    alert("Group created successfully!");
    loadGroups(); // Reload group list
    closeCreateGroupModal(); // Close modal after group creation
  } catch (error) {
    console.error("Error creating group:", error);
    alert("Failed to create group.");
  }
}

async function inviteToGroup() {
  const email = document.getElementById('invite-email-input').value.trim();
  if (!email) {
    alert('Please enter an email address.');
    return;
  }

  const token = localStorage.getItem('token');
  try {
    await axios.post(
      `https://chat-app-sharpner.onrender.com/groups/${currentGroupId}/invite`,
      { email },
      {
        headers: { Authorization: token },
      }
    );
    alert('User invited successfully!');
    closeInviteModal();
  } catch (error) {
    console.error('Error inviting user:', error);
    alert('Failed to invite user. Please try again.');
  }
}


// Load all groups for the logged-in user
async function loadGroups() {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get('https://chat-app-sharpner.onrender.com/groups', {
      headers: { Authorization: token },
    });

    const groupsContainer = document.getElementById('groups');
    groupsContainer.innerHTML = ''; // Clear existing groups

    res.data.groups.forEach((group) => {
      const groupDiv = document.createElement('div');
      groupDiv.classList.add('group');

      groupDiv.innerHTML = `
              ${group.name}
              <button onclick="showInviteModal(${group.id})">Invite</button>
          `;

      groupDiv.addEventListener('click', () => {
        currentGroupId = group.id; // Update the current group ID
        console.log(`Current Group ID: ${currentGroupId}`);
        joinGroup(group.id); // Join WebSocket group
        loadMessages(currentGroupId); // Load messages via REST API
        loadGroupMembers(currentGroupId); // Load group members
      });

      groupsContainer.appendChild(groupDiv);
    });
  } catch (error) {
    console.error('Error loading groups:', error);
    alert('Error loading groups.');
  }
}

// Join a WebSocket group
function joinGroup(groupId) {
  socket.emit('joinGroup', groupId);
}

// Load messages for the selected group (via REST API)
async function loadMessages(groupId) {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get(`https://chat-app-sharpner.onrender.com/groups/${groupId}/messages`, {
      headers: { Authorization: token },
    });

    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = ''; // Clear existing messages

    res.data.messages.forEach((msg) => {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message', msg.userId === res.data.userId ? 'sent' : 'received');
      msgDiv.textContent = msg.message;
      messagesContainer.appendChild(msgDiv);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    console.error('Error loading messages:', error);
    alert('Failed to load messages.');
  }
}

// Send a message (via WebSocket)
function sendMessage() {
  const message = document.getElementById('message-input').value.trim();
  if (!message || !currentGroupId) {
    alert('Please select a group and enter a message.');
    return;
  }

  const token = localStorage.getItem('token');
  const { userId } = parseJwt(token); // Decode JWT to get the userId

  socket.emit('sendMessage', {
    groupId: currentGroupId,
    userId: userId,
    message: message,
  });

  document.getElementById('message-input').value = ''; // Clear input
}

// Load group members (via REST API)
async function loadGroupMembers(groupId) {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get(`https://chat-app-sharpner.onrender.com/groups/${groupId}/members`, {
      headers: { Authorization: token },
    });

    const membersList = document.getElementById('members-list');
    membersList.innerHTML = ''; // Clear existing list

    res.data.members.forEach((member) => {
      const memberItem = document.createElement('li');
      memberItem.textContent = member.username;

      if (member.role === 'admin') {
        memberItem.classList.add('admin');
        memberItem.textContent += ' - Admin';
      }

      if (res.data.isAdmin && member.role !== 'admin') {
        const makeAdminButton = document.createElement('button');
        makeAdminButton.textContent = 'Make Admin';
        makeAdminButton.onclick = () => makeAdmin(groupId, member.id);
        memberItem.appendChild(makeAdminButton);
      }

      if (res.data.isAdmin) {
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removeMember(groupId, member.id);
        memberItem.appendChild(removeButton);
      }

      membersList.appendChild(memberItem);
    });
  } catch (error) {
    console.error('Error loading group members:', error);
    alert('Failed to load group members.');
  }
}

// Promote a member to admin
async function makeAdmin(groupId, memberId) {
  const token = localStorage.getItem('token');
  try {
    await axios.post(`https://chat-app-sharpner.onrender.com/groups/${groupId}/members/${memberId}/make-admin`, {}, {
      headers: { Authorization: token },
    });
    alert('Member promoted to admin.');
    loadGroupMembers(groupId);
  } catch (error) {
    console.error('Error promoting member:', error);
    alert('Failed to promote member.');
  }
}

// Remove a member from the group
async function removeMember(groupId, memberId) {
  const token = localStorage.getItem('token');
  try {
    await axios.delete(`https://chat-app-sharpner.onrender.com/groups/${groupId}/members/${memberId}`, {
      headers: { Authorization: token },
    });
    alert('Member removed from the group.');
    loadGroupMembers(groupId);
  } catch (error) {
    console.error('Error removing member:', error);
    alert('Failed to remove member.');
  }
}

// Show modals for creating groups and inviting users
function showCreateGroupModal() {
  document.getElementById('create-group-modal').style.display = 'block';
}
function closeCreateGroupModal() {
  document.getElementById('create-group-modal').style.display = 'none';
}
function showInviteModal(groupId) {
  currentGroupId = groupId;
  document.getElementById('invite-modal').style.display = 'block';
}
function closeInviteModal() {
  document.getElementById('invite-modal').style.display = 'none';
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

// Utility function to parse JWT
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
}


// Load pending invitations
async function loadPendingInvites() {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      "https://chat-app-sharpner.onrender.com/groups/pending-invites",
      {
        headers: { Authorization: token },
      }
    );

    const pendingInvitesContainer = document.getElementById("pending-invites");
    pendingInvitesContainer.innerHTML = "<h3>Pending Invitations</h3>"; // Add header

    res.data.invites.forEach((invite) => {
      const inviteDiv = document.createElement("div");
      inviteDiv.classList.add("invite");
      inviteDiv.innerHTML = `
        ${invite.groupName}
        <div>
          <button class="accept" onclick="acceptInvite(${invite.groupId})">Accept</button>
          <button class="decline" onclick="declineInvite(${invite.groupId})">Decline</button>
        </div>
      `;
      pendingInvitesContainer.appendChild(inviteDiv);
    });
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    alert("Failed to load pending invitations.");
  }
}

// Accept an invitation
async function acceptInvite(groupId) {
  const token = localStorage.getItem("token");
  try {
    await axios.post(
      `https://chat-app-sharpner.onrender.com/groups/${groupId}/accept-invite`,
      {},
      {
        headers: { Authorization: token },
      }
    );
    alert("Successfully joined the group!");
    loadPendingInvites(); // Reload pending invites
    loadGroups(); // Reload group list
  } catch (error) {
    console.error("Error accepting invite:", error);
    alert("Failed to accept invitation.");
  }
}

// Decline an invitation
async function declineInvite(groupId) {
  const token = localStorage.getItem("token");
  try {
    await axios.post(
      `https://chat-app-sharpner.onrender.com/groups/${groupId}/decline-invite`,
      {},
      {
        headers: { Authorization: token },
      }
    );
    alert("Invitation declined.");
    loadPendingInvites(); // Reload pending invites
  } catch (error) {
    console.error("Error declining invite:", error);
    alert("Failed to decline invitation.");
  }
}


function getUserDetails() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwt_decode(token); // Decode the token
    return {
      username: decoded.username,
      email: decoded.email,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// Initialize the app when the window loads
window.onload = function () {
  const userDetails = getUserDetails();
  loadGroups();
  loadPendingInvites();

  if (userDetails) {
    document.getElementById('user-info').innerHTML = `
      <p>Welcome, ${userDetails.username}</p>
      <p>Email: ${userDetails.email}</p>
    `;
  }
};
