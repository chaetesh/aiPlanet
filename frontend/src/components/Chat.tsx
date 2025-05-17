import React, { useState, useRef } from "react";
import { SendIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { LoadingIndicator } from "./ui/loading-indicator";
import { Answer, Question, api } from "../lib/api";

interface ChatMessage {
  id: string;
  isUser: boolean;
  content: string;
  pending?: boolean;
  error?: boolean;
}

interface ChatProps {
  documentId: number | undefined;
}

export const Chat: React.FC<ChatProps> = ({ documentId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for auto-scrolling to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Clear chat when document changes
  React.useEffect(() => {
    setMessages([]);
  }, [documentId]);
  
  // Scroll to bottom when messages update
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle sending a new message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !documentId) return;
    
    // Add user message to chat
    const userMessageId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      isUser: true,
      content: inputMessage,
    };
    
    // Add AI pending message
    const pendingAiMessage: ChatMessage = {
      id: `${userMessageId}-response`,
      isUser: false,
      content: "",
      pending: true,
    };
    
    setMessages([...messages, newUserMessage, pendingAiMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Prepare question payload
    const question: Question = {
      document_id: documentId,
      question: inputMessage
    };
    
    try {
      // Send question to API
      const response: Answer = await api.qa.askQuestion(question);
      
      // Replace pending message with actual response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === `${userMessageId}-response`
            ? {
                ...msg,
                content: response.answer,
                pending: false,
              }
            : msg
        )
      );
    } catch (error) {
      // Handle error in UI
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === `${userMessageId}-response`
            ? {
                ...msg,
                content: "Sorry, there was an error processing your question. Please check if the backend server is running.",
                pending: false,
                error: true,
              }
            : msg
        )
      );
      console.error("Error asking question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 md:space-y-8">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 max-w-md p-4 md:p-8">
              {documentId ? (
                <>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Ask a question about this document</h3>
                  <p className="text-sm md:text-base">You can ask questions about the content of the document and get AI-generated answers.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Welcome to PDF Q&A</h3>
                  <p className="text-sm md:text-base">Select or upload a document from the sidebar to start asking questions about its content.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2 md:gap-4">
              {message.isUser ? (
                <Avatar className="w-8 h-8 md:w-10 md:h-10 bg-[#b0ace9] flex-shrink-0">
                  <AvatarFallback className="text-white text-lg md:text-2xl">U</AvatarFallback>
                </Avatar>
              ) : (
                <img
                  className="w-8 h-8 md:w-10 md:h-10 object-cover flex-shrink-0"
                  alt="AI Avatar"
                  src="/frame-1000003278--2--2.png"
                />
              )}
              <div 
                className={`font-medium text-[#1b1f2a] text-sm md:text-[15px] tracking-[0.15px] leading-6 md:leading-7 max-w-[calc(100%-44px)] md:max-w-[90%] ${
                  message.error ? "text-red-500" : ""
                }`}
              >
                {message.pending ? (
                  <div className="flex items-center gap-2">
                    <LoadingIndicator size="small" />
                    <span className="text-gray-500">Generating answer...</span>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}
        {/* Invisible element for auto-scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input - fixed at bottom */}
      <div className="p-2 md:p-4 border-t border-gray-200">
        <Card className="relative w-full h-12 md:h-14 bg-white rounded-lg border border-solid border-[#e4e8ee] shadow-shadow-01">
          <div className="flex items-center h-full">
            <Input
              className="border-none shadow-none h-full font-medium text-[#6e7583] text-sm md:text-base"
              placeholder={documentId ? "Ask a question..." : "Select a document..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!documentId || isLoading}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 md:right-4"
              onClick={sendMessage}
              disabled={!documentId || !inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <LoadingIndicator size="small" />
              ) : (
                <SendIcon className="w-5 h-5 md:w-[22px] md:h-[22px]" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
