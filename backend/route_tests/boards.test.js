
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

const request = require('supertest');
const { app } = require("../app");

jest.mock('../pool', () => ({
    pool: {
        query: jest.fn()
    }
}));

const { pool } = require('../pool');

const originalQuery = pool.query;

describe('board routes', () => {
     beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /boards', () => {
        
        describe('when board exists', () => {
            
            it('should return all boards', async () => {
                pool.query.mockResolvedValue({
                    rows: [{ id: 1, board_name: 'Test board 1'}, 
                           { id: 2, board_name: 'Test board 2'}]
                });
    
                const res = await request(app).get('/boards');
    
                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(2);
            });
        })

        describe('when board doesnt exists', () => {
            it('should return empty array', async () => {
                pool.query.mockResolvedValue({
                    rows: []
                })

                const res = await request(app).get('/boards');

                expect(res.statusCode).toBe(200);
                expect(res.body).toEqual([]);
            });
        })
    })

    describe('GET /boards/id', () => {

        describe('if there is a board with matching id', () => {
            it('should return that board and statuscode 200', async () => {
                pool.query.mockResolvedValue({
                    rows: [{ id: 1, board_name: 'Test board 1'}, 
                           { id: 2, board_name: 'Test board 2'}]
                })

                const res = await request(app).get('/boards/1');

                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('board_name', 'Test board 1');
            })
        })

        describe('if there is no board with matching id', () => {
            it('should return statuscode 404', async () => {
                pool.query.mockResolvedValue({
                    rows: []
                })

                const res = await request(app).get('/boards/1');

                expect(res.statusCode).toBe(404);
            })
        })
    })
    
    describe('POST /boards', () => {

        describe('with valid data', () => {
            it('should craete a board', async () => {
                pool.query.mockResolvedValue({
                    rows: [{ id: 1, board_name: 'new_board' }]
                });

                const res = await request(app)
                    .post('/boards')
                    .send({ name : 'new_board'});

                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('board_name', 'new_board');
            });
        })

        describe('with invalid data', () => {
            it('should send an error if name is missing', async () => {
                const res = await request(app)
                    .post('/boards')
                    .send({});

                expect(res.statusCode).toBe(400);
            });
        })

        describe('if database crashes', () => {
            it('should return 500', async () => {
                pool.query.mockRejectedValue(new Error('DB crashed'));

                const res = await request(app)
                    .post('/boards')
                    .send({ name: 'Test Board' });

                expect(res.statusCode).toBe(500);
                expect(res.body).toHaveProperty('error');
            });
        })
    })

    describe('DELETE /boards', () => {

        describe('if all boards are deleted', () => {
            it('should return 204', async () => {
                pool.query.mockResolvedValue({});

                const res = await request(app)
                    .delete('/boards');
                    
                expect(res.statusCode).toBe(204);
            });
        })

        describe('if database crashes', () => {

            it('should return 500', async () => {
                pool.query.mockRejectedValue(new Error('DB crashed'));
            
                const res = await request(app)
                    .delete('/boards')
                
                expect(res.statusCode).toBe(500); 
            })
        })
    })

    describe('DELETE /boards/id', () => {

        describe('Board with matching id exists', () => {
            it('should return 204', async () => {
                pool.query.mockResolvedValue({
                    rows: [{ id: 2, board_name: "Board name 1"}]
                });
    
                const res = await request(app)
                    .delete('/boards/1');
    
                expect(res.statusCode).toBe(204);
            })
        })

        describe('No board with matching id', () => {
            it('should return 404 not found', async () => {
                pool.query.mockResolvedValue({ rowCount: 0 });

                const res = await request(app)
                    .delete('/boards/2')

                expect(res.statusCode).toBe(404);
            })
        })
    })

});