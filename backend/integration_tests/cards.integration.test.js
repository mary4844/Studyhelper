// mock auth0 - same as unit tests
jest.mock('express-openid-connect', () => ({
    auth: () => (req, res, next) => next(),
    requiresAuth: () => (req, res, next) => {
        req.oidc = {
            isAuthenticated: () => true,
            user: { email: 'test@test.com', nickname: 'testuser' }
        };
        next();
    }
}));

const request = require('supertest');
const { app } = require('../app');
const { pool } = require('../pool'); // real pool, no mock

app.set('io', {
    to: () => ({ emit: jest.fn() })
});

describe('calendar integration tests', () => {
    
    beforeEach(async () => {
        //clean database before each test
        await pool.query('DELETE FROM tasks'); 
        await pool.query('DELETE FROM subject_cards');
        await pool.query('DELETE FROM board');        
    })

    afterAll(async () => {
        await pool.end(); //close connection to database when done
    })

    describe('subcards integration tests', () => {

        describe('POST /cards', () => {
            
            it('should send an error 400 status code if the card has no name', async () => {

            })

            it('should send an 404 status code if there is no board with the card', async () => {

            })

            it('should return status code 201 and the card that was created', async () => {

            })
        })

        describe('GET /cards', () => {

            it('should return status code 400 if the board doesnt exist', async () => {

            })

            it('should return status code 200 and empty array (?) if there are no cards', async () => {

            })

            it('should return status code 200 and all cards on the board', async () => {

            })
        })

        describe('DELETE /cards/:subject_card_id', () => {

            it('should return status code 404 if the card is not connected to a board', async () => {

            })

            it('should return status code 204 if delete was successful', () => {

            })
        })

        describe('PATCH /cards/:subject_card_id', () => {

            it('should return 400 if card has no new name', async () => {

            })

            it('should return 404 if there is no card with the id that should be changed', async () => {

            })

            it('should return 200 if the PATCH works and the changed card', async () => {

            })
        })
    })
})
