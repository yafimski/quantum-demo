import React from "react";
import { Link } from "react-router-dom";

import "./Winner.css";
import podiumImage from "../../icons/podium.png";

const Winner = ({ winner, buttonText }) => {
  return (
    <div className="winner-container">
      <div className="winnerName">
        {winner}
        <br />
        WINS!
      </div>
      <div className="image-container">
        <img src={podiumImage} alt="winner" className="fullscreen-image" />
      </div>
      <Link to={`/`}>
        <button className="buttonPlayAgain" type="submit">
          {buttonText}
        </button>
      </Link>
    </div>
  );
};

export default Winner;
