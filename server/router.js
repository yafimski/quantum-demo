const express = require("express");
const { getDB } = require("./db");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("server is up and running");
});

router.get(`/takeCards/:room/:num`, async (req, res) => {
  try {
    const roomName = req.params.room.toUpperCase();
    const numOfCards = parseInt(req.params.num, 10);

    const db = getDB();
    const roomsCollection = db.collection("rooms");
    const cardsCollection = db.collection("cards");

    const room = await roomsCollection.findOne({ name: roomName });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const allDocuments = await cardsCollection.find().toArray();
    const selectedDocs = [];

    const indices = getRandomIndices(numOfCards, 1228);

    for (const idx of indices) {
      if (!room.cards.includes(idx)) {
        room.cards.push(idx);
        selectedDocs.push(allDocuments[idx]);
      } else {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * 1228);
        } while (room.cards.includes(newIndex));
        room.cards.push(newIndex);
        selectedDocs.push(allDocuments[newIndex]);
      }
    }

    await roomsCollection.updateOne(
      { name: roomName },
      { $set: { cards: room.cards } }
    );

    res.status(200).json(selectedDocs);
  } catch (error) {
    res.status(500).json({ error });
  }
});

function getRandomIndices(count, maxIndex) {
  const indices = new Set();
  while (indices.size < count) {
    const randomIndex = Math.floor(Math.random() * maxIndex);
    indices.add(randomIndex);
  }
  return Array.from(indices);
}

router.get(`/checkRoom/:room`, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("rooms");

    const roomName = req.params.room;
    const document = await collection.findOne({ name: roomName });

    if (document) {
      const players = document.players;
      if (players.length === 7) {
        res.status(200).json({ status: "is full" });
      } else {
        res.status(200).json({ status: "available", token: document.token });
      }
    } else {
      res.status(200).json({ status: "does not exist" });
    }
  } catch {
    res.status(500).json({ status: "error" });
  }
});

router.get(`/hostRoom/:name/:randomRoom/:token`, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("rooms");

    const userName = req.params.name;
    const roomName = req.params.randomRoom;
    const uniqueToken = req.params.token;

    const result = await collection.insertOne({
      token: uniqueToken,
      name: roomName,
      players: [userName],
      cards: [],
    });

    if (result.acknowledged) {
      res.status(200).json({ message: "Room created successfully" });
    } else {
      res.status(500).json({ message: "Room creation failed" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get(`/joinRoom/:room/:name`, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("rooms");

    const roomName = req.params.room;
    const userName = req.params.name;

    const filter = {
      name: roomName,
      players: { $not: { $elemMatch: { $eq: userName } } },
    };

    const update = {
      $push: { players: userName },
    };

    const result = await collection.updateOne(filter, update);
    if (!result.acknowledged) {
      res.status(500).json({ check: "failed" });
    }

    if (result.matchedCount === 1) {
      res.status(200).json({ check: "available" });
    } else {
      res.status(200).json({ check: "taken" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get(`/deleteRoom/:room`, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("rooms");

    const roomName = req.params.room.toUpperCase();
    const query = {
      name: roomName,
      players: { $size: 0 },
    };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Room deleted successfully" });
    } else {
      res.status(404).json({ message: "Room not found or conditions not met" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get(`/deleteUser/:room/:name`, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("rooms");

    const roomName = req.params.room.toUpperCase();
    const userName = req.params.name;

    const query = {
      name: roomName,
    };

    const update = {
      $pull: { players: userName },
    };

    const result = await collection.updateOne(query, update);
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "User removed from room successfully" });
    } else {
      res.status(404).json({ message: "Room or userName not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get(`/validate/:room/:token`, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("rooms");

    const roomName = req.params.room.toUpperCase();
    const uniqueToken = req.params.token;

    const filter = {
      token: uniqueToken,
      name: roomName,
    };

    const document = await collection.findOne(filter);
    if (document) {
      res.status(200).json({ message: "valid token" });
    } else {
      res.status(404).json({ error: "invalid token" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get(`/logger/:players`, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("stats");

    const players = parseInt(req.params.players, 10);
    const document = await collection.findOne();

    if (document) {
      await collection.updateOne({}, { $inc: { totalRooms: 1 } });
      await collection.updateOne({}, { $inc: { totalPlayers: players } });
      res.status(200).json({ message: "data logged" });
    } else {
      res.status(404).json({ error: "invalid object" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
