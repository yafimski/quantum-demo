import React from "react";

import "./InfoBar.css";

const UserNames = ({ users }) => {
  return (
    <>
      {users.map((user) => (
        <p
          key={user.name}
          className={`username ${user.isTurn ? "activeUsername" : ""} ${
            user.isNext ? "activeNextUsername" : ""
          }`}
        >
          &nbsp;{user.name.toUpperCase()}&nbsp;
        </p>
      ))}
    </>
  );
};

export default UserNames;
