import React, { useState, useRef } from "react";
import Formater from "./Formater";
import "../components/styles.css";

const TextBlock = ({ content, onUpdate, onDragStart, onDragEnter, onDragEnd, onAddComponent }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const selectedTextRef = useRef("");

  const handleTextChange = (event) => {
    onUpdate(event.target.innerHTML); // Save the formatted HTML
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      selectedTextRef.current = selectedText;
      setMenuPosition({ x: event.clientX, y: event.clientY - 40 });
      setShowMenu(true);
    }
  };

  const handleStyleClick = (style) => {
    document.execCommand(style);
    setShowMenu(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Onemogočimo Enter
      onAddComponent(); // Dodamo nov textBlock
    }
  };

  return (
    <div className="text-block draggable-item">
      <button
        draggable
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragEnd={onDragEnd}
        className="drag-handle"
      >
        ⋮⋮
      </button>
      <button className="add-button" onClick={onAddComponent}>+</button>
      <div
        contentEditable
        suppressContentEditableWarning
        onContextMenu={handleContextMenu}
        onBlur={handleTextChange}
        onKeyDown={handleKeyDown} // Attach the keydown event listener here
        className="text"
        dangerouslySetInnerHTML={{ __html: content }} // Render saved HTML
      />
      {showMenu && <Formater position={menuPosition} onStyleClick={handleStyleClick} />}
    </div>
  );
};

export default TextBlock;