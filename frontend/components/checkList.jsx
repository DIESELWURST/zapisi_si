import React, { useState, useRef } from "react";
import Formater from "../components/Formater";
import "../components/styles.css";

const Checklist = ({ items, setItems }) => {
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const selectedTextRef = useRef("");
  const dragItem = useRef(null); 
  const dragOverItem = useRef(null); 

  const toggleCheck = (index) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  const handleTextChange = (index, event) => {
    const newItems = [...items];
    newItems[index].content = event.target.innerHTML; // Shranimo formatiran HTML
    setItems(newItems);
  };

  const handleContextMenu = (event, index) => {
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

  const handleAddItem = (index) => {
    const newItems = [...items];
    newItems.splice(index + 1, 0, {
      id: newItems.length + 1,
      content: "New Checklist Item",
      checked: false,
    });
    setItems(newItems);
  };

  const handleDragStart = (index) => {
    dragItem.current = index; 
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index; 
  };

  const handleDragEnd = () => {
    const newItems = [...items];
    const draggedItem = newItems.splice(dragItem.current, 1)[0]; 
    newItems.splice(dragOverItem.current, 0, draggedItem);
    setItems(newItems);
    dragItem.current = null; 
    dragOverItem.current = null; 
  };

  return (
    <div>
      <ul className="checklist">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="checklist-item"
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => handleDragEnter(index)}
            onDrop={handleDragEnd}
          >
            <button
              draggable
              onDragStart={() => handleDragStart(index)}
              className="drag-handle"
            >
              ⋮⋮
            </button>
            <button
              className="add-button"
              onClick={() => handleAddItem(index)}
            >
              +
            </button>
            <span
              className={`checkbox ${item.checked ? "checked" : ""}`}
              onClick={() => toggleCheck(index)}
            >
              {item.checked && <span className="arrow">✔</span>}
            </span>
            <span
              className={`text checklist-text ${item.checked ? "completed" : ""}`}
              contentEditable
              suppressContentEditableWarning
              onBlur={(event) => handleTextChange(index, event)} 
              onContextMenu={(e) => handleContextMenu(e, index)} 
              dangerouslySetInnerHTML={{ __html: item.content }} 
            />
          </li>
        ))}
      </ul>
      {showMenu && (
        <Formater
          position={menuPosition}
          onStyleClick={handleStyleClick}
        />
      )}
    </div>
  );
};

export default Checklist;
