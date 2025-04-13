import React, { useState, useRef } from "react";
import Formater from "./Formater";
import "../components/styles.css";

const renderStyledText = (html, x, y) => {
  const root = parse(html); // Parse the HTML content

  const processNode = (node, x, y) => {
    if (node.nodeType === 3) {
      // Text node
      doc.text(node.rawText, x, y);
      return doc.getTextWidth(node.rawText); // Return the width of the text
    } else if (node.tagName === "b" || node.tagName === "strong") {
      // Bold text
      doc.setFont("Times", "bold");
      const width = processChildNodes(node, x, y);
      doc.setFont("Times", "normal"); // Reset font
      return width;
    } else if (node.tagName === "i" || node.tagName === "em") {
      // Italic text
      doc.setFont("Times", "italic");
      const width = processChildNodes(node, x, y);
      doc.setFont("Times", "normal"); // Reset font
      return width;
    } else if (node.tagName === "u") {
      // Underlined text
      const width = processChildNodes(node, x, y);
      doc.line(x, y + 1, x + width, y + 1); // Draw underline
      return width;
    } else if (node.tagName === "s") {
      // Strikethrough text
      const width = processChildNodes(node, x, y);
      doc.line(x, y - 2, x + width, y - 2); // Draw strikethrough
      return width;
    } else {
      // Default case: process child nodes
      return processChildNodes(node, x, y);
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

const ToggleBlock = ({
  title,
  content,
  onUpdate,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onTitleUpdate,
  onAddComponent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const selectedTextRef = useRef("");
  const draggedLine = useRef(null);

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

  const handleContentChange = (event, lineIndex) => {
    const lines = content.split("\n");
    lines[lineIndex] = event.target.innerHTML; // Save formatted HTML
    const updatedContent = lines.join("\n");
    onUpdate(updatedContent);
  };

  const handleTitleChange = (event) => {
    const newTitle = event.target.innerHTML.replace(/^[▼▶]\s*/, "");
    onTitleUpdate(newTitle);
  };

  const handleAddLine = (index) => {
    const lines = content.split("\n");
    lines.splice(index + 1, 0, "• "); 
    onUpdate(lines.join("\n"));
  };

  const handleDragStartLine = (line, index) => {
    draggedLine.current = { line, index };
  };

  const handleDragEndLine = (targetIndex) => {
    if (!draggedLine.current) return;

    const lines = content.split("\n");
    const dragged = lines.splice(draggedLine.current.index, 1)[0];
    lines.splice(targetIndex, 0, dragged);
    onUpdate(lines.join("\n"));
    draggedLine.current = null;
  };

  return (
    <div
      className="toggle-block draggable-item"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (draggedLine.current) {
          handleDragEndLine(content.split("\n").length);
        }
      }}
    >
      <div
        className="toggle-header-row"
        draggable
        onDragStart={onDragStart}
        onDragEnter={onDragEnter}
        onDragEnd={onDragEnd}
      >
        <button className="drag-handle">⋮⋮</button>
        <button className="add-button" onClick={onAddComponent}>+</button>
        <div className="cursor-pointer toggle-header">
          <span onClick={() => setIsOpen(!isOpen)}>{isOpen ? "▼" : "▶"}</span>
          <span
            className="text"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleChange} // Save changes on blur
            dangerouslySetInnerHTML={{ __html: title }} // Render saved HTML
          />
        </div>
      </div>

      {isOpen && (
        <div className="toggle-body">
          {content.split("\n").map((line, index) => (
            <div
              key={index}
              className="toggle-body-row"
              draggable
              onDragStart={() => handleDragStartLine(line, index)}
              onDragEnter={(e) => e.preventDefault()}
              onDrop={() => handleDragEndLine(index)}
              onContextMenu={handleContextMenu}
            >
              <button className="drag-handle">⋮⋮</button>
              <button
                className="add-button"
                onClick={() => handleAddLine(index)}
              >
                +
              </button>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(event) => handleContentChange(event, index)} // Save changes on blur
                dangerouslySetInnerHTML={{ __html: line }} // Render saved HTML
              />
            </div>
          ))}
          {showMenu && (
            <Formater
              position={menuPosition}
              onStyleClick={handleStyleClick}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleBlock;