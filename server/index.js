const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const { connectToDB } = require("./db");

const {
  addUser,
  removeUser,
  getNextPlayer,
  getUsersInRoom,
  drawNewCardFromAPI,
  addCard,
  removeCard,
  getOneQuantumFromHand,
  passCardsBetweenPlayers,
  getNeighbors,
  rotateAllHandsClockWise,
  updateUserInRoom,
} = require("./users.js");

const PORT = process.env.PORT || 5000;

const app = express();

const router = require("./router");
app.use("/api", router);

const clientBuildPath = path.join(__dirname, "..", "client", "build");
app.use(express.static(clientBuildPath));
app.get("/*", function (req, res) {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

connectToDB();

const server = http.createServer(app);
const io = socketio(server);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

const { ENDPOINT } = require("./db");

io.on("connection", (socket) => {
  socket.on("join", async ({ name, room, storedUserData }, callback) => {
    addUser({ id: socket.id, name, room, storedUserData })
      .then(({ error, user }) => {
        if (error) return callback(error);

        const room = user.room;
        const name = user.name;

        socket.emit("gameplay", {
          user: "admin",
          text: `${name}, welcome to the room ${room}. You are player #${user.playerNum}.`,
          card: null,
          action: null,
        });

        socket.broadcast.to(room).emit("gameplay", {
          user: "admin",
          text: `${name} has joined!`,
          card: null,
          action: null,
        });

        socket.join(room);
        socket.emit("updateUser", { updatedUser: user });

        const users = getUsersInRoom(room);
        io.to(room).emit("roomData", { room, users });

        io.to(user.id).emit("playSound", "join");
        callback({ user, users });
      })
      .catch((error) => {
        console.error("Error adding user:", error);
      });
  });

  socket.on("updateTurns", (user, callback) => {
    const users = getUsersInRoom(user.room);
    users.forEach((updatedUser) => {
      updateUserInRoom(updatedUser);
      io.to(updatedUser.id).emit("updateUser", { updatedUser: updatedUser });
    });

    io.to(user.room).emit("updateRoom", { users });

    callback();
  });

  socket.on("askQuestion", ({ user, card }, callback) => {
    const nextPlayer = getNextPlayer(user.playerNum, user.room);

    io.to(user.room).emit("gameplay", {
      user: "admin",
      text: `${user.name} is asking ${nextPlayer.name}:`,
      card: card,
      action: "ZERO",
    });

    io.to(user.room).emit("startTimer");

    io.to(user.room).emit("playerIsAsking", user.id);
    io.to(nextPlayer.id).emit("playSound", "ask");

    callback(card);
  });

  socket.on("endTimer", (user, callback) => {
    io.to(user.room).emit("endTimer");
    callback();
  });

  socket.on("endTurn", async ({ user, card, choice }, callback) => {
    const nextPlayer = getNextPlayer(user.playerNum, user.room);

    let updatedPlayer = null;
    let updatedNextPlayer = nextPlayer;

    if (choice === true) {
      io.to(nextPlayer.id).emit("playSound", "correct");

      try {
        const existingUser = removeCard(user, card);
        updatedPlayer = await drawNewCardFromAPI(existingUser);

        io.to(user.room).emit("gameplay", {
          user: "admin",
          text: `${nextPlayer.name} blocked the Quantum Question!\n${updatedPlayer.name} draws a new card\n\nThe Quantum card discarded was:`,
          card: card,
          action: "BOTH",
        });
      } catch (error) {
        console.error("Error in gameplay:", error);
      }
    } else {
      io.to(nextPlayer.id).emit("playSound", "wrong");

      const oneQuantum = getOneQuantumFromHand(nextPlayer);

      ({ updatedPlayer, updatedNextPlayer } = passCardsBetweenPlayers(
        user,
        nextPlayer,
        card,
        oneQuantum
      ));

      io.to(user.room).emit("gameplay", {
        user: "admin",
        text: `${updatedNextPlayer.name} LOST a One Quantum to ${updatedPlayer.name},\nand TOOK the Zero Quantum!`,
        card: null,
        action: null,
      });

      io.to(updatedNextPlayer.id).emit("gameplay", {
        user: "admin",
        text: `You LOST the Quantum Card`,
        card: oneQuantum,
        action: "BAD",
      });

      let loser = "";
      if (oneQuantum.quantum === "O") {
        loser = `Sadly, ${updatedNextPlayer.name} has only Zero's to give :/`;
      }

      io.to(updatedPlayer.id).emit("gameplay", {
        user: "admin",
        text: `${loser}\nYou TOOK the Quantum Card`,
        card: oneQuantum,
        action: "ONE",
      });
    }

    updatedPlayer.isTurn = false;
    updatedPlayer.isNext = false;
    updatedNextPlayer.isTurn = true;
    updatedNextPlayer.isNext = false;

    const nextNextPlayer = getNextPlayer(
      updatedNextPlayer.playerNum,
      user.room
    );
    nextNextPlayer.isNext = true;

    updateUserInRoom(updatedPlayer);
    updateUserInRoom(updatedNextPlayer);
    updateUserInRoom(nextNextPlayer);

    const users = getUsersInRoom(user.room);
    users.forEach((updatedUser) => {
      io.to(updatedUser.id).emit("updateUser", { updatedUser: updatedUser });
    });

    io.to(updatedPlayer.room).emit("updateRoom", { users });

    callback();
  });

  socket.on("quantum", (callback) => {
    callback();
  });

  socket.on("spookyAction", async ({ user, spookyCards, choice }, callback) => {
    io.to(user.id).emit("gameplay", {
      user: "admin",
      text: `Spooky Quantum Cards`,
      spookyA: spookyCards[0],
      spookyB: spookyCards[1],
      action: "SPOOKY",
    });

    if (choice === 1) {
      const userWithOneDiscarded = removeCard(user, spookyCards[0]);
      const userWithTwoDiscarded = removeCard(
        userWithOneDiscarded,
        spookyCards[1]
      );

      const drawSingle = await drawNewCardFromAPI(userWithTwoDiscarded);
      const drawDouble = await drawNewCardFromAPI(drawSingle);

      drawDouble.isTurn = false;
      drawDouble.isNext = false;
      updateUserInRoom(drawDouble);

      const nextPlayer = getNextPlayer(drawDouble.playerNum, user.room);
      nextPlayer.isTurn = true;
      nextPlayer.isNext = false;
      updateUserInRoom(nextPlayer);

      const nextNextPlayer = getNextPlayer(nextPlayer.playerNum, user.room);
      nextNextPlayer.isNext = true;
      updateUserInRoom(nextNextPlayer);

      const updatedUsers = rotateAllHandsClockWise(user.room);
      updatedUsers.forEach((updatedUser) => {
        updateUserInRoom(updatedUser);
        io.to(updatedUser.id).emit("updateUser", { updatedUser: updatedUser });
      });

      io.to(user.room).emit("gameplay", {
        user: "admin",
        text: `${drawDouble.name} used the Spooky Action ability to discard the Spooky Pair and draw 2 new cards from the Deck.\nThey also ROTATE all hands clockwise!\nWatch out for your new Quantum Answers!`,
      });

      io.to(user.room).emit("playSound", "rotate");
    } else if (choice === 2) {
      const userWithOneDiscarded = removeCard(user, spookyCards[0]);
      const userWithTwoDiscarded = removeCard(
        userWithOneDiscarded,
        spookyCards[1]
      );

      let [previousPlayer, nextPlayer] = getNeighbors(user);
      const firstOneQuantum = getOneQuantumFromHand(previousPlayer);
      const secondOneQuantum = getOneQuantumFromHand(nextPlayer);

      const userWithOneAdded = addCard(userWithTwoDiscarded, firstOneQuantum);
      const userWithTwoAdded = addCard(userWithOneAdded, secondOneQuantum);

      const previousPlayerA = removeCard(previousPlayer, firstOneQuantum);
      const nextPlayerA = removeCard(nextPlayer, secondOneQuantum);

      const previousPlayerB = await drawNewCardFromAPI(previousPlayerA);
      const nextPlayerB = await drawNewCardFromAPI(nextPlayerA);

      userWithTwoAdded.isTurn = false;
      userWithTwoAdded.isNext = false;

      nextPlayerB.isTurn = true;
      nextPlayerB.isNext = false;

      const nextNextPlayer = getNextPlayer(nextPlayerB.playerNum, user.room);
      nextNextPlayer.isNext = true;

      updateUserInRoom(previousPlayerB);
      updateUserInRoom(userWithTwoAdded);
      updateUserInRoom(nextPlayerB);
      updateUserInRoom(nextNextPlayer);

      const users = getUsersInRoom(user.room);
      users.forEach((updatedUser) => {
        io.to(updatedUser.id).emit("updateUser", { updatedUser: updatedUser });
      });

      io.to(user.room).emit("gameplay", {
        user: "admin",
        text: `${user.name} used the Spooky Action ability to discard the Spooky Pair and to steal a One Quantum from each of the neighbors!\nThey each draw a new card from Deck.`,
      });

      io.to(previousPlayer.id).emit("gameplay", {
        user: "admin",
        text: `You LOST the Quantum Card`,
        card: firstOneQuantum,
        action: "BAD",
      });

      io.to(userWithTwoAdded.id).emit("gameplay", {
        user: "admin",
        text: `You GAINED the Quantum Cards from ${previousPlayer.name} and ${nextPlayer.name}:`,
        spookyA: firstOneQuantum,
        spookyB: secondOneQuantum,
        action: "SPOOKY",
      });

      io.to(nextPlayer.id).emit("gameplay", {
        user: "admin",
        text: `You LOST the Quantum Card`,
        card: secondOneQuantum,
        action: "BAD",
      });
      io.to(userWithTwoAdded.id).emit("playSound", "take");
    }

    const users = getUsersInRoom(user.room);
    users.forEach((updatedUser) => {
      io.to(updatedUser.id).emit("updateUser", { updatedUser: updatedUser });
    });

    callback(choice);
  });

  socket.on("endGame", async ({ user }, callback) => {
    io.to(user.room).emit("winner", { winnerName: user.name });
    io.to(user.room).emit("playSound", "win");

    const users = getUsersInRoom(user.room);
    await fetch(`${ENDPOINT}/api/logger/${users.length}`);

    callback();
  });

  socket.on("disconnect", async () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("localStorage", { user });

      const roomName = user.room;
      const userName = user.name;

      const response = await fetch(
        `${ENDPOINT}/api/deleteUser/${roomName}/${userName}`
      );
      if (response.status === 200) {
        io.to(roomName).emit("gameplay", {
          user: "admin",
          text: `${userName} has left.`,
          card: null,
          action: null,
        });

        try {
          const users = getUsersInRoom(roomName);
          if (users && users.length > 0) {
            io.to(roomName).emit("roomData", {
              room: roomName,
              users,
            });
          } else if (users.length === 0) {
            const result = await fetch(
              `${ENDPOINT}/api/deleteRoom/${roomName}`
            );
            if (result.status !== 200) {
              throw new Error(`Failed to delete Room`);
            }
          }
        } catch {
          throw new Error(`Issue with user array`);
        }
      } else {
        throw new Error(`Failed to delete User`);
      }
    }
  });
});
