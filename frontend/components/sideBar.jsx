import React, { useState } from 'react';
import './styles.css'; // Ensure you have the CSS file imported

const SideBar = ({ pages, onNewPage, onSelectPage }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="sidebar-container">
        <input 
          type="checkbox" 
          id="sidebar-toggle" 
          className="sidebar-butt" 
          checked={sidebarVisible}
          onChange={toggleSidebar} 
        />
      <div className={`sidebar ${sidebarVisible ? '' : 'sidebar--hidden'}`}>
        <button onClick={onNewPage} className="new-page-button">New Page</button>
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
    </div>
  );
};

export default SideBar;