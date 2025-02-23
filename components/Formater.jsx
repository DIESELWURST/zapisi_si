import React from "react";
import "../components/styles.css";

const Formater = ({ position, onStyleClick }) => {
  return (
    <div className="formater-container" style={{ top: position.y, left: position.x }}>
      <button className="formater-btn" onClick={() => onStyleClick("bold")}>
        <b>B</b>
      </button>
      <button className="formater-btn" onClick={() => onStyleClick("italic")}>
        <i>I</i>
      </button>
      <button className="formater-btn" onClick={() => onStyleClick("underline")}>
        <u>U</u>
      </button>
      <button className="formater-btn" onClick={() => onStyleClick("strikethrough")}>
        <s>S</s>
      </button>
      <button className="formater-btn" onClick={() => onStyleClick("subscript")}>
        x<sub>2</sub>
      </button>
      <button className="formater-btn" onClick={() => onStyleClick("superscript")}>
        x<sup>2</sup>
      </button>
    </div>
  );
};

export default Formater;
