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
        await pool.query('DELETE FROM subtask'); 
        await pool.query('DELETE FROM task');
        await pool.query('DELETE FROM user_board');
        await pool.query('DELETE FROM board');        
    })

    afterAll(async () => {
        await pool.end(); //close connection to database when done
    })

    describe('GET /calendar/:date', () => {

        it('should return subtasks with matching deadline from read db', async () => {
            
            // insert board first
            const board = await pool.query(
                `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                ['Test Board']
            );

            // insert task_name with that board_id
            const task = await pool.query(
                `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                [board.rows[0].board_id, 'Test task']
            );

            //insert real data
            await pool.query(
                `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3)`,
                [task.rows[0].task_id, 'Test subtask 1', '2026-05-14']
            );

            await pool.query(
                `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3)`,
                [task.rows[0].task_id, 'Test subtask 2', '2026-05-15']
            )

            const res = await request(app).get('/calendar/2026-05-14')

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toMatchObject({
                subtask_name: 'Test subtask 1',
            });
        });

        it('should return an empty something when there is nothing in db ', async () => {
            // insert board first
            const board = await pool.query(
                `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                ['Test Board']
            );

            // insert task with that board_id
            const task = await pool.query(
                `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                [board.rows[0].board_id, 'Test Card']
            );

            const res = await request(app).get('/calendar/2026-05-14');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(0);
            expect(res.body).toEqual([]);
        })

        it('should return more than 1 subtask object if several match', async () => {
             // insert board first
            const board = await pool.query(
                `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                ['Test Board']
            );

            // insert task with that board_id
            const task = await pool.query(
                `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                [board.rows[0].board_id, 'Test task']
            );

            //insert real data
            await pool.query(
                `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3)`,
                [task.rows[0].task_id, 'test subtask 1', '2026-05-14'] // Date matches
            );

            await pool.query(
                `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3)`,
                [task.rows[0].task_id, 'test subtask 2', '2026-05-15'] // Date doesn't match
            )

            await pool.query(
                `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3)`,
                [task.rows[0].task_id, 'test subtask 3', '2026-05-14'] // Date matches
            )

            const res = await request(app).get('/calendar/2026-05-14');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toMatchObject({ subtask_name: 'test subtask 1' });
            expect(res.body[1]).toMatchObject({ subtask_name: 'test subtask 3' });
        });
    });
})
