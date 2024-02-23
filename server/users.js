const { ENDPOINT } = require("./db");

const rooms = {};

const addUser = async ({ id, name, room, storedUserData }) => {
  try {
    name = name.trim();
    room = room.trim();

    if (!rooms[room]) {
      rooms[room] = [];
    }

    const existingUser = rooms[room].find(
      (user) => user.room === room && user.name === name
    );
    if (existingUser) {
      return { error: "Username is taken!", user: null };
    }

    try {
      let cards = [];

      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.name === name && userData.room === room) {
          cards = JSON.parse(storedUserData).cards;
        }
      }
      if (cards.length === 0) {
        cards = await fetchInitialCardsFromAPI(room, 7);
        const numOnes = cards.filter((card) => card.quantum === "I").length;
        if (numOnes !== 3) {
          const quantumTypeNeeded = numOnes < 3 ? "I" : "O";
          const amountToReplace = numOnes < 3 ? 3 - numOnes : numOnes - 3;
          cards = await replaceCards(
            cards,
            amountToReplace,
            quantumTypeNeeded,
            room
          );
        }
      }

      const count = rooms[room].length;
      const playerNum = count + 1;
      const isTurn = playerNum === 1;
      const isNext = playerNum === 2;

      const user = { cards, playerNum, id, name, room, isTurn, isNext };
      rooms[room].push(user);

      return { error: null, user };
    } catch (error) {
      console.error("Error fetching cards: ", error);
      return { error: "An error occurred while creating user", user: null };
    }
  } catch (error) {
    console.error("Error adding User: ", error);
    return { error: "Error adding User", user: null };
  }
};

const replaceCards = async (cards, numToReplace, quantumTypeNeeded, room) => {
  const updatedCards = [...cards];
  const quantumTypeToRemove = quantumTypeNeeded === "I" ? "O" : "I";

  for (let i = 0; i < numToReplace; i++) {
    const indexOfCardToRemove = updatedCards.findIndex(
      (card) => card.quantum === quantumTypeToRemove
    );

    if (indexOfCardToRemove !== -1) {
      updatedCards.splice(indexOfCardToRemove, 1);
      const newCard = await drawQuantumCardFromAPI(room, quantumTypeNeeded);
      updatedCards.push(newCard);
    }
  }

  return updatedCards;
};

const drawQuantumCardFromAPI = async (room, quantum, maxRetries = 200) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(`${ENDPOINT}/api/takeCards/${room}/1`);
      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0].quantum === quantum) {
          return data[0];
        }
      }
    } catch (error) {
      console.error("Error fetching cards data:", error);
    }
    retries++;
  }
  throw new Error(
    `Failed to draw a ${quantum} quantum card after ${maxRetries} retries.`
  );
};

const fetchInitialCardsFromAPI = async (room, num) => {
  try {
    const response = await fetch(`${ENDPOINT}/api/takeCards/${room}/${num}`);

    if (response.status === 200) {
      const data = await response.json();
      if (data) {
        return data;
      }
    }
  } catch (error) {
    console.error("Error fetching cards data:", error);
  }
};

const getUserById = (id) => {
  for (const roomName in rooms) {
    const user = rooms[roomName].find((user) => user.id === id);
    if (user) {
      return user;
    }
  }
  return null;
};

const removeUser = (id) => {
  for (const roomName in rooms) {
    const room = rooms[roomName];
    const index = room.findIndex((user) => user.id === id);
    if (index !== -1) {
      const removedUser = room.splice(index, 1)[0];

      for (let i = index; i < room.length; i++) {
        room[i].playerNum -= 1;
      }

      if (removedUser.isTurn === true && room.length > 0) {
        const nextUser = room.find(
          (user) => user.playerNum === removedUser.playerNum
        );

        if (nextUser) {
          const whoIsNextNum = getNextUserNum(nextUser.playerNum, room);
          const whoIsNext = room.find(
            (user) => user.playerNum === whoIsNextNum
          );

          nextUser.isTurn = true;
          nextUser.isNext = false;
          whoIsNext.isNext = true;
        } else {
          room[0].isTurn = true;
        }
      }

      return removedUser;
    }
  }
  return null;
};

const getUserByNum = (num, room) =>
  rooms[room].find((user) => user.playerNum === num);

const getNextUserNum = (num, room) =>
  rooms[room].length === num ? 1 : num + 1;

const getNextPlayer = (num, room) => {
  const nextNum = getNextUserNum(num, room);
  const nextPlayer = getUserByNum(nextNum, room);

  return nextPlayer;
};

const getUsersInRoom = (room) => rooms[room].filter((user) => user);

const addCard = (user, cardToAdd) => {
  const cardsArray = Array.from(user.cards);
  cardsArray.push(cardToAdd);

  return updateUserCards(user, cardsArray);
};

const removeCard = (user, cardToRemove) => {
  const cardsArray = Array.from(user.cards);
  const updatedCards = cardsArray.filter(
    (card) =>
      !(
        card.quantum === cardToRemove.quantum &&
        card.question === cardToRemove.question
      )
  );

  return updateUserCards(user, updatedCards);
};

const drawNewCardFromAPI = async (user) => {
  try {
    const response = await fetch(`${ENDPOINT}/api/takeCards/${user.room}/1`);
    if (response.status === 200) {
      const data = await response.json();
      if (data) {
        updatedCards = [...user.cards, data[0]];
        return updateUserCards(user, updatedCards);
      }
    }
  } catch (error) {
    console.error("Error fetching cards data:", error);
    throw error;
  }
};

const updateUserCards = (user, updatedCards) => {
  const idx = rooms[user.room].findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    const updatedUser = { ...rooms[user.room][idx], cards: updatedCards };
    const updatedUsers = [...rooms[user.room]];
    updatedUsers[idx] = updatedUser;
    rooms[user.room] = updatedUsers;

    return updatedUser;
  } else {
    return { error: "no user found" };
  }
};

const updateUserInRoom = (updatedUser) => {
  const room = updatedUser.room;
  if (rooms[room]) {
    const index = rooms[room].findIndex((user) => user.id === updatedUser.id);
    if (index !== -1) {
      rooms[room][index] = updatedUser;
    }
  }
};

const getOneQuantumFromHand = (user) => {
  const cardsArray = Array.from(user.cards);
  const potentialCards = cardsArray.filter((card) => card.quantum === "I");

  if (potentialCards.length === 0) {
    return cardsArray[0];
  }

  return potentialCards[0];
};

const passCardsBetweenPlayers = (user, nextPlayer, card, oneQuantum) => {
  const nextPlayerWithoutOneQuantum = removeCard(nextPlayer, oneQuantum);
  const userWithOneQuantum = addCard(user, oneQuantum);
  const userWithoutCard = removeCard(userWithOneQuantum, card);
  const nextPlayerWithCard = addCard(nextPlayerWithoutOneQuantum, card);

  return {
    updatedPlayer: userWithoutCard,
    updatedNextPlayer: nextPlayerWithCard,
  };
};

const getNeighbors = (user) => {
  const num = user.playerNum;
  let nextPlayerNum;
  let previousPlayerNum;

  if (num === 1) {
    previousPlayerNum = rooms[user.room].length;
    nextPlayerNum = 2;
  } else {
    previousPlayerNum = num - 1;
    nextPlayerNum = num + 1;
  }

  const previousPlayer = getUserByNum(previousPlayerNum, user.room);
  const nextPlayer = getUserByNum(nextPlayerNum, user.room);

  return [previousPlayer, nextPlayer];
};

const rotateAllHandsClockWise = (room) => {
  const updatedUsers = [...rooms[room]];
  const numUsers = rooms[room].length;

  const lastUser = updatedUsers[numUsers - 1];
  const lastUserCards = lastUser.cards;
  lastUser.cards = [];

  for (let i = numUsers - 1; i > 0; i--) {
    const currentUser = updatedUsers[i];
    const prevUser = updatedUsers[i - 1];
    currentUser.cards = [...prevUser.cards];
  }

  const firstUser = updatedUsers[0];
  firstUser.cards = [...lastUserCards];

  rooms[room] = updatedUsers;

  return updatedUsers;
};

module.exports = {
  addUser,
  removeUser,
  getUserById,
  getUserByNum,
  getNextUserNum,
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
};
