const path = require('path')
const express = require('express')
const xss = require('xss')
const JokesService = require('./jokes-service')

const jokesRouter = express.Router()
const jsonParser = express.json()

const serializeJoke = joke => ({
    id: joke.id,
    joke: xss(joke.joke),
    punchline: xss(joke.punchline),
    submitted_by: xss(joke.submitted_by),
    date_submitted: (joke.date_submitted)
})

jokesRouter
    .route('/')
    .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    JokesService.getAllJokes(knexInstance)
        .then(jokes => {
            res.json(jokes.map(serializeJoke))
        })
        .catch(next)
    })

    .post(jsonParser, (req, res, next) => {
        const { joke, punchline, submitted_by } = req.body
        const newJoke = { joke, punchline, submitted_by }

        for(const [key, value] of Object.entries(newJoke)) {
            if (!value) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body`}
                })
            }
        }
        // newJoke.modified = modified

    JokesService.insertJoke(
        req.app.get('db'),
        newJoke
        )
        .then(joke =>{
            res.status(201)
                .location(path.posix.join(req.originalUrl + `/${joke.id}`))
                .json(serializeJoke(joke))
        })
        .catch(next)
    })
//GET, DELETE, UPDATE joke by id

    jokesRouter
        .route('/:id')
        .all((req, res, next) => {
            JokesService.getById(
                req.app.get('db'),
                req.params.id
            )
            .then(joke => {
                if(!joke) {
                    return res.status(404).json({
                        error: { message: `joke doesn't exist`}
                    })
                }
                res.joke = joke
                next()
            })
            .catch(next)
        })
        .get((req, res, next) => {
            res.json(serializeJoke(res.joke))
        })
        .delete((req, res, next) => {
            JokesService.deleteJoke(
                req.app.get('db'),
                req.params.id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
        })
        .patch(jsonParser, (req, res, next) => {
            const { joke, punchline, submitted_by } = req.body
            const jokeToUpdate = { joke, punchline, submitted_by }

            const requiredValues = joke || punchline || submitted_by
            if(!requiredValues){
                return res.status(400).json({
                    error: { message: `Request body must contain either 'joke', 'punchline', or 'submitted_by'`}
        });
    }
               
            JokesService.updateJoke(
                req.app.get('db'),
                req.params.joke_id,
                jokeToUpdate
            )
                .then(() => {
                    res.status(204).end()
                })
                .catch(next);
        })
    

    module.exports = jokesRouter