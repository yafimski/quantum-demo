import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import MsgModal from "../MsgModal/MsgModal";
import JoinBack from "../JoinBack/JoinBack";
import JoinFront from "../JoinFront/JoinFront";

import "./Join.css";

const Join = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [roomValid, setRoomValid] = useState(null);
  const [displayModal, setDisplayModal] = useState(false);
  const [validMsg, setValidMsg] = useState(null);
  const [token, setToken] = useState(uuidv4());
  const [isFlipped, setIsFlipped] = useState(false);

  function generateRandomCode() {
    const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let roomCode = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      roomCode += charset.charAt(randomIndex);
    }

    return roomCode;
  }

  const randomRoom = generateRandomCode();

  useEffect(() => {
    let timeout;
    const fetchData = async () => {
      clearTimeout(timeout);
      try {
        const response = await fetch(`/api/checkRoom/${room}`);
        if (response.status === 200) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data) {
              if (data.status === "available") {
                setRoomValid(true);
                setValidMsg(null);
                setToken(data.token);
              } else {
                setRoomValid(false);
                setValidMsg(`Room ${data.status}!`);
                if (room.length === 6) toggleDisplayModal();
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [room, name]);

  const toggleDisplayModal = () => {
    setDisplayModal(true);
    setTimeout(() => {
      setDisplayModal(false);
    }, 2500);
  };

  const updateSetName = (text) => setName(text);
  const updateSetRoom = (text) => setRoom(text);
  const handleFlip = (flipState) => setIsFlipped(flipState);

  const handleJoinClick = (msg) => {
    setValidMsg(msg);
    toggleDisplayModal();
  };

  return (
    <>
      <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
        <div className="flip-card-inner">
          <>
            {!isFlipped ? (
              <div className="flip-card-front">
                <>
                  {displayModal && validMsg && <MsgModal msg={validMsg} />}
                  <JoinFront
                    name={name}
                    room={room}
                    roomValid={roomValid}
                    token={token}
                    randomRoom={randomRoom}
                    onSetName={(text) => updateSetName(text)}
                    onSetRoom={(text) => updateSetRoom(text)}
                    isFlipped={isFlipped}
                    onHandleFlip={(flipState) => handleFlip(flipState)}
                    onJoinClick={(msg) => handleJoinClick(msg)}
                  />
                </>
              </div>
            ) : (
              <div className="flip-card-back">
                <JoinBack
                  isFlipped={isFlipped}
                  onClose={(flipState) => handleFlip(flipState)}
                />
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default Join;
