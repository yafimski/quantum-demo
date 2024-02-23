import React, { useRef, useEffect, useState } from "react";
import Card from "./Card";

import "./Carousel.css";

function Carousel({ items, onFocus }) {
  const [active, setActive] = useState(3);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchMoveX, setTouchMoveX] = useState(0);
  const [maxDrag] = useState(window.innerWidth - window.innerWidth / 8);

  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (touchStartX !== null) {
        const moveX = e.touches[0].clientX;
        const deltaX = moveX - touchStartX;
        setTouchStartX(moveX);

        if (Math.abs(touchMoveX + deltaX) <= maxDrag) {
          setTouchMoveX((prevMoveX) => prevMoveX + deltaX);
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener("touchmove", handleTouchMove);

    return () => {
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [maxDrag, touchMoveX, touchStartX]);

  useEffect(() => {
    let translateX = (touchMoveX / window.innerWidth) * 50;
    if (translateX > -50 && translateX < 50) {
      containerRef.current.style.transform = `translateX(${translateX + "%"})`;

      const screenMidX = window.innerWidth / 2;
      const itemElements = document.querySelectorAll(".item");

      let closestItemIndex = null;
      let closestDistance = Infinity;

      itemElements.forEach((itemElement, index) => {
        const itemRect = itemElement.getBoundingClientRect();
        const itemMidX = (itemRect.left + itemRect.right) / 2;

        const distance = Math.abs(itemMidX - screenMidX);
        if (distance < closestDistance) {
          closestItemIndex = index;
          closestDistance = distance;
        }
      });

      if (closestItemIndex !== null) {
        setActive(closestItemIndex);
      }
    } else {
      const dir = touchMoveX <= 0;
      setTouchMoveX((prevMoveX) => (dir ? prevMoveX + 10 : prevMoveX - 10));
      translateX = (touchMoveX / window.innerWidth) * 50;
      containerRef.current.style.transform = `translateX(${translateX + "%"})`;
    }
  }, [touchMoveX]);

  useEffect(() => {
    const activeElement = document.querySelector(".active");
    if (activeElement) {
      const quantumText = activeElement.querySelector(".card-quantum").textContent;
      const answerText = activeElement.querySelector(".card-answer").textContent;

      const currentCard = items.find(
        (card) => card.quantum === quantumText && card.answer === answerText
      );
      onFocus(currentCard);
    }
  }, [active, items, onFocus]);

  const generateItems = () => {
    return items.map((card, index) => {
      return (
        <div key={index} className={`item ${index === active ? "active" : ""}`}>
          <Card card={card} />
        </div>
      );
    });
  };

  const handleArrow = (leftDirection) => {
    const pushAmount = leftDirection ? -window.innerWidth / 3.5 : window.innerWidth / 3.5;
    const numSteps = 20;
    const step = pushAmount / numSteps;

    let i = 0;
    const pushInterval = setInterval(() => {
      setTouchMoveX((prevMoveX) => prevMoveX + step);

      i++;
      if (i === numSteps) {
        clearInterval(pushInterval);
      }
    }, 15);
  };

  return (
    <div className="carousel-wrapper">
      <div className="arrow arrow-left" onClick={() => handleArrow(false)}></div>
      <div id="carousel">
        <div
          className="transition-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={() => setTouchStartX(null)}
          ref={containerRef}
        >
          {generateItems()}
        </div>
      </div>
      <div className="arrow arrow-right" onClick={() => handleArrow(true)}></div>
    </div>
  );
}

export default Carousel;
