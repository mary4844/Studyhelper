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
        await pool.query('DELETE FROM board+');        
    })

    afterAll(async () => {
        await pool.end(); //close connection to database when done
    })

    describe('GET /calendar/:date', () => {

        it('should return tasks with maching deadline from read db', async () => {
            
            // insert board first
            const board = await pool.query(
                `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                ['Test Board']
            );

            // insert subject card with that board_id
            const card = await pool.query(
                `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                [board.rows[0].board_id, 'Test Card']
            );

            //insert real data
            await pool.query(
                `INSERT INTO tasks (subject_card_id, task_name, deadline) VALUES ($1, $2, $3)`,
                [1, 'test task 1', '2026-05-14']
            );

            await pool.query(
                `INSERT INTO tasks (subject_card_id, task_name, deadline) VALUES ($1, $2, $3)`,
                [1, 'test task 2', '2026-05-15']
            )

            const res = await request(app).get('/calendar/2026-05-14')

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toMatchObject({
                task_name: 'test task 1',
            });
        });

        it('')
    });
})
