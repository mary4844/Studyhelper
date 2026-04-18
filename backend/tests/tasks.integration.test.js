// Import Supertest so we can send real requests through the Express app.
const request = require("supertest");
// Import the real Express app.
const { app } = require("../app");
// Import the real PostgreSQL pool so these tests use the actual database.
const { pool } = require("../db");

// Keep track of task names that the tests create in the real database.
const createdTaskNames = new Set();

// After each test, delete any rows that this file created.
afterEach(async () => {
  // Loop through all task names created during the previous test.
  for (const taskName of createdTaskNames) {
    // Remove the matching row from the real database.
    await pool.query("DELETE FROM tasks WHERE task_name = $1", [taskName]);
  }

  // Clear the set so the next test starts fresh.
  createdTaskNames.clear();
});

// After all integration tests finish, close the real database pool.
afterAll(async () => {
  await pool.end();
});

// Group the real database tests under one readable label in Jest output.
describe("Tasks integration tests with real database", () => {
  // Test that GET /tasks talks to the real database and returns an array.
  test("GET /tasks returns an array from PostgreSQL", async () => {
    // Send a real GET request through the route.
    const response = await request(app).get("/tasks");

    // Check that the route responded with HTTP 200.
    expect(response.status).toBe(200);
    // Check that the route responded with JSON.
    expect(response.headers["content-type"]).toMatch(/json/);
    // Check that the body is an array, even if it is empty.
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test that POST /tasks/add writes a real row to the real database.
  test("POST /tasks/add inserts a real task into PostgreSQL", async () => {
    // Build a unique task name so this test does not clash with existing rows.
    const testTaskName = `integration-task-${Date.now()}`;

    // Send a real POST request that should insert a row into PostgreSQL.
    const response = await request(app)
      .post("/tasks/add")
      .send({ name: testTaskName })
      .set("Content-Type", "application/json");

    // Save the task name so cleanup can delete the inserted row afterwards.
    createdTaskNames.add(testTaskName);

    // Check that the route responded with HTTP 200.
    expect(response.status).toBe(200);
    // Check that the route returned the same task name we inserted.
    expect(response.body.task_name).toBe(testTaskName);

    // Query the real database directly to verify that the row really exists.
    const dbResult = await pool.query(
      "SELECT * FROM tasks WHERE task_name = $1",
      [testTaskName],
    );

    // Check that exactly one matching row was found.
    expect(dbResult.rows.length).toBe(1);
    // Check that the row in the database has the expected task name.
    expect(dbResult.rows[0].task_name).toBe(testTaskName);
  });
});
