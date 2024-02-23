import React, { useState } from "react";
import "./MsgModal.css";

function MsgModal({ msg }) {
  const [modalClassname, setModalClassname] = useState("msg-modal");

  setTimeout(() => {
    setModalClassname("msg-modal fade-out");
  }, 2500);

  return (
    <div className="modal-container">
      <div></div>
      <div className={modalClassname}>
        <span className="alertText">{msg}</span>
      </div>
      <div></div>
    </div>
  );
}

export default MsgModal;
