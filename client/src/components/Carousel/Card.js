import React from "react";

import "./Carousel.css";

function Card({ card }) {
  if (!card) {
    return;
  }

  return (
    <>
      <div className="card-quantum">{card.quantum}</div>
      <div className="card-answer">{card.answer}</div>
    </>
  );
}

export default Card;
