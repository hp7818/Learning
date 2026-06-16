import { test, expect } from "@playwright/test";

test("login success (SQLite DB)", async ({ request }) => {
  const res = await request.post("http://localhost:3000/api/login", {
    data: {
      username: "admin",
      password: "admin123",
    },
  });

  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body.status).toBe("success");
});

test("login fail", async ({ request }) => {
  const res = await request.post("http://localhost:3000/api/login", {
    data: {
      username: "wrong",
      password: "123",
    },
  });

  expect(res.status()).toBe(401);
});


