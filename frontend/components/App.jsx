import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SideBar from "./sideBar";
import RightBar from "./rightBar";
import CurrentPage from "./currentPage";
import LandingPage from "./landingPage";
import SignUp from "./signUp";
import SignIn from "./signIn";
import Contact from "./Contact";
import "./styles.css";
import { jsPDF } from "jspdf";
import { parse } from "node-html-parser"; // Install this library: npm install node-html-parser

const App = () => {
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(localStorage.getItem('currentPageId'));
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (isAuthenticated && (user?.user_id || storedUserId)) {
      fetchUserPages(user?.user_id || storedUserId);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPageId, pages]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (typingTimeout) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Do you really want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [typingTimeout]);

  const fetchUserPages = async (userId) => {
    try {
      const response = await fetch(`https://backend-production-fbab.up.railway.app/api/user-pages?userId=${userId}`);
      localStorage.setItem('userId', userId); // Store user ID in local storage
      const data = await response.json();
      if (data.pages) {
        setPages(data.pages);
        if (data.pages.length > 0 && !currentPageId) {
          setCurrentPageId(data.pages[0].page_id);
        }
      } else {
        setPages([]);
      }
    } catch (error) {
      console.error('Error fetching user pages:', error);
    }
  };

  const addNewPage = async () => {
    const newPage = {
      userId: user.user_id,
      title: `Welcome to ZapišiSi!`,
      content: JSON.stringify([
        { id: 1, type: "textBlock", content: `Getting Started!` },
        {
          id: 2,
          type: "checklist",
          items: [
            { id: 1, content: "Click and type anywhere", checked: false },
            { id: 2, content: "Drag items to reorder them", checked: false },
          ],
        },
        {
          id: 3,
          type: "toggleBlock",
          title: "This is a toggle block.",
          content: "• Here's some info about toggles.",
        },
      ]),
    };

    try {
      const response = await fetch('https://backend-production-fbab.up.railway.app/api/add-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPage),
      });
      const data = await response.json();
      const newPageWithId = { ...newPage, page_id: data.pageId, content: JSON.parse(newPage.content) };
      setPages([...pages, newPageWithId]);
      setCurrentPageId(data.pageId);
      localStorage.setItem('currentPageId', data.pageId);
    } catch (error) {
      console.error('Error adding new page:', error);
    }
  };

  const deletePage = async () => {
    try {
      const response = await fetch(`https://backend-production-fbab.up.railway.app/api/delete-page?pageId=${currentPageId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedPages = pages.filter((page) => page.page_id !== currentPageId);
        setPages(updatedPages);
        setCurrentPageId(updatedPages.length > 0 ? updatedPages[0].page_id : null);
        localStorage.setItem('currentPageId', updatedPages.length > 0 ? updatedPages[0].page_id : null);
      } else {
        const errorData = await response.json();
        console.error('Error deleting page:', errorData);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const exportPage = async () => {
    const currentPage = pages.find((page) => page.page_id === currentPageId);
    if (!currentPage) {
      console.error("No page selected for export.");
      return;
    }

    const doc = new jsPDF();

    // Naslov strani
    doc.setFont("Times");
    doc.setFontSize(20);
    doc.text(currentPage.title || "Untitled Page", 10, 10);


    let yOffset = 35; 

    // Funkcija za renderanje besedila brez html tagov
    const renderStyledText = (html, x, y) => {
      const root = parse(html); // Parse the HTML content

      const processNode = (node, x, y) => {
        if (node.nodeType === 3) {
          // Text node
          doc.text(node.rawText, x, y);
          return doc.getTextWidth(node.rawText); // Return the width of the text
        } else {
          // Apply styles based on the tag
          let currentFont = "normal";
          let isUnderlined = false;
          let isStrikethrough = false;

          if (node.tagName === "b" || node.tagName === "strong") {
            currentFont = "bold";
          } else if (node.tagName === "i" || node.tagName === "em") {
            currentFont = "italic";
          }

          if (node.tagName === "u") {
            isUnderlined = true;
          }

          if (node.tagName === "s" || node.tagName === "strike") {
            isStrikethrough = true;
          }

          // Apply the font style
          doc.setFont("Times", currentFont);

          // Process child nodes recursively
          const width = processChildNodes(node, x, y);

          // Draw underline or strikethrough if needed
          if (isUnderlined) {
            doc.line(x, y + 1, x + width, y + 1); // Draw underline
          }
          if (isStrikethrough) {
            doc.line(x, y - 2, x + width, y - 2); // Draw strikethrough
          }

          // Reset font to normal after processing
          doc.setFont("Times", "normal");
          return width;
        }
      };

      const processChildNodes = (node, x, y) => {
        let currentX = x;
        node.childNodes.forEach((child) => {
          const width = processNode(child, currentX, y);
          currentX += width; // Update x position for the next node
        });
        return currentX - x; // Return total width of processed nodes
      };

      processChildNodes(root, x, y);
    };

    // Add the page content
    currentPage.content.forEach((component) => {
      doc.setFontSize(14);

      if (component.type === "textBlock") {
        renderStyledText(component.content, 10, yOffset);
        yOffset += 10;
      } else if (component.type === "checklist") {
        component.items.forEach((item) => {
          // narišemo checkbox
          doc.rect(20, yOffset - 4, 4, 4); // x, y, w, h

          // Če je bil checked, narišemo kljukico
          if (item.checked) {
          // navpična črta
            doc.line(21, yOffset - 2, 21, yOffset ); // x1, y1, x2, y2
            // poševna črta
            doc.line(21, yOffset , 24, yOffset -4); // x1, y1, x2, y2
          }
          renderStyledText(item.content, 30, yOffset);
          yOffset += 10;
        });
      } else if (component.type === "toggleBlock") {
        doc.setFont("Times", "bold");
        doc.text(component.title, 10, yOffset);
        yOffset += 10;
        doc.setFont("Times", "normal");
        renderStyledText(component.content, 20, yOffset);
        yOffset += 10;
      }
    });

    // Shranimo PDF
    doc.save(`${currentPage.title || "Untitled_Page"}.pdf`);
  };

  const selectPage = (id) => {
    setCurrentPageId(id);
    localStorage.setItem('currentPageId', id);
  };

  const updatePageTitle = (newTitle) => {
    const updatedPages = pages.map((page) => {
      if (page.page_id === currentPageId) {
        return { ...page, title: newTitle };
      }
      return page;
    });
    setPages(updatedPages);
    debounceSave();
  };

  const updateComponents = (newComponents) => {
    const updatedPages = pages.map((page) => {
      if (page.page_id === currentPageId) {
        return { ...page, content: newComponents };
      }
      return page;
    });
    setPages(updatedPages);
    debounceSave();
  };

  const debounceSave = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      saveData();
    }, 1000);
    setTypingTimeout(timeout);
  };

  const saveData = async () => {
    const currentPage = pages.find((page) => page.page_id === currentPageId);
    if (!currentPage) return;

    // Ensure content is serialized to JSON string
    const pageData = {
      ...currentPage,
      content: JSON.stringify(currentPage.content),
      user_id: user.user_id,
    };

    try {
      const response = await fetch(`https://backend-production-fbab.up.railway.app/api/update-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saving page data:', errorData);
      } else {
        console.log('Page data saved successfully');
      }
    } catch (error) {
      console.error('Error saving page data:', error);
    }
  };

  const handleSignIn = (user) => {
    setIsAuthenticated(true);
    setUser(user);
    const lastPageId = user.last_edited_page_id;
    if (lastPageId) {
      setCurrentPageId(lastPageId);
    }
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(user));
  };

  const currentPage = pages.find((page) => page.page_id === currentPageId);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn setIsAuthenticated={handleSignIn} setUser={setUser} />} />
        <Route
          path="/app"
          element={
            isAuthenticated ? (
              <div className="app-container">
                <SideBar pages={pages} onNewPage={addNewPage} onSelectPage={selectPage} />
                <RightBar onDeletePage={deletePage} onExportPage={exportPage}/>
                <div className="flex-1">
                  {currentPage ? (
                    <CurrentPage
                      pageTitle={currentPage.title}
                      components={Array.isArray(currentPage.content) ? currentPage.content : []}
                      setComponents={updateComponents}
                      setPageTitle={updatePageTitle}
                    />
                  ) : (
                    pages.length > 0 && (
                      <CurrentPage
                        pageTitle={pages[0].title}
                        components={Array.isArray(pages[0].content) ? pages[0].content : []}
                        setComponents={updateComponents}
                        setPageTitle={updatePageTitle}
                      />
                    )
                  )}
                </div>
              </div>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route path="/contact-us" element={<Contact/>}/>
      </Routes>
    </Router>
  );
};

export default App;