import React, { useState, useEffect, useRef } from "react";
import TextBlock from "../components/textBlock";
import Checklist from "../components/checkList";
import ToggleBlock from "../components/toggleBlock";
import "../components/styles.css";

const HomePage = ({ pageTitle, components, setComponents, setPageTitle }) => {
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
        newComponent = { id: newComponents.length + 1, type: "textBlock", content: "New Text Block" };
        break;
      case "checklist":
        newComponent = {
          id: newComponents.length + 1,
          type: "checklist",
          items: [
            { id: 1, content: "New Checklist Item", checked: false },
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
        newComponent = { id: newComponents.length + 1, type: "textBlock", content: "New Component" };
    }
    newComponents.splice(index + 1, 0, newComponent);
    setComponents(newComponents);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.textContent;
    setEditingTitle(newTitle);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      if (newTitle.trim() === "") {
        setPageTitle("Untitled Page"); // Set to default če je prazno
      } else {
        setPageTitle(newTitle); // če pa je pa posodobi
      }
    }, 500); // 500ms delay
    setTypingTimeout(timeout);
  };

  const handleTitleFocus = () => {
    const position = saveCaretPosition();
    setEditingTitle((prev) => {
      setTimeout(() => {
        restoreCaretPosition(position);
      }, 100);
      return prev;
    });
  };

  const saveCaretPosition = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    return range.getBoundingClientRect();
  };

  const restoreCaretPosition = (position) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(position.node, position.offset);
    selection.removeAllRanges();
    selection.addRange(range);
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
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onAddComponent={() => handleAddComponent(index, component.type)}
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
      <div className="flex-1 bg-black text-white p-6 ml-40">
        <div
          ref={titleRef}
          className="pageName"
          contentEditable
          suppressContentEditableWarning
          onInput={handleTitleChange} 
          onFocus={handleTitleFocus} 
        >
          {editingTitle || "Untitled Page"} 
        </div>

        {components.map((component, index) => renderComponent(component, index))}
      </div>
    </div>
  );
};

export default HomePage;
