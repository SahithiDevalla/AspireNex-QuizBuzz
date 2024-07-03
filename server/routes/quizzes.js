const express = require('express');
const Quizzes = require('../models/Quiz');
const checkAuth = require('../middleware/check-auth');
const Users = require('../models/Users');
const Score = require('../models/Scores');

const router = express.Router();

router.post('/create', checkAuth, (req, res) => {
    const quizData = req.body.quiz;
    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid quiz data' });
    }

    let quiz = new Quizzes({
        ...quizData,
        createdBy: req.body.createdBy,
        questions: quizData.questions.map(ques => ({
            ...ques,
            answers: ques.answers.map(ans => ({
                name: ans,
                selected: false
            }))
        }))
    });

    quiz.save()
        .then(result => res.status(200).json({ success: true }))
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

router.get("/my-quizzes/:id", checkAuth, (req, res) => {
    Quizzes.find({ createdBy: req.params.id })
        .then(result => res.status(200).json(result))
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

router.get('/all-quizzes', checkAuth, (req, res) => {
    Quizzes.find()
        .then(result => res.status(200).json(result))
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

router.get('/get-quiz/:id', checkAuth, (req, res) => {
    Quizzes.findOne({ _id: req.params.id })
        .then(quiz => res.status(200).json({ quiz }))
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

router.post('/add-comment', checkAuth, (req, res) => {
    Quizzes.updateOne({ _id: req.body.quizId }, {
        $push: {
            comments: {
                sentFromId: req.body.sentFromId,
                message: req.body.message
            }
        }
    })
    .then(() => res.status(200).json({ success: true }))
    .catch(err => res.status(500).json({ success: false, message: err.message }));
});

router.post('/like-quiz', checkAuth, (req, res) => {
    Users.findOne({ _id: req.body.userId, likedQuizzes: { $in: [req.body.quizId] } })
        .then(async user => {
            if (!user) {
                await Users.updateOne({ _id: req.body.userId }, {
                    $push: { likedQuizzes: req.body.quizId }
                });
                await Quizzes.updateOne({ _id: req.body.quizId }, {
                    $inc: { likes: 1 }
                });
                res.status(200).json({ message: 'Added To Liked' });
            } else {
                await Users.updateOne({ _id: req.body.userId }, {
                    $pull: { likedQuizzes: req.body.quizId }
                });
                await Quizzes.updateOne({ _id: req.body.quizId }, {
                    $inc: { likes: -1 }
                });
                res.status(200).json({ message: 'Removed from liked' });
            }
        })
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

router.post('/save-results', checkAuth, (req, res) => {
    let score = new Score({
        userId: req.body.currentUser,
        answers: req.body.answers,
        quizId: req.body.quizId
    });
    score.save()
        .then(async resp => {
            await Quizzes.updateOne({ _id: req.body.quizId }, {
                $push: { scores: resp._id }
            });
            res.status(200).json({ scoreId: resp._id });
        })
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

router.get('/results/:id', checkAuth, (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ success: false, message: 'No id provided in params' });
    }

    Score.findOne({ _id: req.params.id })
        .then(data => {
            if (!data) {
                return res.status(404).json({ success: false, message: 'Error finding score' });
            }

            Quizzes.findOne({ _id: data.quizId })
                .then(quiz => {
                    if (!quiz) {
                        return res.status(404).json({ success: false, message: 'Error getting quiz' });
                    }
                    res.status(200).json({ score: data, quiz: quiz });
                })
                .catch(err => res.status(500).json({ success: false, message: err.message }));
        })
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

module.exports = router;
