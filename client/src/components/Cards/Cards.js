import React, { useState } from "react";

import "./Cards.css";

const Cards = ({ cards, onAsk }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAsk = (card) => {
    onAsk(card);
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };

  return (
    <>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Amita:wght@400;700&display=swap");
        `}
      </style>
      <button onClick={prevCard} className="prev-button">
        |
      </button>
      <div className="cards-gallery">
        {cards &&
          [currentIndex - 1, currentIndex, currentIndex + 1].map((i) => (
            <div key={i} className={`card ${i === currentIndex ? "active" : ""}`}>
              <p
                className="quantumSign"
                onClick={() => handleAsk(cards[(i + cards.length) % cards.length])}
              >
                {cards[(i + cards.length) % cards.length].quantum}
              </p>
              <p
                className="cardText"
                onClick={() => handleAsk(cards[(i + cards.length) % cards.length])}
              >
                {cards[(i + cards.length) % cards.length].answer}
              </p>
            </div>
          ))}
      </div>
      <button onClick={nextCard} className="next-button">
        |
      </button>
    </>
  );
};

export default Cards;
