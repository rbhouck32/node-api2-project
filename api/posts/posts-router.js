const express = require("express");

const router = express.Router();
const Posts = require("../db-helpers.js");
const { findById } = require("../db-helpers.js");
const { restart } = require("nodemon");

// Get ALL POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Posts.find();
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "The posts information could not be retrieved." });
  }
});

// GET POSTS BY SPECIFIC ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postById = await Posts.findById(id);
    res.status(200).json(postById);
  } catch {
    res.status(404).json({
      message: "The post with the specified ID does not exist.",
    });
  }
});

// get comments from a specific post ..... getting back multiple posts but they contain same id?

router.get("/:id/comments", (req, res) => {
  const { id } = req.params;
  if (id) {
    Posts.findPostComments(id).then((comments) =>
      res
        .status(200)
        .json(comments)
        .catch(() =>
          res
            .status(500)
            .json({ error: "The comments information could not be retrieved." })
        )
    );
  } else {
    res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });
  }
});

// CREATE NEW POSTS

router.post("/", async (req, res) => {
  const post = req.body;
  const { title, contents } = req.body;

  try {
    if (!title || !contents) {
      res.status(400).json({
        errorMessage: "Please provide title and contents for the post.",
      });
    } else {
      const { id } = Posts.insert(post);
      const newPost = await Posts.findById(id);
      res.status(201).json(newPost[0]);
    }
  } catch (error) {
    res.status(500).json({
      error: "There was an error while saving the post to the database",
    });
  }
});

router.post("/:id/comments", (req, res) => {
  const { id } = req.params;
  const newComment = { ...req.body, post_id: id };
  if (typeof newComment.text === "undefined") {
    res
      .status(400)
      .json({ errorMessage: "Please provide text for the comment." });
  } else {
    Posts.insertComment(newComment)
      .then((addedComment) => {
        if (addedComment) {
          res.status(201).json(addedComment);
        } else {
          res.status(404).json({
            message: "The post with the specified ID does not exist.",
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: "There was an error while saving the comment to the database",
        });
      });
  }
});

// DELETE POSTS reuest using ID of Post

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  Posts.remove(id)
    .then(() => {
      res.status(200).json({ message: "Your Post has been Deleted" });
    })
    .catch((err) => {
      res.status(500).json({ error: "The post could not be removed" });
    });
});

// Update a Post

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updatedPost = req.body;
  const { title, contents } = req.body;

  if (title || contents) {
    Posts.update(id, updatedPost)
      .then(() =>
        res.status(200).json({ message: "Post has updated successfully" })
      )
      .catch(() =>
        res
          .status(500)
          .json({ error: "The post information could not be modified." })
      );
  } else {
    res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });
  }
  if (!title || !contents) {
    res.status(400).json({
      errorMessage: "Please provide title and contents for the post.",
    });
  }
});

module.exports = router;
