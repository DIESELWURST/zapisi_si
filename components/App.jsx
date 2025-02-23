import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SideBar from "./sideBar";
import RightBar from "./rightBar";
import CurrentPage from "./currentPage";
import LandingPage from "./landingPage";
import SignUp from "./signUp";
import SignIn from "./signIn";
import "../components/styles.css";

const App = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      title: "Getting Started",
      components: [
        { id: 1, type: "textBlock", content: "Welcome to your page!" },
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
          title: "This is a toggle block. Click the little triangle to see more useful tips!",
          content: `• Highlight any text, and use the menu that pops up to **style** *your* ~~writing~~ however [you] like.\n• Click the **+ New Page** button at the bottom of your sidebar to add a new page.`,
        },
      ],
    },
  ]);
  const [currentPageId, setCurrentPageId] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const addNewPage = () => {
    const newPageId = pages.length + 1;
    const newPage = {
      id: newPageId,
      title: `Page ${newPageId}`,
      components: [
        { id: 1, type: "textBlock", content: `Welcome to Page ${newPageId}!` },
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
          content: "Here's some info about toggles.",
        },
      ],
    };
    setPages([...pages, newPage]);
    setCurrentPageId(newPageId);
  };

  const selectPage = (id) => {
    setCurrentPageId(id);
  };

  const updatePageTitle = (newTitle) => {
    const updatedPages = pages.map((page) => {
      if (page.id === currentPageId) {
        return { ...page, title: newTitle };
      }
      return page;
    });
    setPages(updatedPages);
  };

  const currentPage = pages.find((page) => page.id === currentPageId);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/app"
          element={
            isAuthenticated ? (
              <div className="app-container">
                <SideBar pages={pages} onNewPage={addNewPage} onSelectPage={selectPage} />
                <RightBar pages={pages} onNewPage={addNewPage} onSelectPage={selectPage} />
                <div className="flex-1">
                  {currentPage ? (
                    <CurrentPage
                      pageTitle={currentPage.title}
                      components={currentPage.components}
                      setComponents={(newComponents) => {
                        const newPages = pages.map((page) => {
                          if (page.id === currentPageId) {
                            return { ...page, components: newComponents };
                          }
                          return page;
                        });
                        setPages(newPages);
                      }}
                      setPageTitle={updatePageTitle}
                    />
                  ) : (
                    <h1>Please select or create a page</h1>
                  )}
                </div>
              </div>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;