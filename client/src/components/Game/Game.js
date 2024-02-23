import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";

import "./Game.css";

import joinWAV from "../../sounds/join.wav";
import ask1WAV from "../../sounds/ask1.wav";
import ask2WAV from "../../sounds/ask2.wav";
import correctWAV from "../../sounds/correct.wav";
import wrongWAV from "../../sounds/wrong.wav";
import spookyRotateWAV from "../../sounds/spookyRotate.wav";
import spookyTakeWAV from "../../sounds/spookyTake.wav";
import winWAV from "../../sounds/win.wav";

import HelpModal from "../JoinBack/JoinBack";
import ExitModal from "../ExitModal/ExitModal";
import InfoBar from "../InfoBar/InfoBar";
import Message from "../Message/Message";
import Carousel from "../Carousel/Carousel";
import Decision from "../Decision/Decision";
import Ask from "../Ask/Ask";
import SpookyAction from "../SpookyAction/SpookyAction";
import Quantum from "../Quantum/Quantum";
import UserNames from "../InfoBar/UserNames";
import Splash from "../Splash/Splash";
import Winner from "../Winner/Winner";
import MemoizedTurnTimer from "../TurnTimer/TurnTimer";

let socket;

const joinSound = new Audio(joinWAV);
const ask1Sound = new Audio(ask1WAV);
const ask2Sound = new Audio(ask2WAV);
const correctSound = new Audio(correctWAV);
const wrongSound = new Audio(wrongWAV);
const spookyRotateSound = new Audio(spookyRotateWAV);
const spookyTakeSound = new Audio(spookyTakeWAV);
const winSound = new Audio(winWAV);

