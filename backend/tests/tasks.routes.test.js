// Import Supertest so we can send fake HTTP requests to the app.
const request = require("supertest");
// Import the Express app without starting a real server on a port.
const { app } = require("../app");
// Import the shared database pool so we can fake its query function.
const { pool } = require("../db");

// Save the real database query function before we replace it in tests.
const originalQuery = pool.query;

// Restore the real database query function after every test.
afterEach(() => {
  pool.query = originalQuery;
});

// Group the mocked route tests under one readable label in Jest output.
describe("Tasks routes with mocked database", () => {
  // Test that GET /tasks returns task rows from a mocked database response.
  test("GET /tasks returns a JSON array of tasks", async () => {
    // Replace pool.query with a fake function for this one test.
    pool.query = async () => {
      // Return the same response shape that pg normally returns.
      return {
        rows: [
          { task_id: 1, task_name: "Mock task one" },
          { task_id: 2, task_name: "Mock task two" },
        ],
      };
    };

    // Send a fake GET request to the route.
    const response = await request(app).get("/tasks");

    // Check that the route responded with HTTP 200.
    expect(response.status).toBe(200);
    // Check that the route responded with JSON.
    expect(response.headers["content-type"]).toMatch(/json/);
    // Check that the response body matches the fake rows above.
    expect(response.body).toEqual([
      { task_id: 1, task_name: "Mock task one" },
      { task_id: 2, task_name: "Mock task two" },
    ]);
  });

  // Test that POST /tasks/add returns the created task from a mocked database response.
  test("POST /tasks/add returns the created task", async () => {
    // Create one task name that we will send into the route.
    const mockTaskName = "Mock created task";

    // Replace pool.query with a fake insert function.
    pool.query = async (sql, values) => {
      // Check that the route used the SQL we expect.
      expect(sql).toBe("INSERT INTO tasks (task_name) VALUES ($1) RETURNING *");
      // Check that the route passed the expected parameter into the SQL query.
      expect(values).toEqual([mockTaskName]);

      // Return the same response shape that pg would return after an insert.
      return {
        rows: [{ task_id: 3, task_name: mockTaskName }],
      };
    };

    // Send a fake POST request with JSON data to the route.
    const response = await request(app)
      .post("/tasks/add")
      .send({ name: mockTaskName })
      .set("Content-Type", "application/json");

    // Check that the route responded with HTTP 200.
    expect(response.status).toBe(200);
    // Check that the response body contains the created task.
    expect(response.body).toEqual({
      task_id: 3,
      task_name: mockTaskName,
    });
  });
});
