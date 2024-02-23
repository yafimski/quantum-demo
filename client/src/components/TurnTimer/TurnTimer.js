import React, { useState, useEffect } from "react";

import "./TurnTimer.css";

const TurnTimer = ({ onTimerEnd }) => {
  const [count, setCount] = useState(30);

  let color = "timer-red";
  if (count >= 20) color = "timer-green";
  if (count < 20 && count >= 10) color = "timer-orange";

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (count === 0) {
      onTimerEnd();
    }
  }, [count, onTimerEnd]);

  return (
    <div className="timer-container">
      <div className={`timer ${color}`}>{count.toString()}</div>
    </div>
  );
};

const MemoizedTurnTimer = React.memo(TurnTimer);

export default MemoizedTurnTimer;