const Game = () => {
  useEffect(() => {
    const backHistory = (e) => {
      e.preventDefault();
      setExitModal(true);
    };

    window.addEventListener("popstate", backHistory);

    return () => {
      window.removeEventListener("popstate", backHistory);
    };
  }, []);

  const location = useLocation();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [currentCard, setCurrentCard] = useState(null);
  const [score, setScore] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [nextPlayer, setNextPlayer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [askCard, setAskCard] = useState(false);
  const [spookyCards, setSpookyCards] = useState([]);
  const [winner, setWinner] = useState(null);
  const [quantum, setQuantum] = useState(false);
  const [token, setToken] = useState(null);
  const [displayHelp, setDisplayHelp] = useState(false);
  const [exitModal, setExitModal] = useState(false);
  const [toggleSound, setToggleSound] = useState(true);
  const [timer, setTimer] = useState(false);

  useEffect(() => {
    const { name, room, token } = queryString.parse(location.search);

    socket = io();

    setName(name);
    setRoom(room);
    setToken(token);

    return () => {
      if (socket) {
        socket.disconnect();
        socket.off();
      }
    };
  }, [location.search]);

  window.addEventListener("popstate", (event) => openExit());

  useEffect(() => {
    if (token) {
      const validateRoom = async () => {
        try {
          const response = await fetch(`/api/validate/${room}/${token}`);

          if (response.ok) {
            if (socket) {
              const storedUserData = localStorage.getItem("quantumUserData");
              socket.emit(
                "join",
                { name, room, storedUserData },
                ({ user, users }) => {
                  setUser(user);
                  setUsers(users);
                }
              );
            }
          } else {
            console.error("Invalid token");
            window.location.href = `/`;
          }
        } catch (error) {
          console.error("Error validating room:", error);
          window.location.href = `/`;
        }
      };

      validateRoom().catch((error) => {
        console.error("Error in validation:", error);
      });
    }
  }, [name, room, token]);

  useEffect(() => {
    const getNextUserNum = (num) => (users.length === num ? 1 : num + 1);
    const getUserByNum = (num) => users.find((user) => user.playerNum === num);

    if (user && users.length > 0) {
      const nextUserNum = getNextUserNum(user.playerNum);
      const nextPlayerByNum = getUserByNum(nextUserNum);
      setNextPlayer(nextPlayerByNum);
    }
  }, [user, users]);

  useEffect(() => {
    const handleGameplay = (play) => {
      setMessages((prevMessages) => [play, ...prevMessages]);
    };

    const handleRoomData = ({ users }) => setUsers(users);

    socket.on("gameplay", handleGameplay);
    socket.on("roomData", handleRoomData);

    return () => {
      socket.off("gameplay", handleGameplay);
      socket.off("roomData", handleRoomData);
    };
  }, [setMessages, setUsers]);

  useEffect(() => {
    const handleUpdateUser = (updatedUser) => {
      setUser(updatedUser);

      const currentScore = updatedUser.cards.filter(
        (card) => card.quantum === "I"
      ).length;

      if (currentScore === 7 && updatedUser.isTurn) {
        socket.emit("quantum", () => {
          setQuantum(true);
          setIsAsking(false);
        });
      }
      setScore(currentScore);

      if (updatedUser.isTurn) {
        const spookyPair = checkSpookyAction(updatedUser);
        setSpookyCards(spookyPair);
        setAskCard(true);
        setIsAsking(true);
      } else {
        setSpookyCards([]);
        setAskCard(false);
        setIsAsking(false);
      }
    };

    socket.on("updateUser", ({ updatedUser }) => handleUpdateUser(updatedUser));
    return () => socket.off("updatedUser", handleUpdateUser);
  }, [setUser]);

  useEffect(() => {
    socket.on("playerIsAsking", (id) => {
      if (user && user.id === id) {
        setIsAsking(true);
      } else {
        setIsAsking(false);
      }
    });
  }, [user, setIsAsking]);

  useEffect(() => {
    socket.on("startTimer", () => setTimer(true));
    return () => socket.off("startTimer");
  });

  useEffect(() => {
    socket.on("endTimer", () => setTimer(false));
    return () => socket.off("endTimer");
  }, [setTimer]);

  useEffect(() => {
    socket.on("updateRoom", ({ users }) => setUsers(users));
    return () => socket.off("updateRoom");
  }, [setUsers]);

  useEffect(() => {
    socket.on("winner", ({ winnerName }) => setWinner(winnerName));
    return () => socket.off("winner");
  });

  useEffect(() => {
    socket.on("localStorage", ({ user }) => {
      const reducedCards = user.cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        quantum: card.quantum,
      }));
      const userData = { ...user, cards: reducedCards };

      localStorage.setItem("quantumUserData", JSON.stringify(userData));

      socket.emit("updateTurns", user, () => {});
    });

    return () => socket.off("localStorage");
  });

  useEffect(() => {
    const handlePlaySound = (soundType) => {
      if (toggleSound) {
        switch (soundType) {
          case "rotate":
            spookyRotateSound.play();
            break;
          case "win":
            winSound.play();
            break;
          case "join":
            joinSound.play();
            break;
          case "ask":
            const rand = Math.round(Math.random());
            rand === 0 ? ask1Sound.play() : ask2Sound.play();
            break;
          case "correct":
            correctSound.play();
            break;
          case "wrong":
            wrongSound.play();
            break;
          case "take":
            spookyTakeSound.play();
            break;
          default:
            break;
        }
      }
    };

    socket.on("playSound", handlePlaySound);
    return () => socket.off("playSound");
  }, [toggleSound, setToggleSound]);

  const checkSpookyAction = (user) => {
    const numCards = user.cards.length;
    for (let i = 0; i < numCards; i++) {
      const first = user.cards[i];
      for (let j = i + 1; j < numCards; j++) {
        const second = user.cards[j];
        if (
          first.answer === second.answer &&
          first.quantum !== second.quantum
        ) {
          return [first, second];
        }
      }
    }
    return [];
  };

  const askQuestion = () => {
    setAskCard(false);
    socket.emit("askQuestion", { user, card: currentCard }, (card) => {
      setCurrentCard(card);
    });
  };

  const answerDecision = (choice) => {
    socket.emit("endTimer", user, () => setTimer(false));

    socket.emit("endTurn", { user, card: currentCard, choice }, () => {
      setIsAsking(false);
      setAskCard(false);
    });
  };

  const spookyDecision = (choice) => {
    socket.emit("spookyAction", { user, spookyCards, choice }, (choice) => {
      if (choice === 3) {
        setAskCard(true);
      } else {
        setAskCard(false);
      }
      setSpookyCards([]);
    });
  };

  const onQuantumWin = () => socket.emit("endGame", { user }, () => {});
  const howToPlay = () => setDisplayHelp(true);
  const closeHelpModal = () => setDisplayHelp(false);
  const openExit = () => setExitModal(true);
  const onToggleSound = (flag) => setToggleSound(flag);

  const onExit = (exit) => {
    if (exit) {
      socket.disconnect();
      socket.off();
      window.location.href = `/`;
    }
    setExitModal(false);
  };

  const timerEnded = () => {
    socket.emit("endTimer", user, () => setTimer(false));

    if (user.isTurn) {
      answerDecision(false);
    }
  };

  return (
    <>
      {exitModal ? (
        <ExitModal handleExit={(exit) => onExit(exit)} />
      ) : (
        <div className="outerContainer">
          {displayHelp ? (
            <HelpModal onClose={closeHelpModal} />
          ) : (
            <>
              {users && !winner && !exitModal && (
                <>
                  <div className="userNamesContainer">
                    <UserNames users={users} />
                  </div>
                  <div className="infoBar">
                    <InfoBar
                      room={room}
                      score={score}
                      onHandleInfo={howToPlay}
                      onHandleExit={openExit}
                      onHandleSound={(flag) => onToggleSound(flag)}
                    />
                  </div>
                </>
              )}
              {users && users.length < 3 && !exitModal ? (
                <div className="fullContainer alignCenter">
                  <Splash usersInRoom={users.length} />
                </div>
              ) : winner ? (
                <div className="fullContainer">
                  <Winner winner={winner} buttonText="Play Again!" />
                </div>
              ) : (
                <>
                  {user && (
                    <>
                      <p className="carousel-title">YOUR CARDS:</p>
                      <Carousel
                        items={user.cards}
                        onFocus={(card) => setCurrentCard(card)}
                      />
                      {quantum && (
                        <div className="fullContainer">
                          <Quantum onWin={onQuantumWin} />
                        </div>
                      )}
                      {isAsking && (
                        <div className="buttonsContainer">
                          {spookyCards.length === 2 ? (
                            <SpookyAction
                              onDecide={(choice) => spookyDecision(choice)}
                            />
                          ) : (
                            <>
                              {askCard && nextPlayer && (
                                <Ask
                                  nextPlayer={nextPlayer.name}
                                  onAsk={() => askQuestion()}
                                />
                              )}
                            </>
                          )}
                          {isAsking && !askCard && (
                            <Decision
                              onDecide={(decision) => answerDecision(decision)}
                            />
                          )}
                        </div>
                      )}
                      {timer && <MemoizedTurnTimer onTimerEnd={timerEnded} />}
                      <div className="messagesContainer">
                        <ScrollToBottom>
                          {messages && <Message messages={messages} />}
                        </ScrollToBottom>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Game;
