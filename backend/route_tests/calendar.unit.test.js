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

describe('calendar routes', () => {
     beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('/calendar/2026-05-14', () => {
        
        it('should return the task that is associated with the date', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ 
                    task_id: 1, 
                    task_name: "task1",
                    user_id: 'testuser',
                    deadline: '2026-05-14',
                    status: false,
                    subject_card_id: 1
                }] 
            })
            const result = await request(app).get('/calendar/2026-05-14');

            expect(result.statusCode).toBe(200);
            expect(result.body).toMatchObject({
                task_id: 1, 
                task_name: "task1",
                user_id: 'testuser',
                deadline: '2026-05-14',
                status: false,
                subject_card_id: 1,
            })
        })

        it('should return an empty object', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [] })

            const result = await request(app).get('/calendar/2026-05-14');

            expect(result.statusCode).toBe(200);
            expect(result.body).toEqual("");
        })
    })
})
