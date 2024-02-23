import React from "react";

import "../Decision/Decision.css";
import "./Quantum.css";

const Quantum = ({ onWin }) => {
  const handleWin = () => {
    onWin();
  };

  return (
    <div className="box">
      <p className="quantumTitle">You have 7 One Quantums!</p>
      <p className="quantumTitle">What are you waiting for ?!</p>
      <p className="quantumTitle">Shout "QUANTUM" and click to WIN!</p>
      <button className="quantumButton green" onClick={handleWin}>
        WIN
      </button>
    </div>
  );
};

export default Quantum;
