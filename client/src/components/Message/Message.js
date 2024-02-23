import React, { useEffect, useState } from "react";

import "./Message.css";
import GameplayCard from "../JoinBack/GameplayCard";

const Message = ({ messages }) => {
  const [animation, setAnimation] = useState("animation");

  useEffect(() => {
    setAnimation("animation");
    const timeout = setTimeout(() => {
      setAnimation("");
    }, 1000);

    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <>
      {messages.map((msg, i) => (
        <>
          <div
            key={i}
            className={`messageBox displayCard${msg.action || ""} ${animation}`}
          >
            <div className="messagesList">
              {msg.text &&
                msg.text.split("\n").map((txt, i) => (
                  <p key={i} className="messageText">
                    {txt}
                  </p>
                ))}
            </div>
            {(msg.card || msg.spookyA) && (
              <div className="cardsRow">
                {msg.action === "ZERO" && (
                  <GameplayCard text={msg.card.question} quantum={null} />
                )}
                {(msg.action === "ONE" || msg.action === "BAD") && (
                  <GameplayCard
                    text={msg.card.answer}
                    quantum={msg.card.quantum}
                  />
                )}
                {msg.action === "BOTH" && (
                  <>
                    <GameplayCard text={msg.card.question} quantum={null} />
                    <GameplayCard
                      text={msg.card.answer}
                      quantum={msg.card.quantum}
                    />
                  </>
                )}
                {msg.action === "SPOOKY" && (
                  <>
                    <GameplayCard
                      text={msg.spookyA.answer}
                      quantum={msg.spookyA.quantum}
                    />
                    <GameplayCard
                      text={msg.spookyB.answer}
                      quantum={msg.spookyB.quantum}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </>
      ))}
    </>
  );
};

export default Message;
