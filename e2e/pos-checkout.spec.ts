import { test, expect } from "@playwright/test";

test.describe("POS Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as tenant owner
    await page.goto("/login");
    await page.getByPlaceholder("info@gmail.com").fill("admin@shopstack.com");
    await page.getByPlaceholder("Enter your password").fill("Test@123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/.*tenant/);
  });

  test("should complete a sale successfully", async ({ page }) => {
    // Navigate to POS
    await page.goto("/tenant/pos/sell");

    // Click "Add to Cart" button for ASUS laptop
    const productCard = page
      .locator(".group")
      .filter({ hasText: "ASUS ROG Gaming Laptop" });
    await productCard.getByRole("button", { name: /add/i }).click();

    // Verify floating cart button appears
    const cartButton = page.getByRole("button", { name: /view cart/i });
    await expect(cartButton).toBeVisible();

    // Open cart modal
    await cartButton.click();

    // Verify modal is open and shows the item (h4 in CartItems)
    await expect(page.getByText("Detail Transaction")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "ASUS ROG Gaming Laptop", level: 4 }),
    ).toBeVisible();

    // Complete sale (Checkout button inside modal)
    await page.getByRole("button", { name: "Complete Sale (Cash)" }).click();

    // Verify success receipt modal
    await expect(page.getByText("Transaction Complete!")).toBeVisible();

    // Close receipt
    await page.getByRole("button", { name: "Done" }).click();

    // Verify modal closed
    await expect(page.getByText("Transaction Complete!")).not.toBeVisible();
  });

  test("should manage cart items", async ({ page }) => {
    await page.goto("/tenant/pos/sell");

    // Add two different products (both from first page)
    await page
      .locator(".group")
      .filter({ hasText: "ASUS ROG Gaming Laptop" })
      .getByRole("button", { name: /add/i })
      .click();
    await page
      .locator(".group")
      .filter({ hasText: "Dell XPS 15" })
      .getByRole("button", { name: /add/i })
      .click();

    // Open cart modal
    await page.getByRole("button", { name: /view cart/i }).click();

    // Verify both are in cart (h4 level)
    await expect(
      page.getByRole("heading", { name: "ASUS ROG Gaming Laptop", level: 4 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Dell XPS 15", level: 4 }),
    ).toBeVisible();

    // Clear cart
    await page.getByRole("button", { name: /clear/i }).click();

    // Verify cart is empty in modal
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();

    // Close modal (X button)
    await page.locator("button:has(svg.lucide-x)").first().click();
  });
});
