const { PrismaClient } = require("@prisma/client");

require("dotenv").config();
const prisma = new PrismaClient();

const algoliasearch = require("algoliasearch");

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);
const index = client.initIndex("anitalk");

//レス
const createResponse = async (req, res) => {
  const response = req.body.resData;
  console.log(response);
  const user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
  });
  await prisma.response.create({
    data: {
      threadId: Number(response.thread_id),
      userId: user.id,
      text: response.text,
      img: response.img,
      parentId: response.parent,
    },
  });
  console.log("ok");

  const algoData = await index.findObject(
    (hit) => hit.id === Number(response.thread_id)
  );

  const data = await prisma.thread.findUnique({
    where: {
      id: Number(response.thread_id),
    },
    include: {
      Response: true,
    },
  });

  const count = await prisma.response.count({
    where: {
      threadId: Number(response.thread_id),
    },
  });

  await index.saveObject({
    ...data,
    responseCount: count,
    objectID: algoData.object.objectID,
    Tag: algoData.object.Tag,
    createdAt: algoData.object.createdAt,
  });

  const thread = await prisma.thread.findUnique({
    where: { id: Number(response.thread_id) },
    include: { creator: true, Response: { include: { creator: true } } },
  });

  res.send(thread);
};

//ある親レスの返信数を求める
const responseCount = async (req, res) => {
  const count = await prisma.response.findMany({
    where: {
      AND: [
        { NOT: [{ parentId: null }] },
        { parentId: Number(req.query.responseId) },
      ],
    },
  });
  // const c = count.length;
  res.send(count);
};

//ある親レスに対するレスを求める
const getReplyResponse = async (req, res) => {
  const count = await prisma.response.findMany({
    where: { parentId: Number(req.query.responseId) },
    include: { creator: true, children: true },
  });
  console.log(count);
  res.send(count);
};

const updateResponse = async (req, res) => {
  const data = await prisma.response.update({
    where: {
      id: Number(req.body.id),
    },
    data: {
      text: req.body.text,
      img: req.body.img,
    },
  });
};

const deleteResponse = async (req, res) => {
  const data = await prisma.response.delete({
    where: {
      id: req.body.id,
    },
  });
};

module.exports = {
  createResponse,
  responseCount,
  getReplyResponse,
  updateResponse,
  deleteResponse,
};
