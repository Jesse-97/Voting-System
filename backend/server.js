const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
const prisma = require('./prisma.js');
const app = express();
app.use(cors());
app.use(express.json());

app.listen(5000, () => {
  console.log(`Server running on port 5000`);
});

async function attachVoteCounts(polls) {
  const pollList = Array.isArray(polls) ? polls : [polls];
  const optionIds = pollList.flatMap((poll) => poll.options.map((option) => option.id));

  const voteCounts = optionIds.length
    ? await prisma.vote.groupBy({
        by: ["optionId"],
        where: { optionId: { in: optionIds } },
        _count: { optionId: true },
      })
    : [];

  const voteCountMap = new Map(
    voteCounts.map((entry) => [entry.optionId, entry._count.optionId])
  );

  const enrichedPolls = pollList.map((poll) => ({
    ...poll,
    options: poll.options.map((option) => ({
      ...option,
      voteCount: voteCountMap.get(option.id) || 0,
    })),
  }));

  return Array.isArray(polls) ? enrichedPolls : enrichedPolls[0];
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
  }

  if (typeof tags === "string") {
    return [...new Set(tags.split(",").map((tag) => tag.trim()).filter(Boolean))];
  }

  return [];
}

app.delete("/polls/:pollId", async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: { select: { id: true } } },
    });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.vote.deleteMany({
        where: { pollId },
      });

      await tx.option.deleteMany({
        where: { pollId },
      });

      await tx.poll.delete({
        where: { id: pollId },
      });
    });

    return res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Delete poll error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/polls/:pollId", async (req, res) => {
  try {
    const { pollId } = req.params;
    const {
      question,
      description,
      category,
      visibility,
      allowMultiple,
      tags,
    } = req.body;

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: {
        ...(typeof question === "string" ? { question: question.trim() } : {}),
        ...(typeof description === "string"
          ? { description: description.trim() || null }
          : {}),
        ...(typeof category === "string" ? { category } : {}),
        ...(typeof visibility === "string" ? { visibility } : {}),
        ...(typeof allowMultiple === "boolean"
          ? { allowMultiple }
          : {}),
        ...(tags !== undefined ? { tags: normalizeTags(tags) } : {}),
      },
      include: { options: true },
    });

    return res.status(200).json(await attachVoteCounts(updatedPoll));
  } catch (error) {
    console.error("Update poll error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/polls", async (req, res) => {
  try {
    const {
      question,
      description,
      category = "General",
      visibility = "public",
      allowMultiple = false,
      tags = [],
      expiresAt,
      createdBy,
      createdById,
      options = [],
    } = req.body;

    const trimmedQuestion = typeof question === "string" ? question.trim() : "";
    const trimmedDescription = typeof description === "string" ? description.trim() : "";
    const preparedOptions = Array.isArray(options)
      ? options
          .map((option) => ({ text: typeof option?.text === "string" ? option.text.trim() : "" }))
          .filter((option) => option.text)
      : [];
    const normalizedTags = normalizeTags(tags);
    const parsedExpiresAt = new Date(expiresAt);

    if (!trimmedQuestion) {
      return res.status(400).json({ message: "Question is required" });
    }

    if (!createdBy || !createdById) {
      return res.status(400).json({ message: "createdBy and createdById are required" });
    }

    if (Number.isNaN(parsedExpiresAt.getTime())) {
      return res.status(400).json({ message: "Valid expiresAt is required" });
    }

    if (preparedOptions.length === 0) {
      return res.status(400).json({ message: "At least one poll option is required" });
    }

    const poll = await prisma.$transaction(async (tx) => {
      const createdPoll = await tx.poll.create({
        data: {
          question: trimmedQuestion,
          description: trimmedDescription || null,
          category,
          visibility,
          allowMultiple: Boolean(allowMultiple),
          tags: normalizedTags,
          expiresAt: parsedExpiresAt,
          createdBy,
          createdById,
        },
      });

      await tx.option.createMany({
        data: preparedOptions.map((option) => ({
          text: option.text,
          pollId: createdPoll.id,
        })),
      });

      return tx.poll.findUnique({
        where: { id: createdPoll.id },
        include: { options: true },
      });
    });

    return res.status(201).json(await attachVoteCounts(poll));
  } catch (error) {
    console.error("Create poll error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/polls", async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      where: { visibility: "public" },
      include: { options: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(await attachVoteCounts(polls));
  } catch (error) {
    console.error("Fetch polls error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/polls/:pollId", async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    return res.status(200).json(await attachVoteCounts(poll));
  } catch (error) {
    console.error("Fetch poll error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/polls/:pollId/vote", async (req, res) => {
  try {
    const { pollId } = req.params;
    const { userId, optionIds } = req.body;

    if (!userId || !Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({ message: "userId and optionIds are required" });
    }

    const selectedOptionIds = [...new Set(optionIds.filter(Boolean))];

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: { select: { id: true } } },
    });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (!poll.allowMultiple && selectedOptionIds.length > 1) {
      return res.status(400).json({ message: "Multiple selections are not allowed" });
    }

    const pollOptionIds = new Set(poll.options.map((option) => option.id));
    const invalidOptionIds = selectedOptionIds.filter((optionId) => !pollOptionIds.has(optionId));

    if (invalidOptionIds.length > 0) {
      return res.status(400).json({ message: "One or more options do not belong to this poll" });
    }

    const existingVotes = await prisma.vote.findMany({
      where: { userId, pollId },
      select: { optionId: true },
    });

    const existingOptionIds = new Set(existingVotes.map((vote) => vote.optionId));
    const selectedOptionIdSet = new Set(selectedOptionIds);
    const optionIdsToIncrement = selectedOptionIds.filter((optionId) => !existingOptionIds.has(optionId));
    const optionIdsToDecrement = existingVotes
      .map((vote) => vote.optionId)
      .filter((optionId) => !selectedOptionIdSet.has(optionId));

    const updatedPoll = await prisma.$transaction(async (tx) => {
      await tx.vote.deleteMany({
        where: { userId, pollId },
      });

      for (const optionId of optionIdsToDecrement) {
        await tx.option.update({
          where: { id: optionId },
          data: { votes: { decrement: 1 } },
        });
      }

      for (const optionId of optionIdsToIncrement) {
        await tx.option.update({
          where: { id: optionId },
          data: { votes: { increment: 1 } },
        });
      }

      for (const optionId of selectedOptionIds) {
        await tx.vote.upsert({
          where: {
            userId_pollId_optionId: {
              userId,
              pollId,
              optionId,
            },
          },
          update: {},
          create: {
            userId,
            pollId,
            optionId,
          },
        });
      }

      return tx.poll.findUnique({
        where: { id: pollId },
        include: { options: true },
      });
    });

    return res.status(200).json(await attachVoteCounts(updatedPoll));
  } catch (error) {
    console.error("Vote error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
