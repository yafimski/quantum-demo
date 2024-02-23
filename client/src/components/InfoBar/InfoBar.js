import React, { useState } from "react";

import closeIcon from "../../icons/closeIcon.png";
import infoIcon from "../../icons/infoIcon.png";
import soundOn from "../../icons/soundOn.png";
import soundOff from "../../icons/soundOff.png";

import "./InfoBar.css";

const InfoBar = ({
  room,
  score,
  onHandleInfo,
  onHandleExit,
  onHandleSound,
}) => {
  const [soundIcon, setSoundIcon] = useState(soundOn);

  const handleExit = (flag) => {
    onHandleExit(flag);
  };

  const handleInfo = () => {
    onHandleInfo();
  };

  const handleSound = () => {
    if (soundIcon === soundOff) {
      onHandleSound(true);
      setSoundIcon(soundOn);
    } else {
      onHandleSound(false);
      setSoundIcon(soundOff);
    }
  };

  return (
    <>
      <div className="leftInnerContainer">
        <img
          className="infoIcon"
          src={infoIcon}
          alt="online"
          onClick={handleInfo}
        />
        <div>&nbsp;{room}</div>
        <img
          className="soundButton"
          src={soundIcon}
          alt="volume"
          onClick={handleSound}
        />
      </div>
      <div className="midInnerContainer">Score: {score} / 7</div>
      <div className="rightInnerContainer">
        <img src={closeIcon} alt="close" onClick={(flag) => handleExit(flag)} />
      </div>
    </>
  );
};

export default InfoBar;
