import React, { useState, useRef } from "react";
import Formater from "../components/Formater";
import "../components/styles.css";

const Checklist = ({ items, setItems }) => {
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const selectedTextRef = useRef("");
  const dragItem = useRef(null); // Define dragItem as a ref
  const dragOverItem = useRef(null); // Define dragOverItem as a ref

  const toggleCheck = (index) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  const handleTextChange = (index, event) => {
    const newItems = [...items];
    newItems[index].content = event.target.innerHTML; // Save formatted HTML
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
    document.execCommand(style); // Apply the style
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
    dragItem.current = index; // Store the index of the dragged item
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index; // Store the index of the item being dragged over
  };

  const handleDragEnd = () => {
    const newItems = [...items];
    const draggedItem = newItems.splice(dragItem.current, 1)[0]; // Remove the dragged item
    newItems.splice(dragOverItem.current, 0, draggedItem); // Insert it at the new position
    setItems(newItems);
    dragItem.current = null; // Reset the ref
    dragOverItem.current = null; // Reset the ref
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
              onBlur={(event) => handleTextChange(index, event)} // Save changes on blur
              onContextMenu={(e) => handleContextMenu(e, index)} // Show Formater on right-click
              dangerouslySetInnerHTML={{ __html: item.content }} // Render saved HTML
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
