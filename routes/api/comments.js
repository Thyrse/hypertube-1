const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Comments = require('../../models/Comments');
const User = require('../../models/User');

// @route   POST api/comments/addcomment
// @desc    Post new comment
// @access  Private
router.post(
  '/addcomment',
  [auth, [check('comment', 'Comment cannot be empty').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      retStatus = 'Error';
      return res.send({
        retStatus: retStatus,
        authorized: false,
        msg: 'Comment cannot be empty.',
      });
    }

    try {
      let user = await User.findOne({ _id: req.user.id });
      const { comment, imdbId } = req.body;

      const commentFields = {
        user: req.user.id,
        username: user.username,
        text: comment,
        time: Date.now(),
      };

      let listOfComments = await Comments.findOne({ imdbId: imdbId });
      if (listOfComments) {
        const oneNewComment = await listOfComments.updateOne({
          $push: {
            comments: commentFields,
          },
        });
      } else {
        listOfComments = new Comments({
          imdbId: imdbId,
          comments: [],
        });
        listOfComments.comments.push(commentFields);
        await listOfComments.save();
      }

      let newListOfComments = await Comments.findOne({ imdbId: imdbId });
      newListOfComments.comments.reverse(); // show the latest comment first

      return res.json(newListOfComments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/comments/:movidId
// @desc    Get comments by imdbId
// @access  Private

router.get('/:imdbId', async (req, res) => {
  try {
    const commentary = await Comments.findOne({
      imdbId: req.params.imdbId,
    });
    // if (!commentary) return res.json([]);
    if (!commentary) {
      retStatus = 'Empty';
      return res.send({
        retStatus: 'Empty',
      });
    }
    commentary.comments.reverse(); // show the latest comment first
    res.json(commentary);
  } catch (err) {
    console.error(err.message);
    console.error('Non ca fonctionne pas du tout la');
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' }); // display message for non-valid userid
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
