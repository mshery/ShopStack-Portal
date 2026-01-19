import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should login as platform admin", async ({ page }) => {
    // Go to login page
    await page.goto("/login");

    // Fill in credentials from seed.json
    await page.getByPlaceholder("info@gmail.com").fill("sherri@shopstack.com");
    await page.getByPlaceholder("Enter your password").fill("12345678");

    // Click login
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // Verify redirected to platform root
    await expect(page).toHaveURL(/.*platform/);

    // Verify sidebar logo
    await expect(page.getByText("ShopStack")).toBeVisible();

    // Verify specific dashboard content (Total Tenants metric card)
    await expect(page.getByText("Total Tenants", { exact: true })).toBeVisible({
      timeout: 10000,
    });
  });

  test("should login as tenant owner", async ({ page }) => {
    await page.goto("/login");

    // Fill in credentials from seed.json
    await page.getByPlaceholder("info@gmail.com").fill("admin@shopstack.com");
    await page.getByPlaceholder("Enter your password").fill("Test@123");

    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // Verify redirected to tenant root
    await expect(page).toHaveURL(/.*tenant/);

    // Verify sidebar logo
    await expect(page.getByText("ShopStack")).toBeVisible();

    // Verify specific dashboard content (Total Sales metric card)
    await expect(page.getByText("Total Sales", { exact: true })).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("info@gmail.com").fill("wrong@email.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpass");

    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // Verify error message
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
