import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useState } from "react";

interface MessageModel {
  message: string;
  sender: string;
  direction?: string;
}

const API_KEY = import.meta.env.VITE_API_KEY;

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<MessageModel[]>([
    {
      message: "Greetings, how can I assist you?",
      sender: "ChatGPT",
    },
  ]);

  const handleSend = async (message: string) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };
    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setTyping(true);
    await processMessagesToChatGPT(newMessages);
  };

  // convert it into API format, which is {role: '', content: ''}
  async function processMessagesToChatGPT(chatMessages: MessageModel[]) {
    // : MessageModel[]
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender == "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const systemMessge = {
      role: "system",
      content:
        "Act like the representative of the Government of Qatar and reply all the questions asked related to Qatar in a very polite manner",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessge, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setTyping(false);
      })
      .catch((error) => {
        console.error("Error fetching data from API:", error);
        // Handle the error here, such as displaying an error message to the user
      });
  }

  return (
    <>
      <h1>ChatBot</h1>
      <div className="app">
        <div style={{ position: "relative", height: "800px", width: "700px" }}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={
                  typing ? <TypingIndicator content="Agent is typing" /> : null
                }
              >
                {messages.map((message, i) => {
                  return (
                    <Message
                      key={i}
                      model={message as any}
                      style={{ marginBottom: "20px", textAlign: "left" }}
                    />
                  );
                })}
              </MessageList>
              <MessageInput
                placeholder="Type your messages here"
                onSend={handleSend}
              ></MessageInput>
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </>
  );
}

export default App;
