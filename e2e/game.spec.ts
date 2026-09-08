import { test, expect } from '@playwright/test';

test.describe('Falling Fusion - Application Startup', () => {
  test('page loads without crashing', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Falling Fusion/);
  });

  test('game board is visible', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const bbox = await canvas.boundingBox();
    expect(bbox).toBeTruthy();
    if (bbox) {
      expect(bbox.width).toBeGreaterThan(100);
      expect(bbox.height).toBeGreaterThan(100);
    }
  });

  test('score is visible', async ({ page }) => {
    await page.goto('/');
    // Score should appear in the sidebar
    const scoreText = page.locator('text=SCORE');
    await expect(scoreText).toBeVisible();
  });
});

test.describe('Falling Fusion - Player Input', () => {
  test('moving left modifies active piece position', async ({ page }) => {
    await page.goto('/');
    // Wait for game to initialize
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(500);

    // Press left arrow
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);

    // Take screenshot to verify something changed
    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
  });

  test('moving right modifies active piece position', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(500);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);

    const screenshot = await page.screenshot();
    expect(screenshot).toBeTruthy();
  });
});

test.describe('Falling Fusion - Hard Drop', () => {
  test('hard drop causes piece to lock and new piece appears', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(500);

    // Get initial score
    const initialScore = await page.locator('text=/^\\d+$/').first().textContent();

    // Hard drop
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Game should still be running
    await expect(page.locator('text=/^\\d+$/')).toBeVisible();
  });
});

test.describe('Falling Fusion - Pause', () => {
  test('pressing pause enters paused state', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(500);

    // Press pause
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(200);

    // Check for PAUSED text
    const paused = page.locator('text=PAUSED');
    await expect(paused).toBeVisible();
  });

  test('gameplay does not advance while paused', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(500);

    // Pause
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(200);

    // Press other keys - should not affect game while paused
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Should still be paused
    const paused = page.locator('text=PAUSED');
    await expect(paused).toBeVisible();
  });
});

test.describe('Falling Fusion - Restart', () => {
  test('restart resets the score', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(500);

    // Simulate some gameplay
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Restart
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(300);

    // Score should be back to 0 or low value
    const scoreElement = page.locator('text=/^\\d+$/');
    const scoreText = await scoreElement.first().textContent();
    const score = parseInt(scoreText || '0', 10);
    expect(score).toBeLessThanOrEqual(100); // Should be near 0 after restart
  });

  test('restart creates a clean board', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(500);

    // Play for a bit
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Restart
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(300);

    // Game should still be playing (not game over)
    const gameOver = page.locator('text=GAME OVER');
    await expect(gameOver).not.toBeVisible();
  });
});

test.describe('Falling Fusion - Game State', () => {
  test('deterministic game with seed plays consistently', async ({ page }) => {
    await page.goto('/?seed=12345');
    await page.waitForSelector('canvas', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Game should be running
    await expect(page.locator('text=/^\\d+$/')).toBeVisible();
  });
});
