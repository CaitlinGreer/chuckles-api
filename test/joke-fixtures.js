function makeJokeArray() {
    return [
        {
            id: 1,
            joke: 'What did the custodian say when he jumped out of the closet?',
            punchline: 'Supplies!!!',
            submitted_by: 'John Doe',
            date_submitted: '2020-05-22T16:28:32.615Z'
        },
        {
            id: 2,
            joke: 'What do sprinters eat before a race?',
            punchline: 'Nothing.  They fast.',
            submitted_by: 'Jane Doe',
            date_submitted: '2020-05-22T16:28:32.615Z'
        },
        {
            id: 3,
            joke: 'What did the pirate say on his 80th birthday?',
            punchline: '"Aye, matey!"',
            submitted_by: 'Jack Sparrow',
            date_submitted: '2020-05-22T16:28:32.615Z'
        },
        {
            id: 4,
            joke: 'How do you organize a party in space?',
            punchline: 'You planet',
            submitted_by: 'Neil Armstrong',
            date_submitted: '2020-05-22T16:28:32.615Z'
        },
    ]
}

function makeMaliciousJoke() {
    const maliciousJoke = {
        id: 911,
        joke: 'Test joke with script <script>alert("xss");</script>',
        punchline: 'Bad image in content <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. More <strong>content</strong>',
        submitted_by: 'Test user with script <script>alert("xss");</script>',
        date_submitted: new Date().toISOString()
    }
    const expectedJoke = {
        ...maliciousJoke,
        joke: 'Test joke with script &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        punchline: 'Bad image in content <img src="https://url.to.file.which/does-not.exist">. More <strong>content</strong>',
        submitted_by: 'Test user with script &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    }
    return {
        maliciousJoke,
        expectedJoke
    }
}

module.exports = { 
    makeJokeArray,
    makeMaliciousJoke
}