//Integrationstest filen; testar backendkoden mot vår db, för just tasks routes.
//Jest-funktioner som describe, test, expect, afterEach, afterAll osv.
//supertest avänds för att skicka HTTP-requests mot vår ecpress app under testet ex request(app).get(...).

const request = require("supertest"); // Supertest är verktyget för att skicka requests till vår Express app.
const { app } = require("../app"); //importera appen
const { pool } = require("../pool");

// sprar namn på tasks som läggs til i db under testkörningen
const createdTaskNames = new Set();

// efter varje test ta bort skapade tasks från db (testerna ska ej påverka varandra)
afterEach(async () => {
  for (const taskName of createdTaskNames) {
    await pool.query("DELETE FROM tasks WHERE task_name = $1", [taskName]); // ta bort matcher i db
  }
  createdTaskNames.clear();
});

// Efter alla tester stäng av db anslutningen (pga jest)
afterAll(async () => {
  await pool.end();
});

describe("Tasks integration tests with real database", () => {
  test("GET /tasks returns an array from PostgreSQL, atm empty", async () => {
    const response = await request(app).get("/tasks"); //skicka en GET request till /tasks route i vår app,
    // obs! vi anger endpoint som annars redan står i URL:en i frontend

    // kolla repsons statuset, och att det är av typ json samt en array.
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
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

    // spara i setet för att ta bort det i aftereach
    createdTaskNames.add(testTaskName);

    expect(response.status).toBe(200);
    expect(response.body.task_name).toBe(testTaskName);

    // Verifiera att datan finns i db
    const dbResult = await pool.query(
      "SELECT * FROM tasks WHERE task_name = $1",
      [testTaskName],
    );

    expect(dbResult.rows.length).toBe(1); // kanske inte behövs?
    expect(dbResult.rows[0].task_name).toBe(testTaskName);
  });
});
