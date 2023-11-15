const express = require('express');
const path = require('path');
const publicDirPath = path.join(__dirname, '../../public/');
const Room = require('../models/room');
const auth = require('../middleware/auth');
const router = new express.Router();

router.get('/create', auth, async (req, res) => {
  const room = new Room({ room: req.query.room });

  try {
    await room.save();
    res.sendFile(publicDirPath + 'chat.html');
  } catch (e) {
    if (e.code == 11000) {
      res.send(
        `<script>alert("Room Code entered Cannot be Created! Try entering another room code!");
      location.href="room.html"</script>`
      );
    } else {
      let err = e.toString().replace('Error: ', '');
      err = err.replace('Validationroom: ', '');
      res.send(
        `<script>alert("${err}");
      location.href="room.html"</script>`
      );
    }
  }
});

router.get('/join', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ room: req.query.room });

    if (!room) {
      throw new Error("Room doesn't exist! Try entering another room code!");
    }

    if (room.locked) {
      throw new Error('Room is Locked!! Please Try again later.');
    }
    res.sendFile(publicDirPath + 'chat.html');
  } catch (e) {
    let err = e.toString().replace('Error: ', '');
    res.send(
      `<script>alert("${err}");
      location.href="room.html"</script>`
    );
  }
});

const stateChanged = async (room, btnText) => {
  try {
    const lockRoom = await Room.findOne({ room });
    if (btnText == 'Lock' && !lockRoom.locked) {
      lockRoom.locked = true;
      await lockRoom.save();
    } else if (btnText == 'Unlock' && lockRoom.locked) {
      lockRoom.locked = false;
      await lockRoom.save();
    }
    return lockRoom.locked;
  } catch (e) {
    console.log('stateChanged Error!!!', e);
    res.send(`<script>alert("Something went wrong!!");
    location.href="chat.html"</script>`);
  }
};

const deleteRoom = async room => {
  try {
    const dbRoom = await Room.findOne({ room });
    dbRoom.remove();
  } catch (e) {
    console.log(e);
  }
};

module.exports = { router, stateChanged, deleteRoom };
