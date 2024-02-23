import React from "react";
import "./ExitModal.css";

function ExitModal({ handleExit }) {
  const handleLeave = () => {
    handleExit(true);
  };

  const handleStay = () => {
    handleExit(false);
  };

  return (
    <div className="exit-modal-container">
      <span>This might mess up the game for others ...</span>
      <span>Are you sure?</span>
      <div className="exitButtons">
        <button onClick={handleLeave}>Leave</button>
        <button onClick={handleStay}>Keep Playing</button>
      </div>
    </div>
  );
}

export default ExitModal;
