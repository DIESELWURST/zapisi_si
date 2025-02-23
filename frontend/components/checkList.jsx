import React, { useState, useRef } from "react";
import Formater from "./Formater";
import "./styles.css";

const Checklist = ({ items, setItems }) => {
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const selectedTextRef = useRef("");
  const dragItem = useRef();
  const dragOverItem = useRef();

  const toggleCheck = (index) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  const handleTextChange = (index, event) => {
    const newItems = [...items];
    newItems[index].content = event.target.innerText;
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

  const handleStyleClick = (style, index) => {
    const newItems = [...items];
    const currentItem = newItems[index];

    // Apply inline styles if `document.execCommand` fails
    try {
      document.execCommand(style);
    } catch (err) {
      if (style === "bold") {
        currentItem.content = `<b>${currentItem.content}</b>`;
      } else if (style === "italic") {
        currentItem.content = `<i>${currentItem.content}</i>`;
      } else if (style === "strikeThrough") {
        currentItem.content = `<s>${currentItem.content}</s>`;
      }
    }

    setItems(newItems);
    setShowMenu(false);
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

  const handleAddItem = (index) => {
    const newItems = [...items];
    newItems.splice(index + 1, 0, {
      id: newItems.length + 1,
      content: "New Checklist Item",
      checked: false,
    });
    setItems(newItems);
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
              className={` text checklist-text ${item.checked ? "completed" : ""}`}
              contentEditable
              suppressContentEditableWarning
              onBlur={(event) => handleTextChange(index, event)}
              onContextMenu={(e) => handleContextMenu(e, index)} // Attach context menu to each item
            >
              {item.content}
            </span>
          </li>
        ))}
      </ul>
      {showMenu && (
        <Formater
          position={menuPosition}
          onStyleClick={(style) =>
            handleStyleClick(style, items.findIndex((item) => item.content.includes(selectedTextRef.current)))
          }
        />
      )}
    </div>
  );
};

export default Checklist;
