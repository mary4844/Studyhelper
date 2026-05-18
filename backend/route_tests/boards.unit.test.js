
// HTTP status codes

// 200 OK → Request succeeded (most common)
// 201 Created → Something was created (e.g. POST request)
// 204 No Content → Success, but nothing to return

// 301 Moved Permanently → URL changed forever
// 302 Found → Temporary redirect

// 400 Bad Request → Invalid request (bad syntax/data)
// 401 Unauthorized → Not logged in
// 403 Forbidden → Not allowed
// 404 Not Found → Resource doesn’t exist

// 500 Internal Server Error → Generic crash
// 502 Bad Gateway → Bad response from another server
// 503 Service Unavailable → Server is down or overloaded
// const request = require('supertest');


// mock auth0
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

// mock db
jest.mock('../pool', () => ({
    pool: { query: jest.fn() }
}));

const { pool } = require('../pool');

// mock socket.io
app.set('io', {
    to: () => ({ emit: jest.fn() })
});

describe('board routes', () => {
     beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /boards', () => {
                
        it('should return all boards for authenticated users', async () => {
            pool.query
                // first query is for user lookup second is the boards
                .mockResolvedValueOnce({rows: [{ user_id: 1 }] }) 
                .mockResolvedValueOnce({rows: [{ board_id: 1, board_name: 'Test1'}, 
                                               { board_id: 2, board_name: 'Test2'}] })

            const res = await request(app).get('/boards');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
        });
        
        it('should return empty array if user found but no boards', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
                .mockResolvedValueOnce({ rows: [] })

            const res = await request(app).get('/boards');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(0);
            expect(res.body).toEqual([]);
        })

        it('should return 404 if user not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] })

            const res = await request(app).get('/boards');
            
            expect(res.statusCode).toBe(404);
        });
    })

    describe('POST /boards', () => {

        it('should create a board and return statuscode 201', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
                .mockResolvedValueOnce({ rows: [{ board_id: 1, board_name: 'New_board'}] })
                //vad gör denhär raden?
                .mockResolvedValueOnce({ rows: [] })

            const res = await request(app).post('/boards').send({ name: 'New_board' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('board_name', 'New_board');
        })

        it('should return statuscode 400 if name is missing', async () => {
            pool.query.mockResolvedValue({ rows: [{ user_id: 1 }] })

            const res = await request(app).post('/boards').send({});

            expect(res.statusCode).toBe(400);
        })
    })
    
    describe('DELETE /boards/:board_id', () => {

        it('should delete board and return 204', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 1}]})
                .mockResolvedValueOnce({ rows: [{ board_id: 1 }] })
                .mockResolvedValueOnce({ rowCount: 1 });

            const res = await request(app).delete('/boards/1');
                
            expect(res.statusCode).toBe(204);
        });

        it('should return 404 if board not found', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ user_id: 1}] })
                .mockResolvedValueOnce({ rows: [] });

            const res = await request(app).delete('/boards/1');

            expect(res.statusCode).toBe(404);
        });

        it('if db crashes: should return statuscode 500', async () => {
            pool.query.mockRejectedValue(new Error('DB crashed'));

            const res = await request(app).delete('/boards/1')

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    })

    describe('GET /boards/type/:type', () => {

        describe('with type "personal"', () => {
            it('should return personal boards', async () => {
                pool.query
                    .mockResolvedValueOnce({ rows: [{ user_id: 1 }] }) // user lookup
                    .mockResolvedValueOnce({ rows: [
                        { board_id: 1, board_name: 'Personal Board', is_shared: false }
                    ]}); // boards query

                const res = await request(app).get('/boards/type/personal');

                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(1);
                expect(res.body[0]).toHaveProperty('is_shared', false);
            });
        });

        describe('with type "group"', () => {
            it('should return group boards', async () => {
                pool.query
                    .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
                    .mockResolvedValueOnce({ rows: [
                        { board_id: 2, board_name: 'Group Board', is_shared: true }
                    ]});

                const res = await request(app).get('/boards/type/group');

                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(1);
                expect(res.body[0]).toHaveProperty('is_shared', true);
            });
        });

        describe('with invalid type', () => {
            it('should return 400', async () => {
                const res = await request(app).get('/boards/type/invalid');

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'invalid type');
            });
        });

        describe('when user is not found', () => {
            it('should return 404', async () => {
                pool.query.mockResolvedValueOnce({ rows: [] }); // no user

                const res = await request(app).get('/boards/type/personal');

                expect(res.statusCode).toBe(404);
            });
        });

        describe('when database crashes', () => {
            it('should return 500', async () => {
                pool.query.mockRejectedValueOnce(new Error('DB crashed'));

                const res = await request(app).get('/boards/type/personal');

                expect(res.statusCode).toBe(500);
            });
        });

        describe('POST /:board_id/share', () => {

            it('should return 404 if the requesting user is not found', async () => {
                pool.query.mockResolvedValueOnce({ rows: [] }); // requesting user SELECT

                const res = await request(app)
                    .post('/boards/1/share')
                    .send({ new_user_email: 'add@test.com' });

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'Requesting user not found');
            });

            it('should return 404 if the user to add is not found', async () => {
                pool.query
                    .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })  // requesting user
                    .mockResolvedValueOnce({ rows: [] });                 // user to add

                const res = await request(app)
                    .post('/boards/1/share')
                    .send({ new_user_email: 'notexist@test.com' });

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'Användaren hittades inte');
            });

            it('should return 403 if the requesting user is not a member of the board', async () => {
                pool.query
                    .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })  // requesting user
                    .mockResolvedValueOnce({ rows: [{ user_id: 2 }] })  // user to add
                    .mockResolvedValueOnce({ rows: [] });                 // membership check

                const res = await request(app)
                    .post('/boards/1/share')
                    .send({ new_user_email: 'add@test.com' });

                expect(res.statusCode).toBe(403);
                expect(res.body).toHaveProperty('error', 'du har inte tillgång till den här boarden');
            });

            it('should return 409 if the user to add is already a member', async () => {
                pool.query
                    .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })  // requesting user
                    .mockResolvedValueOnce({ rows: [{ user_id: 2 }] })  // user to add
                    .mockResolvedValueOnce({ rows: [{ user_id: 1, board_id: 1 }] })  // membership check
                    .mockResolvedValueOnce({ rows: [{ user_id: 2, board_id: 1 }] }); // already member check

                const res = await request(app)
                    .post('/boards/1/share')
                    .send({ new_user_email: 'add@test.com' });

                expect(res.statusCode).toBe(409);
                expect(res.body).toHaveProperty('error', 'Användaren är redan med i boarden');
            });

            it('should return 200 and add the user to the board', async () => {
                pool.query
                    .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })  // requesting user
                    .mockResolvedValueOnce({ rows: [{ user_id: 2 }] })  // user to add
                    .mockResolvedValueOnce({ rows: [{ user_id: 1, board_id: 1 }] })  // membership check
                    .mockResolvedValueOnce({ rows: [] })                 // already member check
                    .mockResolvedValueOnce({ rows: [] })                 // update is_shared
                    .mockResolvedValueOnce({ rows: [{ user_id: 2, board_id: 1 }] }); // insert

                const res = await request(app)
                    .post('/boards/1/share')
                    .send({ new_user_email: 'add@test.com' });

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('user_id', 2);
                expect(res.body).toHaveProperty('board_id', 1);
            });

            it('should return 500 if the database throws', async () => {
                pool.query.mockRejectedValueOnce(new Error('db error'));

                const res = await request(app)
                    .post('/boards/1/share')
                    .send({ new_user_email: 'add@test.com' });

                expect(res.statusCode).toBe(500);
                expect(res.body).toHaveProperty('error', 'Server error');
            });
        });
    });
});