import React from "react";

import "./JoinBack.css";

function HelpCard({ text, quantum }) {
  return (
    <div className="help-card">
      {quantum && <div className="help-card-quantum">{quantum}</div>}
      {text && <div className="help-card-answer">{text}</div>}
    </div>
  );
}

export default HelpCard;
