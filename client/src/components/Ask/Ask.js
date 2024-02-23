import React from "react";

import "./Ask.css";

const Ask = ({ nextPlayer, onAsk }) => {
  const handleClick = () => {
    onAsk();
  };

  return (
    <div className="box">
      <p className="choiceTitle">It's your turn to ask {nextPlayer}</p>
      <div className="choiceButtons">
        <div className="askButton green" onClick={() => handleClick()}>
          ASK THIS CARD
        </div>
      </div>
    </div>
  );
};

export default Ask;
