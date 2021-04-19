const { expect } = require('chai')
const { expectCt } = require('helmet')
const knex = require('knex')
const supertest = require('supertest')
// const { delete } = require('../src/app')
const app = require('../src/app')
const { makeJokeArray, makeMaliciousJoke } = require('./joke-fixtures')

describe('Chuckles Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('chuckles_jokes').truncate())

    afterEach('cleanup', () => db('chuckles_jokes').truncate())

//GET /api/jokes
   
    describe('GET /api/jokes', () => {

        context('Given there are no jokes in the db', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                .get('/api/jokes')
                .expect(200, [])
            })
        })

        context('Given there are jokes in the database', () => {
            const testJokes = makeJokeArray()

            beforeEach('insert jokes', () => {
                return db
                    .into('chuckles_jokes')
                    .insert(testJokes)
            })

            it('responds with 200 and all the jokes', () => {
                return supertest(app)
                .get('/api/jokes')
                .expect(200, testJokes)
            })
        })

        context('Given an xss attack joke', () => {
            const { maliciousJoke, expectedJoke } = makeMaliciousJoke()
            
            beforeEach('insert a malicious joke', () => {
                return db
                .into('chuckles_jokes')
                .insert(maliciousJoke)
            })
            
            it('it removes xss attack joke', () => {
                return supertest(app)
                    .get('/api/jokes')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].joke).to.eql(expectedJoke.joke)
                        expect(res.body[0].punchline).to.eql(expectedJoke.punchline)
                        expect(res.body[0].submitted_by).to.eql(expectedJoke.submitted_by)
                    })
            })
        })
    })

//GET /api/jokes/:id

    describe('GET /api/jokes/:id', () => {
        
        context('Given there are no jokes in db', () => {
            it('responds with 404', () => {
                const jokeId = 123456
                return supertest(app)
                    .get(`/api/jokes/${jokeId}`)
                    .expect(404, {
                        error: { message: `joke doesn't exist`}
                    })
            })
        })

        context('Given there are jokes in the db', () => {
            const testJokes = makeJokeArray()

            beforeEach('insert jokes', () => {
                return db
                    .into('chuckles_jokes')
                    .insert(testJokes)
            })

            it('responds with 200 and the requested joke', () => {
                const jokeId = 2
                const expectedJoke = testJokes[jokeId - 1]
                return supertest(app)
                    .get(`/api/jokes/${jokeId}`)
                    .expect(200, expectedJoke)
            }) 
        })

        context('Given an xss attack joke', () => {
            const { maliciousJoke, expectedJoke } = makeMaliciousJoke()
            
            beforeEach('insert a malicious joke', () => {
                return db
                .into('chuckles_jokes')
                .insert(maliciousJoke)
            })
            
            it('it removes xss attack joke', () => {
                return supertest(app)
                    .get('/api/jokes')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].joke).to.eql(expectedJoke.joke)
                        expect(res.body[0].punchline).to.eql(expectedJoke.punchline)
                        expect(res.body[0].submitted_by).to.eql(expectedJoke.submitted_by)
                    })
            })
        })
    })

//POST  /api/jokes endpoint

    describe('POST /api/jokes', () => {

        it('creates a joke, responding with 201 and the new joke', () => {
            const newJoke = {
                joke: 'Test New Joke',
                punchline: 'Test New Punchline',
                submitted_by: 'Test Submitted_by',
            }
            return supertest(app)
                .post('/api/jokes')
                .send(newJoke)
                .expect(201)
                .expect(res => {
                    expect(res.body.joke).to.eql(newJoke.joke)
                    expect(res.body.punchline).to.eql(newJoke.punchline)
                    expect(res.body.submitted_by).to.eql(newJoke.submitted_by)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/jokes/${res.body.id}`)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/jokes/${res.body.id}`)
                        .expect(res.body)
                })
        })

        const requiredFields = ['joke', 'punchline', 'submitted_by']

        requiredFields.forEach(field => {
            const newJoke = {
                joke: 'Test joke',
                punchline: 'Test punchline',
                submitted_by: 'Test user'
            }
            it(`responds with 404 and an error message when ${field} is missing`, () => {
                delete newJoke[field]

                return supertest(app)
                    .post('/api/jokes')
                    .send(newJoke)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    })
            })

            it('removes an xss attack joke from response', () => {
                const { maliciousJoke, expectedJoke } = makeMaliciousJoke()

                return supertest(app)
                    .post('/api/jokes')
                    .send(maliciousJoke)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.joke).to.eql(expectedJoke.joke)
                        expect(res.body.punchline).to.eql(expectedJoke.punchline)
                        expect(res.body.submitted_by).to.eql(expectedJoke.submitted_by)
                    })
            })
        })
    })

//DELETE /api/jokes/:id
    describe(`DELETE /api/jokes/:id`, () => {
       
        context('Given joke with id does"t exist in db', () => {
            it('responds with 404', () => {
                const jokeId = 123456
                return supertest(app)
                    .delete(`/api/jokes/${jokeId}`)
                    .expect(404, { 
                        error: { message: `joke doesn't exist` }
                    })
            })
        })

        context('Given joke with id exists in db', () => {
            const testJokes = makeJokeArray()

            beforeEach('insert joke', () => {
                return db
                    .into('chuckles_jokes')
                    .insert(testJokes)
            })

            it('Responds with 204 then removes the joke', () => {
                const idToRemove = 2
                const expectedJoke = testJokes.filter(joke => joke.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/jokes/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/jokes')
                            .expect(expectedJoke)
                    
                    })
            })
        })
    })

})