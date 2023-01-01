const { PrismaClient } = require("@prisma/client");

require("dotenv").config();
const prisma = new PrismaClient();
const algoliasearch = require("algoliasearch");

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);
const index = client.initIndex("anitalk");

const NUM = 10;

//スレッド作成
const createThread = async (req, res) => {
  const thread = req.body.data;

  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
    select: {
      id: true,
    },
  });

  const data = await prisma.thread.create({
    data: {
      userId: user.id,
      title: thread.title,
      description: thread.description,
    },
    include: { Response: true },
  });

  for (let i of thread.tag) {
    const tag = await prisma.tag.findUnique({
      where: {
        name: i,
      },
    });

    if (tag) {
      await prisma.tag.update({
        where: {
          name: i,
        },
        data: {
          amount: tag.amount + 1,
        },
      });
      const tags = await prisma.middleThreadAndTag.create({
        data: { tagId: tag.id, threadId: data.id },
      });
    } else {
      const newTag = await prisma.tag.create({
        data: {
          name: i,
          amount: 1,
        },
      });
      const tags = await prisma.middleThreadAndTag.create({
        data: {
          tagId: newTag.id,
          threadId: data.id,
        },
      });
    }
  }

  const data2 = await prisma.thread.findUnique({
    where: {
      id: data.id,
    },
    include: {
      Tag: {
        select: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
      Response: true,
    },
  });

  let arr = data2.Tag.map((item) => {
    return item.tag.name;
  });
  console.log(arr);

  await index.saveObject(
    {
      ...data2,
      createdAt: Date.parse(data.createdAt),
      Tag: arr,
      responseCount: 0,
    },
    { autoGenerateObjectIDIfNotExist: true }
  );

  res.send(data);
};

//get toppage threads
const getAllTreads = async (req, res) => {
  console.log(req.query);
  const len = await prisma.topPageThreads.count();
  console.log(len);
  // const data = await prisma.thread.findMany({
  //   skip: (Number(req.query.page) - 1) * 10,
  //   take: NUM,
  //   include: {
  //     creator: true,
  //     likedUser: true,
  //     savedUser: true,
  //     Tag: { include: { tag: true } },
  //     _count: {
  //       select: { Response: true },
  //     },
  //   },
  // });
  const data = await prisma.topPageThreads.findMany({
    skip: (Number(req.query.page) - 1) * 10,
    take: NUM,
    include: {
      thread: {
        include: {
          creator: true,
          likedUser: true,
          savedUser: true,
          Tag: { include: { tag: true } },
          _count: {
            select: { Response: true },
          },
        },
      },
    },
  });
  console.log(data);
  res.send({ data, len });
};

//選択threadのレスポンスを取得
///thread?id=xxx
const getThread = async (req, res) => {
  console.log(req.query.threadId);
  const thread = await prisma.thread.findUnique({
    where: { id: Number(req.query.threadId) },
    include: { creator: true, Response: { include: { creator: true } } },
  });
  // const response = await prisma.response.findMany({
  //   where: {
  //     AND: [{ threadId: Number(req.query.threadId) }, { parent: null }],
  //   },
  //   include: { creator: true },
  // });
  console.log(thread);
  res.send(thread);
};

//問題
//例えば、gとggというタグがあった際に、gで検索をすると両方出力されてしまう。
const getThreadByTag = async (req, res) => {
  console.log(req.query.tags);
  const tags = req.query.tags;
  console.log(tags);
  const data = await prisma.thread.findMany({
    where: {
      Tag: {
        some: {
          tag: {
            name: {
              in: tags,
            },
          },
        },
      },
    },
    include: {
      creator: true,
      likedUser: true,
      savedUser: true,
      Tag: { include: { tag: true } },
    },
  });
  console.log(data);
  res.send(data);
};

//いいねボタン
const favoriteThread = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });

  const data = await prisma.like.create({
    data: {
      threadId: req.body.threadId,
      userId: user.id,
    },
  });
  console.log(data);
  res.send(data);
};

//いいねをキャンセル
const removeFavoriteThread = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });
  const data = await prisma.like.delete({
    where: {
      userId_threadId: {
        threadId: req.body.threadId,
        userId: user.id,
      },
    },
  });
  res.send(data);
};

const getThreadOnlyThreaddata = async (req, res) => {
  console.log("run");
  const data = await prisma.thread.findUnique({
    where: {
      id: Number(req.query.threadId),
    },
    include: {
      creator: true,
      likedUser: true,
      savedUser: true,
      Tag: { include: { tag: true } },
      _count: {
        select: {
          Response: true,
        },
      },
    },
  });
  res.send(data);
};

const bookmarkThread = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });

  const data = await prisma.bookmark.create({
    data: {
      threadId: req.body.threadId,
      userId: user.id,
    },
  });
  res.send(data);
};

const removeBookmark = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });
  const data = await prisma.bookmark.delete({
    where: {
      userId_threadId: {
        threadId: req.body.threadId,
        userId: user.id,
      },
    },
  });
  res.send(data);
};

