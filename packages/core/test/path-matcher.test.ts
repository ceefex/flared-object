import test from "node:test";
import assert from "node:assert/strict";
import { isPathExcluded } from "../src/security/path-matcher.js";
import { validateRequest } from "../src/security/index.js";

test("Path Matcher: isPathExcluded", async (t) => {
  await t.test("returns false when excludePaths is empty or undefined", () => {
    assert.equal(isPathExcluded("/comics/one-piece/cover-123.jpg", undefined), false);
    assert.equal(isPathExcluded("/comics/one-piece/cover-123.jpg", []), false);
  });

  await t.test("matches wildcard patterns for covers and banners", () => {
    const patterns = ["*/cover-*", "*/banner-*"];
    assert.equal(isPathExcluded("/comics/one-piece-7286/cover-1788782337286.jpg", patterns), true);
    assert.equal(isPathExcluded("/comics/solo-leveling-7749/banner-999.png", patterns), true);
    assert.equal(isPathExcluded("comics/solo-leveling-7749/cover-111.webp", patterns), true);
  });

  await t.test("does not match protected chapter pages", () => {
    const patterns = ["*/cover-*", "*/banner-*"];
    assert.equal(
      isPathExcluded("/comics/the-beginning-after-the-end-4718/ch-1.00/page-1-1791543631002.webp", patterns),
      false,
    );
    assert.equal(isPathExcluded("/comics/one-piece/chapters/ch-1000/01.jpg", patterns), false);
  });

  await t.test("matches prefix folder patterns", () => {
    const patterns = ["/public/*", "covers/*"];
    assert.equal(isPathExcluded("/public/logo.png", patterns), true);
    assert.equal(isPathExcluded("/covers/comic-a.jpg", patterns), true);
    assert.equal(isPathExcluded("/private/secret.jpg", patterns), false);
  });

  await t.test("matches extension wildcards", () => {
    const patterns = ["*.ico", "*.svg"];
    assert.equal(isPathExcluded("/favicon.ico", patterns), true);
    assert.equal(isPathExcluded("/assets/icon.svg", patterns), true);
    assert.equal(isPathExcluded("/assets/icon.png", patterns), false);
  });
});

test("validateRequest with excludePaths", async (t) => {
  const secret = "test-secret-key-12345678901234567890";

  await t.test("bypasses signed-url validation when path is excluded", async () => {
    const req = new Request("https://media.komikhq.com/comics/one-piece/cover-123.jpg");
    const result = await validateRequest(req, {
      mode: "signed-url",
      hmacSecret: secret,
      excludePaths: ["*/cover-*", "*/banner-*"],
    });
    assert.equal(result.allowed, true);
  });

  await t.test("enforces signed-url validation when path is not excluded and token is missing", async () => {
    const req = new Request("https://media.komikhq.com/comics/one-piece/ch-1/page-1.webp");
    const result = await validateRequest(req, {
      mode: "signed-url",
      hmacSecret: secret,
      excludePaths: ["*/cover-*", "*/banner-*"],
    });
    assert.equal(result.allowed, false);
    assert.equal(result.error, "Missing token or expires parameter");
  });

  await t.test("ignores excludePaths when mode is none", async () => {
    const req = new Request("https://media.komikhq.com/comics/one-piece/ch-1/page-1.webp");
    const result = await validateRequest(req, {
      mode: "none",
    });
    assert.equal(result.allowed, true);
  });
});
