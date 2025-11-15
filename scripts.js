const _config = {
    openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
    openAI_model: "gpt-4o-mini",
    ai_instruction: `You are a helpful JavaScript teacher that provides clear explanations and examples about JavaScript programming. 
Output should be in HTML format, but without using markdown. Keep responses educational and beginner-friendly.`,
    response_id: "",
};

    async function sendOpenAIRequest(text) {
    const requestBody = {
    model: _config.openAI_model,
    input: text,
    instructions: _config.ai_instruction,
  };

  try {
    const response = await fetch(_config.openAI_api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    const output = data.output?.[0]?.content?.[0]?.text || "No response text found.";
    _config.response_id = data.id || "";

    return output;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

    document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - script is running');
    
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    console.log('Elements found:', {
        chatMessages: !!chatMessages,
        messageInput: !!messageInput,
        sendButton: !!sendButton
    });
    
    // Focus on input when page loads
    messageInput.focus();
    
    // Send message when button is clicked
    sendButton.addEventListener('click', function() {
        console.log('Send button clicked!');
        sendMessage();
    });
    
    // Send message when Enter key is pressed
    messageInput.addEventListener('keypress', function(e) {
        console.log('Key pressed:', e.key);
        if (e.key === 'Enter') {
            console.log('Enter key detected, sending message');
            sendMessage();
        }
    });
         async function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;

        addMessage(message, 'user');
        messageInput.value = '';
        messageInput.disabled = true;
        sendButton.disabled = true;
        showTypingIndicator();

        try {
            const botResponse = await sendOpenAIRequest(message);
            removeTypingIndicator();
            addMessage(botResponse, 'bot');
        } catch (error) {
            console.error('Error in sendMessage:', error);
            removeTypingIndicator();
            addMessage("Sorry, I'm having trouble connecting right now.", 'bot');
        } finally {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
            scrollToBottom();
        }
    }


 function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageElement[sender === 'bot' ? 'innerHTML' : 'textContent'] = text;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    function showTypingIndicator() {
        removeTypingIndicator(); // ✅ Prevent duplicates
        const typingElement = document.createElement('div');
        typingElement.classList.add('typing-indicator');
        typingElement.id = 'typingIndicator';
        typingElement.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingElement);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) typingIndicator.remove();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});