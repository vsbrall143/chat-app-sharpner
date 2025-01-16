const notyf = new Notyf();

async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value;

    if (message.trim()) {
        const messages = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.classList.add('message', 'sent');
        messages.appendChild(messageDiv);
        
        // Clear the input field
        input.value = '';
        messages.scrollTop = messages.scrollHeight;

        // Get the token from local storage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not logged in.');
            return;
        }

        const messageDetails = {
            message: message,
        };

        try {
            const token= localStorage.getItem('token');
            console.log(token);
            const res = await axios.post('http://localhost:3000/messages',messageDetails, {headers:{"Authorization" : token}})
            console.log(res);
            notyf.success('Message sent successfully!');


        } catch (error) {
            if (error.response && error.response.data) {
 
                alert(error.response.data.message);
            } else {
                notyf.error('Error sending message. Please try again.');
            }
            console.error("Error during message sending:", error);
        }
    } else {
        notyf.warning('Please type a message before sending.');
    }
}






// Helper function to update local storage
function updateLocalStorage(newMessages) {
  const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
  
  // Add new messages and remove duplicates
  const allMessages = [...storedMessages, ...newMessages];
  const uniqueMessages = Array.from(new Map(allMessages.map(msg => [msg.id, msg])).values()); //This effectively removes duplicate messages based on their id.

  // Keep only the recent 10 messages
  const recentMessages = uniqueMessages.slice(-10);

  // Save back to local storage
  localStorage.setItem('messages', JSON.stringify(recentMessages));
}

// Helper function to display messages on the frontend
function displayMessages(messages) {
  const messagesContainer = document.getElementById('messages');

  // Clear existing messages
  messagesContainer.innerHTML = '';

  // Append messages to the container
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'received');
    
    // Create the email and message content
    const emailContent = document.createElement('div');
    emailContent.textContent = `From: ${message.email}`;
    const messageContent = document.createElement('div');
    messageContent.textContent = message.message;

    // Append the email and message content
    messageDiv.appendChild(emailContent);
    messageDiv.appendChild(messageContent);

    // Append to the container
    messagesContainer.appendChild(messageDiv);
  });
}


// Load messages on page load
async function loadMessages() {
  try {
    // Fetch stored messages from local storage
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    displayMessages(storedMessages);

    // Fetch new messages from the backend
    const lastMessageId = storedMessages.length ? storedMessages[storedMessages.length - 1].id : 0;
    const res = await axios.get(`http://localhost:3000/messages?lastMessageId=${lastMessageId}`, {
      headers: {
        "Authorization": localStorage.getItem('token')
      }
    });

    // Update local storage with new messages
    const newMessages = res.data.messages;
    if (newMessages.length) {
      updateLocalStorage(newMessages);
      displayMessages([...storedMessages, ...newMessages].slice(-10));  //This line merges storedMessages and newMessages into one array, takes only the last 10 messages from it using .slice(-10), and displays them on the frontend.
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    alert('Failed to load messages. Please try again later.');
  }
}

// Reload messages every second
setInterval(loadMessages, 50000);
window.onload = loadMessages;