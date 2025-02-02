import React, { useState } from 'react';
import './styles.css'; 

const RightBar = ({ pages, onNewPage, onSelectPage }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isIndented, setIsIndented] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const changeFont = (font) => {
    document.body.style.fontFamily = font;
  };

  const toggleIndent = () => {
    const flexElements = document.getElementsByClassName("flex")[0].style.marginLeft = isIndented ? "450px" : "20px";
    setIsIndented(!isIndented);
  };

  return (
    <div>
      <button 
        className={`rightbar-button ${sidebarVisible ? 'open' : ''}`} 
        onClick={toggleSidebar} 
      >⋯</button>
      <div className={`rightbar-container ${sidebarVisible ? '' : 'rightbar--hidden'}`}>
        <div className="rightbar">
          <div className="font-list">
            <button className="font-button" onClick={() => changeFont("ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif")}>
              <span className='font-button-example'> Ag</span>
              <span className='font-button-name'> default</span>
            </button>
            <button className="font-button" onClick={() => changeFont("'Times New Roman', Times, serif")}>
              <span className='font-button-example' style={{ fontFamily: "'Times New Roman', Times, serif" }}> Ag</span>
              <span className='font-button-name'> serif</span>
            </button>
            <button className="font-button" onClick={() => changeFont("'Courier New', monospace")}>
              <span className='font-button-example' style={{ fontFamily: "'Courier New', monospace" }}> Ag</span>
              <span className='font-button-name'> mono</span>
            </button>
          </div>
          <div className='indent'>
            <span><b>No Indent:</b></span>
            <label className="switch">
              <input type="checkbox" onChange={toggleIndent} checked={isIndented} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightBar;
