const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Comments = require('../../models/Comments');
const User = require('../../models/User');
// @route   POST api/comments
// @desc    Find relevant conversation
// @access  Private
router.post(
  '/addcomment',
  [auth, [check('comment', 'Comment cannot be empty').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ _id: req.user.id });
      const { comment, movieId } = req.body;

      const commentFields = {
        user: req.user.id,
        username: user.firstname,
        text: comment,
        time: Date.now(),
      };

      let listOfComments = await Comments.findOne({ movieId: movieId });
      if (listOfComments) {
        const oneNewComment = await Comments.updateOne({
          $push: {
            comments: commentFields,
          },
        });
      } else {
        listOfComments = new Comments({
          movieId: movieId,
          comments: [],
        });
        listOfComments.comments.push(commentFields);
        await listOfComments.save();
      }

      return res.json(listOfComments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
