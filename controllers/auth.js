const { PrismaClient } = require("@prisma/client");
const admin = require("../config/firebase-config");

require("dotenv").config();
const prisma = new PrismaClient();

//認証してuidをdbに登録する
//googleアカウントを使用してのサインアップとすべてのログインの時に使用する。
const register = async (req, res) => {
  // const token = req.headers.authorization.split(" ")[1];
  // const decodeValue = await admin.auth().verifyIdToken(token);
  // res.send(decodeValue);

  console.log(req.user);

  let user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: req.user.name,
        uid: req.user.uid,
        role: "author",
      },
    });
  }
  res.send(user);
};

const signInWithEmail = async (req, res) => {
  console.log(req.user);

  const user = await prisma.user.create({
    data: {
      name: req.body.user.name,
      uid: req.user.uid,
      role: "author",
    },
  });
  res.send(user);
};

const getUser = async (req, res) => {
  const user = await prisma.user.findMany();

  res.send(user);
};

const getMe = async (req, res) => {
  console.log(req.query);
  const me = await prisma.user.findUnique({
    where: { uid: req.query.uid },
  });

  res.send(me);
};

const updateProfile = async (req, res) => {
  await prisma.user.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      name: req.body.name,
      icon: req.body.icon,
    },
  });
  res.send("data");
};

const getAllUser = async (req, res) => {
  const data = await prisma.user.findMany({});

  res.send(data);
};

const deleteUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });

  if (user.role === "admin") {
    const data = await prisma.user.delete({
      where: {
        id: req.body.id,
      },
    });
  }

  res.send("ok");
};

module.exports = {
  register,
  getUser,
  getMe,
  updateProfile,
  signInWithEmail,
  getAllUser,
  deleteUser,
};
