let currentGroupId; // Track the selected group ID

async function loadGroups() {
  const token = localStorage.getItem('token');
  try {
      const res = await axios.get('http://localhost:3000/groups', { headers: { Authorization: token } });
      const groupsContainer = document.getElementById('groups');
      groupsContainer.innerHTML = '';
      res.data.groups.forEach(group => {
          const groupDiv = document.createElement('div');
          groupDiv.classList.add('group');
          groupDiv.textContent = group.name;
          groupDiv.onclick = () => loadMessages(group.id);
          groupsContainer.appendChild(groupDiv);
      });
  } catch (error) {
      alert('Error loading groups.');
  }
}

window.onload(loadGroups());

// Load messages for the selected group
async function loadMessages(groupId) {
  currentGroupId = groupId; // Update the current group ID

  const token = localStorage.getItem('token');
  try {
      const res = await axios.get(`http://localhost:3000/groups/${groupId}/messages`, {
          headers: { Authorization: token }
      });

      const messagesContainer = document.getElementById('messages');
      messagesContainer.innerHTML = ''; // Clear existing messages

      res.data.messages.forEach(msg => {
          const msgDiv = document.createElement('div');
          msgDiv.classList.add('message', msg.userId === res.data.userId ? 'sent' : 'received');
          msgDiv.textContent = msg.message;
          messagesContainer.appendChild(msgDiv);
      });

      messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the latest message
  } catch (error) {
      console.error('Error loading messages:', error);
      alert('Failed to load messages. Please try again.');
  }
}


// async function sendMessage() {
//   const message = document.getElementById('message-input').value.trim();
//   const groupId = 1; // Replace with dynamic group ID
//   const token = localStorage.getItem('token');
//   if (!message) return;
//   try {
//       await axios.post(`http://localhost:3000/groups/${groupId}/messages`, { message }, { headers: { Authorization: token } });
//       document.getElementById('message-input').value = '';
//       loadMessages(groupId);
//   } catch (error) {
//       alert('Error sending message.');
//   }
// }

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}


// Show the "Create Group" modal
function showCreateGroupModal() {
  document.getElementById('create-group-modal').style.display = 'block';
}

// Close the "Create Group" modal
function closeCreateGroupModal() {
  document.getElementById('create-group-modal').style.display = 'none';
}

// Create a new group
async function createGroup() {
  const groupName = document.getElementById("group-name-input").value.trim();
  const token = localStorage.getItem("token");

  if (!groupName) {
      alert("Please enter a group name.");
      return;
  }

  try {
      const res = await axios.post(
          "http://localhost:3000/groups/create",
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


let selectedGroupId; // Store the current group ID for which the invite is being sent

// Show the "Invite to Group" modal
function showInviteModal(groupId) {
    selectedGroupId = groupId; // Store the group ID
    document.getElementById('invite-modal').style.display = 'block';
}

// Close the "Invite to Group" modal
function closeInviteModal() {
    document.getElementById('invite-modal').style.display = 'none';
    selectedGroupId = null; // Reset the group ID
}

// Send an invitation to a user
async function inviteToGroup() {
    const email = document.getElementById('invite-email-input').value.trim();
    if (!email) {
        alert('Please enter an email address.');
        return;
    }

    const token = localStorage.getItem('token');
    try {
        await axios.post(`http://localhost:3000/groups/${selectedGroupId}/invite`, { email }, {
            headers: { Authorization: token }
        });
        alert('User invited successfully!');
        closeInviteModal();
    } catch (error) {
        console.error('Error inviting user:', error);
        alert('Failed to invite user. Please try again.');
    }
}



// Send a message in the current group
async function sendMessage() {
    const message = document.getElementById('message-input').value.trim();
    if (!message) {
        alert('Please enter a message.');
        return;
    }

    const token = localStorage.getItem('token');
    try {
        await axios.post(`http://localhost:3000/groups/${currentGroupId}/messages`, { message }, {
            headers: { Authorization: token }
        });
        document.getElementById('message-input').value = ''; // Clear the input
        loadMessages(currentGroupId); // Reload messages
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}

// Load pending invitations
async function loadPendingInvites() {
  const token = localStorage.getItem('token');
  try {
      const res = await axios.get('http://localhost:3000/groups/pending-invites', {
          headers: { Authorization: token }
      });

      const pendingInvitesContainer = document.getElementById('pending-invites');
      pendingInvitesContainer.innerHTML = '<h3>Pending Invitations</h3>'; // Clear existing invites and add header

      res.data.invites.forEach(invite => {
          const inviteDiv = document.createElement('div');
          inviteDiv.classList.add('invite');
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
      console.error('Error fetching pending invites:', error);
      alert('Failed to load pending invitations.');
  }
}

// Accept an invitation
async function acceptInvite(groupId) {
  const token = localStorage.getItem('token');
  try {
      await axios.post(`http://localhost:3000/groups/${groupId}/accept-invite`, {}, {
          headers: { Authorization: token }
      });
      alert('Successfully joined the group!');
      loadPendingInvites(); // Reload pending invites
      loadGroups(); // Reload group list
  } catch (error) {
      console.error('Error accepting invite:', error);
      alert('Failed to accept invitation.');
  }
}

// Decline an invitation
async function declineInvite(groupId) {
  const token = localStorage.getItem('token');
  try {
      await axios.post(`http://localhost:3000/groups/${groupId}/decline-invite`, {}, {
          headers: { Authorization: token }
      });
      alert('Invitation declined.');
      loadPendingInvites(); // Reload pending invites
  } catch (error) {
      console.error('Error declining invite:', error);
      alert('Failed to decline invitation.');
  }
}

// Call this function on page load to show pending invitations
loadPendingInvites();


async function loadGroupMembers(groupId) {
  const token = localStorage.getItem('token');
  try {
      const res = await axios.get(`http://localhost:3000/groups/${groupId}/members`, {
          headers: { Authorization: token },
      });

      const membersList = document.getElementById('members-list');
      membersList.innerHTML = ''; // Clear existing list

      res.data.members.forEach(member => {
          const memberItem = document.createElement('li');
          memberItem.textContent = member.username;

          // Mark the admin
          if (member.role === 'admin') {
              memberItem.classList.add('admin');
          }

          membersList.appendChild(memberItem);
      });
  } catch (error) {
      console.error('Error loading group members:', error);
      alert('Failed to load group members.');
  }
}


function showCreateGroupModal() {
  document.getElementById("create-group-modal").style.display = "block";
}

// Close Create Group Modal
function closeCreateGroupModal() {
  document.getElementById("create-group-modal").style.display = "none";
}
