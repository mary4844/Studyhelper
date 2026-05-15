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
        await pool.query('DELETE FROM user_board');
        await pool.query('DELETE FROM board');
        await pool.query('DELETE FROM users');       
    })

    afterAll(async () => {
        await pool.end(); //close connection to database when done
    })

    describe('GET /boards', () => {

        it('should return all boards for authenticated users', async () => {

            const user = await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com'] // matches the mocked email
            );

            const board1 = await pool.query(
                `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                ['Test Board 1']
            );

            const board2 = await pool.query(
                `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                ['Test Board 2']
            );

            const board3 = await pool.query(
                `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                ['Test Board 3']
            );

            // link user to boards
            await pool.query(
                `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                [user.rows[0].user_id, board1.rows[0].board_id]
            );
            await pool.query(
                `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                [user.rows[0].user_id, board3.rows[0].board_id]
            );

            const res = await request(app).get('/boards');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toMatchObject({ board_name: 'Test Board 1'})
            expect(res.body[1]).toMatchObject({ board_name: 'Test Board 3'})
        });
    });

    describe('POST /boards', () => {

        it('should create a board and link it to the user', async () => {
            const user = await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com']
            );

            const res = await request(app)
                .post('/boards')
                .send({ name: 'New Board' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toMatchObject({ board_name: 'New Board' });

            // verify it was actually saved in the db
            const board = await pool.query(
                `SELECT * FROM board WHERE board_name = $1`,
                ['New Board']
            );
            expect(board.rows.length).toBe(1);

            // verify user_board link was created
            const link = await pool.query(
                `SELECT * FROM user_board WHERE user_id = $1 AND board_id = $2`,
                [user.rows[0].user_id, board.rows[0].board_id]
            );
            expect(link.rows.length).toBe(1);
        });

         it('should create a personal board with is_shared false', async () => {
            await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com']
            );

            const res = await request(app)
                .post('/boards')
                .send({ name: 'Personal Board', type: 'personal' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toMatchObject({ board_name: 'Personal Board', is_shared: false });
        });

        it('should create a group board with is_shared true', async () => {
            await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com']
            );

            const res = await request(app)
            .post('/boards')
            .send({ name: 'Group Board', type: 'group' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toMatchObject({ board_name: 'Group Board', is_shared: true });
        });

        it('should return 400 if name is missing', async () => {
            await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com']
            );

            const res = await request(app)
                .post('/boards')
                .send({});

            expect(res.statusCode).toBe(400);
        });

        it('should return 404 if user not found', async () => {
            //no user inserted
            const res = await request(app)
                .post('/boards')
                .send({ name: 'New Board' });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /boards/type/:type', () => {

        //stoppar in 2 boards och plockar ut en av dom med id
        it('should get all personal boards and send 200', async () => {

            //inser user
             const user = await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com'] // matches the mocked email
            );
            
            // inser boards
            const board1 = await pool.query(
                `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                ['Test Board 1', false]
            );

            const board2 = await pool.query(
                `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                ['Test Board 2', true]
            );

            // link user to boards
            await pool.query(
                `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                [user.rows[0].user_id, board1.rows[0].board_id]
            );

            await pool.query(
                `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                [user.rows[0].user_id, board2.rows[0].board_id]
            );

            const res = await request(app).get('/boards/type/personal');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toMatchObject({ board_name: 'Test Board 1', is_shared: false});
            
        })

        it('should get all group boards and send 200', async () => {
             //inser user
             const user = await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com'] // matches the mocked email
            );
            
            // inser boards
            const board1 = await pool.query(
                `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                ['Test Board 1', false]
            );

            const board2 = await pool.query(
                `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                ['Test Board 2', true]
            );

            // link user to boards
            await pool.query(
                `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                [user.rows[0].user_id, board1.rows[0].board_id]
            );

            await pool.query(
                `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                [user.rows[0].user_id, board2.rows[0].board_id]
            );

            const res = await request(app).get('/boards/type/group');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toMatchObject({board_name: 'Test Board 2', is_shared: true})
        })

        it('should send 400 if type is invalid', async () => {
            const res = await request(app).get('/boards/type/invalid');

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'invalid type');
        })

        it('should send 404 if there is no connection between board and a user', async () => {
            const res = await request(app).get('/boards/type/personal');

            expect(res.statusCode).toBe(404);
        })
    })

    describe('DELETE /board/id', () => {

        it('should delete a board by id and send 204', async () => {
            
            const user = await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com'] // matches the mocked email
            );

            const board1 = await pool.query(
                `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                ['Test Board 1', false]
            );

            await pool.query(
                `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                [user.rows[0].user_id, board1.rows[0].board_id]
            );

            const res = await request(app).delete(`/boards/${board1.rows[0].board_id}`);

            expect(res.statusCode).toBe(204);

            //kolla så boarden togs bort
            const deleted = await pool.query(
                `SELECT * FROM board WHERE board_id = $1`,
                [board1.rows[0].board_id]
            )

            expect(deleted.rows.length).toBe(0);
        })

        it('should send 404 användaren hittades inte if there is no user connection', async () => {

            const user = await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com'] // matches the mocked email
            );

            const board = await pool.query(
                `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                ['Test Board 1', false]
            );

            //saknar länkning till användaren
            const res = await request(app).delete(`/boards/${board.rows[0].board_id}`)
        })

        it('should send 404 if there is nothing to delete', async () => {
            const res = await request(app).delete('/boards/1');

            expect(res.statusCode).toBe(404);
        })
    })

    //describe('PATCH /board/id', () => {
    
    //})
})
