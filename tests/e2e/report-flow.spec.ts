import { test, expect } from "@playwright/test";

test("anonymous report flow renders", async ({ page }) => {
  await page.goto("/melden");
  await expect(page.getByRole("heading", { name: "Meld een onveilige situatie" })).toBeVisible();
  await page.getByRole("button", { name: "Volgende" }).click();
  await page.getByPlaceholder("Locatieomschrijving").fill("Centrum Utrecht");
  await page.getByRole("button", { name: "Volgende" }).click();
  await page.getByRole("button", { name: "Volgende" }).click();
  await page.getByRole("textbox").fill("Ik voelde me onveilig op weg naar huis door intimidatie.");
  await page.getByRole("button", { name: "Verstuur melding" }).click();
});
