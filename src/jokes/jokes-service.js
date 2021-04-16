const JokesService = {
    getAllJokes(knex){
        return knex
            .select('*')
            .from('chuckles_jokes')
    },

    insertJoke(knex, newJokes) {
        return knex
            .insert(newJokes)
            .into('chuckles_jokes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('chuckles_jokes')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteJoke(knex, id){
        return knex('chuckles_jokes')
            .where({ id })
            .delete()       
    },

    updateJokes(knex, id, newJokesFields){
        return knex('chuckles_jokes')
            .where({ id })
            .update(newJokesFields)
    }
}

module.exports = JokesService