const deleteThread = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });

  const data = await prisma.thread.findUnique({
    where: {
      id: req.body.threadId,
    },
    include: {
      Response: true,
    },
  });

  if (data.userId === user.id || user.role === "admin") {
    const thread = await prisma.thread.findUnique({
      where: {
        id: req.body.threadId,
      },
      include: {
        Tag: true,
      },
    });
    await prisma.thread.delete({
      where: {
        id: req.body.threadId,
      },
    });

    console.log(thread);

    thread.Tag.forEach(async (item) => {
      const tag = await prisma.tag.findUnique({
        where: {
          id: item.tagId,
        },
      });
      if (tag.amount === 1) {
        await prisma.tag.delete({
          where: {
            id: item.tagId,
          },
        });
      } else {
        await prisma.tag.update({
          where: {
            id: item.tagId,
          },
          data: {
            amount: tag.amount - 1,
          },
        });
      }
    });
  } else {
    console.log("no");
  }
  const algoData = await index.findObject(
    (hit) => hit.id === req.body.threadId
  );
  console.log(algoData);

  await index.deleteObject(algoData.object.objectID);

  res.send(data);
};

const getTags = async (req, res) => {
  console.log(req.query.keyword);
  console.log(req.query.tags);
  const data = await prisma.tag.findMany({
    where: {
      name: { contains: req.query.keyword, notIn: req.query.tags },
    },
    take: 10,
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      amount: "desc",
    },
  });

  console.log(data);
  res.send(data);
};

const updateThread = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });

  const thread = await prisma.thread.findFirst({
    where: {
      id: Number(req.body.data.id),
    },
    include: {
      Tag: true,
    },
  });

  if (thread.userId !== user.id) {
    res.send("not");
  }

  const data = await prisma.thread.update({
    where: {
      id: Number(req.body.data.id),
    },
    data: {
      title: req.body.data.title,
      description: req.body.data.description,
    },
  });

  for (let i of req.body.data.tag) {
    const tag = await prisma.tag.findUnique({
      where: {
        name: i,
      },
    });
    let exist;
    if (tag) {
      exist = await prisma.middleThreadAndTag.findUnique({
        where: {
          tagId_threadId: {
            tagId: tag.id,
            threadId: Number(req.body.data.id),
          },
        },
      });
    }

    if (tag && exist) {
      console.log("this tag is already add to thread");
    } else if (tag) {
      await prisma.tag.update({
        where: {
          name: i,
        },
        data: {
          amount: tag.amount + 1,
        },
      });
      const tags = await prisma.middleThreadAndTag.create({
        data: { tagId: tag.id, threadId: data.id },
      });
    } else {
      const newTag = await prisma.tag.create({
        data: {
          name: i,
          amount: 1,
        },
      });
      const tags = await prisma.middleThreadAndTag.create({
        data: {
          tagId: newTag.id,
          threadId: data.id,
        },
      });
    }
  }

  res.send(data);
};

const bookMarklist = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
    select: {
      id: true,
    },
  });
  const len = await prisma.bookmark.count({
    where: {
      userId: user.id,
    },
  });
  const data = await prisma.bookmark.findMany({
    where: {
      userId: user.id,
    },
    include: {
      thread: {
        include: {
          creator: true,
          Tag: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { Response: true },
          },
          likedUser: true,
          savedUser: true,
        },
      },
    },
  });
  res.send({ data, len });
};

const likeList = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
    select: {
      id: true,
    },
  });

  const len = await prisma.like.count({
    where: {
      userId: user.id,
    },
  });

  const data = await prisma.like.findMany({
    skip: (Number(req.query.page) - 1) * 10,
    take: NUM,
    where: {
      userId: user.id,
    },
    include: {
      Thread: {
        include: {
          creator: true,
          Tag: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { Response: true },
          },
          likedUser: true,
          savedUser: true,
        },
      },
    },
  });
  res.send({ data, len });
};

const deleteTag = async (req, res) => {
  const id = await prisma.tag.findUnique({
    where: {
      name: req.body.tagName,
    },
  });

  const tag = await prisma.middleThreadAndTag.delete({
    where: {
      tagId_threadId: {
        tagId: id.id,
        threadId: Number(req.body.threadId),
      },
    },
  });
  if (id.amount === 1) {
    await prisma.tag.delete({
      where: {
        id: id.id,
      },
    });
  } else {
    await prisma.tag.update({
      where: {
        id: id.id,
      },
      data: {
        amount: id.amount - 1,
      },
    });
  }
  console.log(tag);
};

const reportThread = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
  });
  const data = await prisma.reportThread.create({
    data: {
      category: req.body.data.category,
      text: req.body.data.text,
      threadId: Number(req.body.data.thread.id),
      userId: user.id,
    },
  });
  res.send(data);
};

const getReportThread = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
  });

  console.log(user);

  if (user.role === "admin") {
    const data = await prisma.reportThread.findMany({});
    res.send(data);
  }
};

const getMyThreads = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
  });

  const len = await prisma.thread.count({
    where: {
      creator: {
        id: user.id,
      },
    },
  });

  const data = await prisma.thread.findMany({
    where: {
      creator: {
        id: user.id,
      },
    },
    skip: (Number(req.query.page) - 1) * 10,
    take: NUM,
  });

  console.log(data);

  res.send({ data, len });
};

const checkSameUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
  });

  const thread = await prisma.thread.findUnique({
    where: {
      id: Number(req.query.id),
    },
  });

  res.send(user.id === thread.userId);
};

module.exports = {
  createThread,
  getAllTreads,
  getThread,
  getThreadByTag,
  favoriteThread,
  removeFavoriteThread,
  getThreadOnlyThreaddata,
  bookmarkThread,
  removeBookmark,
  deleteThread,
  getTags,
  updateThread,
  bookMarklist,
  likeList,
  deleteTag,
  reportThread,
  getReportThread,
  getMyThreads,
  checkSameUser,
};
