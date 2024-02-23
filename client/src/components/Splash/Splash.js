import React from "react";
import { Link } from "react-router-dom";

import "./Splash.css";

const Splash = ({ usersInRoom }) => {
  return (
    <>
      <div className="splash">
        <p className="main-text">
          Waiting for other players...<br></br>
          {usersInRoom} / 3 players minimum{" "}
        </p>
        <p className="sub-text">
          If you were kicked out of the room or something went wrong,<br></br>
          try rejoining the same room code with same player name.
        </p>
      </div>
      <Link to={`/`}>
        <button className="buttonPlayAgain" type="submit">
          Back to Lobby
        </button>
      </Link>
    </>
  );
};

export default Splash;
