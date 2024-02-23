import React, { useEffect } from "react";
import HelpCard from "./HelpCard";

import "./JoinBack.css";

const JoinBack = ({ isFlipped, onClose }) => {
  const handleClose = () => {
    onClose(!isFlipped);
  };

  const handleScroll = () => {
    const backToTopButton = document.querySelector(".back-to-top");
    const modalContainer = document.querySelector(".fullscreen-modal");
    if (backToTopButton) {
      const isAtTop = modalContainer.scrollTop < 10;
      backToTopButton.style.display = isAtTop ? "none" : "flex";
    }
  };

  const scrollToTop = () => {
    const modalContainer = document.querySelector(".fullscreen-modal");
    if (modalContainer) {
      modalContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const modalContainer = document.querySelector(".fullscreen-modal");
    modalContainer.addEventListener("scroll", handleScroll);
    return () => {
      modalContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fullscreen-modal">
      <div className="modal-content">
        <div className="modal-row sticky">
          <div onClick={handleClose} className="close-button">
            X
          </div>
          <div className="header">
            <p>
              <b>QUANTUM</b>
            </p>
            <h3>How to Play</h3>
          </div>
        </div>
        <div className="modal-row full-bleed no-border clip-black">
          <p className="subheader">Quick Summary</p>
          <div className="content mb-1">
            <p>
              <b>This is a SOCIAL trivia game!</b>
            </p>
            <p>Ask each other Question cards.</p>
            <br></br>
            <p>
              The <b>Answer</b> is on the opposite face of the card. Your
              visible hand contains the Answer faces only.
            </p>
            <br></br>
            <p>
              The <b>Question</b> itself is hidden, until you ask the Quantum
              Card.
            </p>
            <br></br>
            <p>
              Cards have a Quantum quality, which is, they are either{" "}
              <b>Zeros</b> or <b>Ones</b>.
            </p>
            <p>
              <b>Get rid of your Zeros by asking them.</b>
            </p>
            <br></br>
            <p>
              When someone is wrong, they lose a <b>One</b> card to you.
            </p>
            <br></br>
            <p>
              <b>A full hand of Ones, wins !</b>
            </p>
            <br></br>
            <p className="footer">
              Enjoy!<br></br>(or keep reading)
            </p>
          </div>
        </div>
        <div className="modal-row">
          <p className="subheader mb-05">How to Win</p>
          <div className="content mb-1">
            <p>
              when your hand is all <b>One's</b> then
            </p>
            <p>
              in your turn shout <b>"QUANTUM"</b> to WIN!
            </p>
            <br></br>
            <div className="col-7">
              <HelpCard quantum={"I"} />
              <HelpCard quantum={"I"} />
              <HelpCard quantum={"I"} />
              <HelpCard quantum={"I"} />
              <HelpCard quantum={"I"} />
              <HelpCard quantum={"I"} />
              <HelpCard quantum={"I"} />
            </div>
            <br></br>
            <p className="mini-text">
              * If you gained a <b>One</b> on this turn, your turn ends. You can
              only declare yourself a winner at the start of your next turn !
            </p>
          </div>
        </div>
        <div className="modal-row">
          <p className="subheader">The Cards</p>
          <div className="content">
            <p>
              Each card in the player's hand has a <b>Quantum Question</b> on
              the back side and a <b>Quantum Answer</b> on the front side (Zero
              or One):
            </p>
          </div>
          <div className="the-cards">
            <div className="col-3">
              <p className="lightbold card-title">Quantum Question</p>
              <p className="lightbold">Zero Answer</p>
              <p className="lightbold">One Answer</p>
            </div>
            <div className="col-3">
              <HelpCard text={"Which shape has three 60 degree angles?"} />
              <HelpCard text={"Equilateral Triangle"} quantum={"O"} />
              <HelpCard text={"Equilateral Triangle"} quantum={"I"} />
            </div>
            <div className="col-3">
              <p></p>
              <p className="mini-text">Zeros are for losers</p>
              <p className="mini-text">Keep these</p>
            </div>
          </div>
        </div>
        <div className="modal-row">
          <p className="subheader">How to Deal</p>
          <div className="content mb-1">
            <p>
              Each player gets 7 <b>Quantum Cards:</b>
            </p>
            <br></br>
            <div className="col-7">
              <HelpCard quantum={"O"} />
              <HelpCard quantum={"I"} />
              <HelpCard quantum={"O"} />
              <HelpCard quantum={"O"} />
              <HelpCard quantum={"I"} />
              <HelpCard quantum={"O"} />
              <HelpCard quantum={"O"} />
            </div>
            <br></br>
            <p>
              You can't see <b>Questions</b>, only <b>Answers!</b>
            </p>
            <br></br>
            <p>
              The current player's name is highlighted and they can choose which
              card to ask.
            </p>
          </div>
        </div>
        <div className="modal-row full-bleed no-border clip-black-bow">
          <p className="subheader">Rules and guidelines</p>
          <div className="content mb-2">
            <p>3 to 7 players</p>
            <br></br>
            <p>
              DO NOT reveal an <b>Answer</b> out loud if it is not your turn.
            </p>
            <br></br>
            <p>
              Your knowledge is yours.<br></br>You don't know? don't complain!
            </p>
            <br></br>
            <p>
              Do not 'suggest' or 'guess' while others are answering.. that's
              rude!
            </p>
            <br></br>
            <p>
              The player who asks you, decides if your answer is 'good enough'.
            </p>
            <br></br>
            <p>Ignorance is bliss.</p>
          </div>
        </div>
        <div className="modal-row">
          <h2 className="subheader">
            Gameplay
            <span>How to Ask</span>
          </h2>
          <div className="content mb-2">
            <div className="col-1 mb-1">
              <HelpCard text={"Which shape has three 60 degree angles?"} />
            </div>
            <br></br>
            <p>
              <b className="purple-title">1. Ask a card in your turn.</b>
              <br></br>
              <br></br>This reveals to everyone what the Quantum Question is.
              <br></br>Only you know the Answer <b>for now!</b>
            </p>
            <br></br>
            <p>
              Remember, before you ask, you see only the <b>Answer</b>, not the{" "}
              <b>Question!</b>
            </p>
            <br></br>
            <p>
              Select a <b>Zero</b> card from your hand to ask, and try to get
              rid of it.
            </p>
            <br></br>
            <p>
              Try to ask a <b>Quantum Answer</b> that your opponent will{" "}
              <b>NOT</b> know.
            </p>
            <br></br>
            <br></br>
            <p>
              <b className="purple-title">2. Read the Question OUT LOUD</b>
            </p>
            <br></br>
            <br></br>
            <p>
              <b className="purple-title">3. The opponent MUST answer!</b>
            </p>
          </div>
        </div>
        <div className="modal-row">
          <h2 className="subheader">
            Gameplay
            <span>How to Answer</span>
          </h2>
          <div className="content mb-2">
            <p>
              When asked a Quantum Question you <b>MUST</b> answer.
              <br></br>
              <br></br>
              <b>then:</b>
            </p>
            <div>
              <p>
                <b className="green-title">- IF YOU KNOW -</b>
              </p>
              <p>
                The <b>Quantum Question</b> is blocked and it is thrown away.
              </p>
              <p>The player who asked, gets a new card from the Deck.</p>
            </div>
            <div>
              <div>
                <p>
                  <br></br>
                  <b className="red-title">- YOU ARE IGNORANT -</b>
                </p>
              </div>
              <p>
                The player who asked gets a <b>One Quantum</b> from your hand.
                <br></br>
                <br></br>(if you have only Zeros, they will get a Zero instead).
              </p>
              <p>
                You take the <b>Question</b> card.
                <br></br> (usually a <b>Zero Quantum</b>)
              </p>
            </div>
            <p>
              If the <b>Question</b> is discarded<br></br>everyone gets to see
              the <b>Question AND the Answer!</b>
              <br></br>
              (you learn something new every day)
            </p>
          </div>
        </div>
        <div className="modal-row no-border">
          <div className="content">
            <h2 className="subheader">Spooky Action</h2>
            <p>
              When a player's hand contains <b>two identical Quantum Answers</b>
              , where one is a <b>Zero</b> and the other is a <b>One</b>:
            </p>
            <br></br>
            <div className="col-2">
              <HelpCard text={"Equilateral Triangle"} quantum={"O"} />
              <HelpCard text={"Equilateral Triangle"} quantum={"I"} />
            </div>
            <p>
              <br></br>
              then they are allowed <b>IN THEIR TURN</b> (they can also play a
              normal turn), to do one of the following actions:
            </p>
            <div>
              <br></br>
              <p>
                <b className="purple-title">Option A</b>
              </p>
              <p>1. Discard both spooky cards</p>
              <p>2. Draw two new cards</p>
              <p>3. Rotate all hands clockwise</p>
            </div>
            <div>
              <br></br>
              <p>
                <b className="purple-title">Option B</b>
              </p>
              <p>1. Discard both spooky cards</p>
              <p>
                2. Get a <b>One</b> card from each of their neighbors
              </p>
              <p>3. Draw a card to complete to 7</p>
            </div>
          </div>
        </div>
        <div className="modal-row full-bleed reverse-clip">
          <p className="footer">
            What are you waiting for?!<br></br>Let's play!
          </p>
        </div>
        <div className="back-to-top" onClick={scrollToTop}>
          V
        </div>
      </div>
    </div>
  );
};

export default JoinBack;
