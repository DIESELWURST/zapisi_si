import React from "react";

const SideBar = ({ pages, onNewPage, onSelectPage }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Beta site</h2>
      <button onClick={onNewPage}>New Page</button>
      <div className="page-list">
        <h3>Pages</h3>
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onSelectPage(page.id)}
            className="sidebar-button"
          >
            {page.title || "Untitled Page"} 
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
