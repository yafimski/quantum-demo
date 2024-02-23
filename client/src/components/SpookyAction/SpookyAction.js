import React from "react";

import "../Decision/Decision.css";

const SpookyAction = ({ onDecide }) => {
  const handleDecide = (decision) => {
    onDecide(decision);
  };

  return (
    <div className="box">
      <p className="choiceTitle">Something spooky is happening!</p>
      <p className="choiceTitle">You have 2 identical Quantum Answers</p>
      <p className="choiceTitle">with opposite Quantum signs!</p>
      <br></br>
      <p className="choiceTitle">This allows you to do one of the following:</p>

      <div className="choiceButtons">
        <button
          className="decisionButton spooky-button blue"
          onClick={() => handleDecide(1)}
        >
          <p>Discard them and draw 2 new cards</p>
          <p>+</p>
          <p>Rotate all hands</p>
        </button>
        <button
          className="decisionButton spooky-button brown"
          onClick={() => handleDecide(2)}
        >
          <p>Discard them</p>
          <p>+</p>
          <p>Take a One Quantum from each neighbor</p>
        </button>
        <button
          className="decisionButton spooky-button black"
          onClick={() => handleDecide(3)}
        >
          Play normal turn
        </button>
      </div>
    </div>
  );
};

export default SpookyAction;
