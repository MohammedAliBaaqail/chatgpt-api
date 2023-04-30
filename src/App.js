import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';



function App() {
  
  const API_KEY = process.env.REACT_APP_KEY;

  const [sysMessage, setSysMessage] = useState('');
  const [data, setData] = useState([]);
  const systemMessage = {
    "role": "system", "content": sysMessage
  }


  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! You can ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
      cost: null
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user",
      cost: null
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);


    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { 


    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });



    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage, 
        ...apiMessages 
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT",
        cost: true,
        completion_tokens: data.usage.completion_tokens,
        prompt_tokens: data.usage.prompt_tokens,
        total_tokens: data.usage.total_tokens
      }]);
      setData(data);
      setIsTyping(false);
    });
  }
 console.log(messages[0].cost,"messages")
  return (
    <div className="App">
      <div id="container">
      
        <h2>System Prompt</h2>
        <p>The system prompt for the ChatGPT API is the initial text or message that is provided by the user to the API in order to generate a response from the ChatGPT model.
           The system prompt can be thought of as the input or query that the model uses to generate its response.
            The quality and specificity of the system prompt can have a significant impact on the relevance and accuracy of the model's response. Therefore,
           it is important to provide a clear and concise system prompt that accurately conveys the user's intended message or question.
           <a href='https://www.greataiprompts.com/prompts/best-system-prompts-for-chatgpt/' target='_blank'> See exambles of system prompts here</a></p>
        <input type="text" placeholder="Type your system prompt here"  onChange={(e) => setSysMessage(e.target.value)} />
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is processing" /> : null}
            >
              {messages.map((message, i) => {
                
                return(
                  <>
               
                  <div className='msg'>
                  <Message key={i} model={message}  />
                  <div className='msg-cost'>
                    {message.total_tokens? <p>Total Tokens Cost: {message.total_tokens}</p>:null}
                  
                  </div>
                  </div>
                  </>

                )
                 
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
    
      </div>
    </div>
  )
}

export default App
