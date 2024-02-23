import React from "react";

import "./Decision.css";

const Decision = ({ onDecide }) => {
  const handleDecide = (decision) => {
    onDecide(decision);
  };

  return (
    <div className="box">
      <div className="choiceButtons">
        <div
          className="decisionButton wideButton green"
          onClick={() => handleDecide(true)}
        >
          CORRECT
        </div>
        <div
          className="decisionButton wideButton red"
          onClick={() => handleDecide(false)}
        >
          WRONG
        </div>
      </div>
    </div>
  );
};

export default Decision;
