import React from "react";

import "./JoinBack.css";

function GameplayCard({ text, quantum }) {
  return (
    <div className="gameplay-card">
      {quantum && <div className="gameplay-card-quantum">{quantum}</div>}
      {text && <div className="gameplay-card-answer">{text}</div>}
    </div>
  );
}

export default GameplayCard;
