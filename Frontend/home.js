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







async function loadMessages() {
    try {
      // Send a GET request to fetch all messages
      const res = await axios.get('http://localhost:3000/messages', {
        headers: {
          "Authorization": localStorage.getItem('token') // Send token if necessary for authentication
        }
      });
  
      // Get the messages from the response
      const messages = res.data.messages;
  
      // Get the container where messages will be displayed
      const messagesContainer = document.getElementById('messages');
      
      // Clear any existing messages
      messagesContainer.innerHTML = '';
  
      // Loop through the messages and display each one
      messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'received');
        
        // Create the email and message content
        const messageContent = document.createElement('div');
        messageContent.textContent = message.message; // Message content
  
        const emailContent = document.createElement('div');
        emailContent.textContent = `From: ${message.email}`; // Display email
  
        // Append the email and message content
        messageDiv.appendChild(emailContent);
        messageDiv.appendChild(messageContent);
  
        // Append the message div to the container
        messagesContainer.appendChild(messageDiv);
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      alert('Failed to load messages. Please try again later.');
    }
  }
  

  window.onload = loadMessages;