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
    setPageTitle(e.target.value);
  };

  const handleComponentChange = (id, newComponent) => {
    const updatedComponents = components.map((component) =>
      component.id === id ? newComponent : component
    );
    setComponents(updatedComponents);
  };

  useEffect(() => {
    setEditingTitle(pageTitle); 
  }, [pageTitle]);

  return (
    <div className="current-page">
      <input
        type="text"
        value={pageTitle}
        onChange={handleTitleChange}
        className="page-title-input"
      />
      <div className="components">
        {Array.isArray(components) ? components.map((component) => {
          switch (component.type) {
            case 'textBlock':
              return (
                <TextBlock
                  key={component.id}
                  {...component}
                  onContentChange={(newContent) =>
                    handleComponentChange(component.id, { ...component, content: newContent })
                  }
                />
              );
            case 'checklist':
              return (
                <Checklist
                  key={component.id}
                  {...component}
                  onItemsChange={(newItems) =>
                    handleComponentChange(component.id, { ...component, items: newItems })
                  }
                />
              );
            case 'toggleBlock':
              return (
                <ToggleBlock
                  key={component.id}
                  {...component}
                  onTitleUpdate={(newTitle) =>
                    handleComponentChange(component.id, { ...component, title: newTitle })
                  }
                  onContentUpdate={(newContent) =>
                    handleComponentChange(component.id, { ...component, content: newContent })
                  }
                />
              );
            default:
              return null;
          }
        }) : null}
      </div>
    </div>
  );
};

export default CurrentPage;
