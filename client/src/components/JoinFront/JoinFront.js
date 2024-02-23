import React from "react";
import "./JoinFront.css";

const JoinFront = ({
  name,
  room,
  roomValid,
  token,
  randomRoom,
  onSetName,
  onSetRoom,
  isFlipped,
  onHandleFlip,
  onJoinClick,
}) => {
  const copyClick = async () => {
    try {
      await navigator.clipboard.writeText("quantum-trivia@protonmail.com");
      var tooltip = document.getElementById("tip");
      tooltip.innerHTML = "Copied";
    } catch (err) {}
  };

  const copyLeave = async () => {
    var tooltip = document.getElementById("tip");
    tooltip.innerHTML = "Click to copy";
  };

  const handleJoinClick = async (event) => {
    event.preventDefault();
    if (!name) {
      onJoinClick("Missing Name");
    } else if (!room) {
      onJoinClick("Missing Room Code");
    } else if (room.length < 6) {
      onJoinClick("Room Code too short");
    }

    if (roomValid) {
      const joinRoomPromise = fetch(`/api/joinRoom/${room}/${name}`)
        .then((response) => {
          const data = response.json();
          if (data) return data;
        })
        .catch((error) => {
          console.error("Error joining room:", error);
        });

      joinRoomPromise.then((data) => {
        if (data && data.check === "available") {
          window.location.href = `/game?name=${name}&room=${room}&token=${token}`;
        } else if (data && data.check === "taken") {
          onJoinClick("Username is taken!");
        }
      });
    }
  };

  const handleHostClick = async (event) => {
    event.preventDefault();
    if (!name) {
      return;
    }

    const createRoomPromise = fetch(
      `/api/hostRoom/${name}/${randomRoom}/${token}`
    )
      .then((response) => {
        if (!response.status === 200) {
          throw new Error("Error creating room data");
        }
      })
      .catch((error) => {
        console.error("Error creating room data:", error);
      });

    createRoomPromise.then(() => {
      window.location.href = `/game?name=${name}&room=${randomRoom}&token=${token}`;
    });
  };

  const maxLength = 6;

  const handleNameChange = (event) => {
    const inputText = event.target.value;
    if (inputText.length <= maxLength) {
      onSetName(inputText.toUpperCase());
    }
  };

  const handleRoomChange = (event) => {
    const inputText = event.target.value;
    if (inputText.length <= maxLength) {
      onSetRoom(inputText.toUpperCase());
    }
  };

  const flipCard = () => {
    onHandleFlip(!isFlipped);
  };

  return (
    <>
      <>
        <h1 className="heading mt-2 mb-0">QUANTUM</h1>
        <h2 className="subtitle mt-0">
          <b>A Fun Trivia Game!</b>
        </h2>
        <h3 className="small-title mb-2 mt-1">
          Join a room with your friends<br></br>(3 - 7 players)
        </h3>
      </>
      <div>
        <input
          placeholder="Name"
          className={`${
            name.trim() === "" ? "joinInput highlight-red" : "joinInput"
          }
            ${name.length > 0 ? "joinInput highlight-green" : "joinInput"}`}
          type="text"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div>
        <input
          placeholder="Room Code"
          className={`
            ${
              room.trim() === "" || room.length < 6
                ? "joinInput highlight-red"
                : "joinInput"
            } 
            ${room.length === 6 ? "joinInput highlight-green" : "joinInput"}`}
          type="text"
          value={room}
          onChange={handleRoomChange}
        />
      </div>
      <div className="buttons-container mt-1 mb-1">
        <button className="button" type="submit" onClick={handleJoinClick}>
          JOIN
        </button>
        <button className="button host" type="submit" onClick={handleHostClick}>
          HOST
        </button>
      </div>
      <div className="mb-1">
        <button className="help-button" type="submit" onClick={flipCard}>
          ?
        </button>
      </div>
      <div className="emailTooltip">
        <span className="tooltipText" id="tip">
          Click to Copy
        </span>
        <button
          className="email"
          onClick={() => copyClick()}
          onMouseOut={() => copyLeave()}
        >
          quantum-trivia@protonmail.com
        </button>
      </div>
    </>
  );
};

export default JoinFront;
