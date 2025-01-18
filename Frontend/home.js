let currentGroupId = null; // Track the selected group ID

// Load all groups for the logged-in user
async function loadGroupMembers(groupId) {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      `http://localhost:3000/groups/${groupId}/members`,
      {
        headers: { Authorization: token },
      }
    );

    const membersList = document.getElementById("members-list");
    membersList.innerHTML = ""; // Clear existing list

    res.data.members.forEach((member) => {
      const memberItem = document.createElement("li");
      memberItem.textContent = member.username;

      // Mark the admin
      if (member.role === "admin") {
        memberItem.classList.add("admin");
        memberItem.textContent += "-Admin";
      }

      // Add "Make Admin" button if the current user is an admin and the member is not already an admin
      if (res.data.isAdmin && member.role !== "admin") {
        const makeAdminButton = document.createElement("button");
        makeAdminButton.textContent = "Make Admin";
        makeAdminButton.onclick = () => makeAdmin(groupId, member.id);
        memberItem.appendChild(makeAdminButton);
      }

      // Add "Remove Member" button if the current user is an admin
      if (res.data.isAdmin) {
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.onclick = () => removeMember(groupId, member.id);
        memberItem.appendChild(removeButton);
      }

      membersList.appendChild(memberItem);
    });
  } catch (error) {
    console.error("Error loading group members:", error);
    alert("Failed to load group members.");
  }
}

async function loadGroups() {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get("http://localhost:3000/groups", {
      headers: { Authorization: token },
    });

    console.log("Groups:", res.data.groups); // Debug: Log the groups data

    const groupsContainer = document.getElementById("groups");
    groupsContainer.innerHTML = ""; // Clear existing groups

    res.data.groups.forEach((group) => {
      const groupDiv = document.createElement("div");
      groupDiv.classList.add("group");

      groupDiv.innerHTML = `
              ${group.name}
              <button onclick="showInviteModal(${group.id})">Invite</button>
          `;
      // Attach an event listener to the groupDiv to handle group selection
      groupDiv.addEventListener("click", () => {
        currentGroupId = group.id; // Update the current group ID
        console.log(`Current Group ID: ${currentGroupId}`); // Debugging: Log the selected group ID

        // Load messages and members for the selected group
        loadMessages(currentGroupId);
        loadGroupMembers(currentGroupId);
      });
 

      groupsContainer.appendChild(groupDiv);
    });
  } catch (error) {
    console.error("Error loading groups:", error);
    alert("Error loading groups.");
  }
}

async function makeAdmin(groupId, memberId) {
  const token = localStorage.getItem("token");
  try {
    await axios.post(
      `http://localhost:3000/groups/${groupId}/members/${memberId}/make-admin`,
      {},
      {
        headers: { Authorization: token },
      }
    );
    alert("Member successfully promoted to admin.");
    loadGroupMembers(groupId); // Reload the group members list
  } catch (error) {
    console.error("Error promoting member to admin:", error);
    alert("Failed to promote member to admin.");
  }
}

async function removeMember(groupId, memberId) {
  const token = localStorage.getItem("token");
  try {
    console.log("delete user called");
    await axios.delete(
      `http://localhost:3000/groups/${groupId}/members/${memberId}`,
      {
        headers: { Authorization: token },
      }
    );
    alert("Member successfully removed from the group.");
    loadGroupMembers(groupId); // Reload the group members list
  } catch (error) {
    console.error("Error removing member from group:", error);
    alert("Failed to remove member from the group.");
  }
}

// Load messages for the selected group
async function loadMessages(groupId) {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      `http://localhost:3000/groups/${groupId}/messages`,
      {
        headers: { Authorization: token },
      }
    );

    const messagesContainer = document.getElementById("messages");
    messagesContainer.innerHTML = ""; // Clear existing messages

    res.data.messages.forEach((msg) => {
      console.log(msg.userId, "----->", res.data.userId);
      const msgDiv = document.createElement("div");
      msgDiv.classList.add(
        "message",
        msg.userId === res.data.userId ? "sent" : "received"
      );
      msgDiv.textContent = msg.message;
      messagesContainer.appendChild(msgDiv);
    });

    // Scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    console.error("Error loading messages:", error);
    alert("Failed to load messages. Please try again.");
  }
}

// Send a message in the current group
async function sendMessage() {
  const message = document.getElementById("message-input").value.trim();
  if (!message) {
    alert("Please enter a message.");
    return;
  }

  const token = localStorage.getItem("token");
  try {
    await axios.post(
      `http://localhost:3000/groups/${currentGroupId}/messages`,
      { message },
      {
        headers: { Authorization: token },
      }
    );
    document.getElementById("message-input").value = ""; // Clear the input
    loadMessages(currentGroupId); // Reload messages
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message. Please try again.");
  }
}

// Show the "Create Group" modal
function showCreateGroupModal() {
  document.getElementById("create-group-modal").style.display = "block";
}

// Close the "Create Group" modal
function closeCreateGroupModal() {
  document.getElementById("create-group-modal").style.display = "none";
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

// Show the "Invite to Group" modal
function showInviteModal(groupId) {
  currentGroupId = groupId; // Store the current group ID
  document.getElementById("invite-modal").style.display = "block";
}

// Close the "Invite to Group" modal
function closeInviteModal() {
  document.getElementById("invite-modal").style.display = "none";
}

// Send an invitation to a user
async function inviteToGroup() {
  const email = document.getElementById("invite-email-input").value.trim();
  if (!email) {
    alert("Please enter an email address.");
    return;
  }

  const token = localStorage.getItem("token");
  try {
    await axios.post(
      `http://localhost:3000/groups/${currentGroupId}/invite`,
      { email },
      {
        headers: { Authorization: token },
      }
    );
    alert("User invited successfully!");
    closeInviteModal();
  } catch (error) {
    console.error("Error inviting user:", error);
    alert("Failed to invite user. Please try again.");
  }
}

// Load pending invitations
async function loadPendingInvites() {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(
      "http://localhost:3000/groups/pending-invites",
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
      `http://localhost:3000/groups/${groupId}/accept-invite`,
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
      `http://localhost:3000/groups/${groupId}/decline-invite`,
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

 
function logout() {
  // Remove the user's token from localStorage
  localStorage.removeItem("token");

  // Redirect the user to the login page
  window.location.href = "index.html"; // Change 'index.html' to your login page file name if needed
}

// Call necessary functions on page load
 


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
