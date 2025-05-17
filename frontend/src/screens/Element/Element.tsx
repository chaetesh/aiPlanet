import { useState } from "react";
import { Document } from "../../lib/api";
import { DocumentManager } from "../../components/DocumentManager";
import { Chat } from "../../components/Chat";
import { Menu, X } from "lucide-react"; // Import icons for mobile menu toggle

export const Element = (): JSX.Element => {
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
    // Close sidebar automatically on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="w-full h-screen">
      <div className="relative h-full bg-white flex flex-col">
        {/* Header */}
        <header className="w-full h-[77px] bg-white shadow-[0px_-8px_25px_#00000038] flex items-center justify-between px-4 md:px-14">
          <div className="flex items-center">
            {/* Mobile menu toggle */}
            <button 
              className="mr-3 md:hidden" 
              onClick={toggleSidebar}
              aria-label="Toggle document sidebar"
            >
              <Menu size={24} />
            </button>
            
            <img
              className="w-[105px] h-[41px]"
              alt="Ai planet logo"
              src="/ai-planet-logo.svg"
            />
          </div>

          {selectedDocument && (
            <div className="flex items-center gap-2.5 max-w-[50%] md:max-w-none">
              <div className="p-[7.84px] bg-white rounded-[3.92px] overflow-hidden border-[0.78px] border-solid border-[#0fa95870] hidden sm:block">
                <img
                  className="w-[14.44px] h-[18.23px]"
                  alt="PDF icon"
                  src="/group.png"
                />
              </div>
              <span className="font-medium text-[#0fa958] text-sm truncate">
                {selectedDocument.filename}
              </span>
            </div>
          )}
        </header>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile sidebar overlay */}
          {isSidebarOpen && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar for document management */}
          <div 
            className={`absolute md:relative z-30 md:z-auto bg-white h-full w-4/5 max-w-[300px] md:w-64 border-r p-4 overflow-y-auto transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <div className="relative flex justify-center items-center mb-4 md:hidden">
              <h2 className="font-semibold text-lg">Documents</h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-900 absolute right-0"
                aria-label="Close sidebar"
              >
                <X size={24} />
              </button>
            </div>
            {/* Added spacing for both mobile and desktop */}
            <div className="mt-6 md:mt-0">
              <DocumentManager 
                onSelectDocument={handleSelectDocument}
                selectedDocumentId={selectedDocument?.id}
              />
            </div>
          </div>
          
          {/* Chat area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Chat documentId={selectedDocument?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
