import React, { useState, useEffect, useRef } from "react";
import TextBlock from "./textBlock";
import Checklist from "./checkList";
import ToggleBlock from "./toggleBlock";
import "../components/styles.css";

const CurrentPage = ({ pageTitle, components, setComponents, setPageTitle }) => {
  const [editingTitle, setEditingTitle] = useState(pageTitle);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const titleRef = useRef(null); 
  const draggedComponent = useRef(null);

  const handleDragStart = (index) => {
    draggedComponent.current = { component: components[index], index };
  };

  const handleDragEnter = (index) => {
    draggedComponent.current.overIndex = index;
  };

  const handleDragEnd = () => {
    const newComponents = [...components];
    const { component, index } = draggedComponent.current;
    newComponents.splice(index, 1);
    newComponents.splice(draggedComponent.current.overIndex, 0, component);
    setComponents(newComponents);
    draggedComponent.current = null;
  };

  const handleAddComponent = (index, type) => {
    const newComponents = [...components];
    let newComponent;
    switch (type) {
      case "textBlock":
        console.log("Adding text block");
        newComponent = { id: newComponents.length + 1, type: "textBlock", content: "" };
        break;
      case "checklist":
        newComponent = {
          id: newComponents.length + 1,
          type: "checklist",
          items: [
            { id: 1, content: "", checked: false },
          ],
        };
        break;
      case "toggleBlock":
        newComponent = {
          id: newComponents.length + 1,
          type: "toggleBlock",
          title: "New Toggle Block",
          content: "• New content for toggle block.",
        };
        break;
      default:
        newComponent = { id: newComponents.length + 1, type: "textBlock", content: "" };
    }
    newComponents.splice(index + 1, 0, newComponent);
    setComponents(newComponents);
  };

  const handleDeleteComponent = (index) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
  };

  const handleTitleChange = (e) => {
    if (!titleRef.current) return;
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  
    const timeout = setTimeout(() => {
      setPageTitle(titleRef.current.innerText.trim());
    }, 1000);
  
    setTypingTimeout(timeout);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && !titleRef.current.innerText) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    setEditingTitle(pageTitle); 
  }, [pageTitle]);

  const renderComponent = (component, index) => {
    switch (component.type) {
      case "textBlock":
        return (
          <TextBlock
            key={component.id}
            content={component.content}
            onUpdate={(newContent) => {
              const newComponents = [...components];
              newComponents[index].content = newContent;
              setComponents(newComponents);
            }}
            onDelete={() => handleDeleteComponent(index)}
            onFocusPrevious={() => {
              if (index > 0) {
                const previousComponent = document.querySelector(`[data-index="${index - 1}"] .text`);
                if (previousComponent) {
                  previousComponent.focus();

                  
                  const range = document.createRange();
                  const selection = window.getSelection();
                  range.selectNodeContents(previousComponent);
                  range.collapse(false);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onAddComponent={() => handleAddComponent(index, "textBlock")}    
          />
        );
      case "checklist":
        return (
          <div
            key={component.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            className="draggable-item"
          >
            <Checklist
              items={component.items}
              setItems={(newItems) => {
                const newComponents = [...components];
                newComponents[index].items = newItems;
                setComponents(newComponents);
              }}
            />
          </div>
        );
      case "toggleBlock":
        return (
          <ToggleBlock
            key={component.id}
            title={component.title}
            content={component.content}
            onUpdate={(newContent) => {
              const newComponents = [...components];
              newComponents[index].content = newContent;
              setComponents(newComponents);
            }}
            onTitleUpdate={(newTitle) => {
              const newComponents = [...components];
              newComponents[index].title = newTitle;
              setComponents(newComponents);
            }}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onAddComponent={() => handleAddComponent(index, component.type)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      
        <div
          ref={titleRef}
          className="pageName"
          contentEditable
          suppressContentEditableWarning
          onInput={handleTitleChange}
          onKeyDown={handleKeyDown}
        >
          {editingTitle || "Untitled Page"}
        </div>

        {components.map((component, index) => renderComponent(component, index))}
      </div>

  );
};

export default CurrentPage;
