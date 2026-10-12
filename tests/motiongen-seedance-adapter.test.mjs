import fs from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const modelRoot = new URL("../models/seedance-25-studio-s14/", import.meta.url);
const parametersSource = await fs.readFile(new URL("parameters.js", modelRoot), "utf8");
const parametersUrl = `data:text/javascript,${encodeURIComponent(parametersSource)}`;
const adapterSource = await fs.readFile(new URL("parameter-adapter.js", modelRoot), "utf8");
const rewrittenAdapter = adapterSource.replace(
    'from "./parameters.js"',
    `from "${parametersUrl}"`
);
const adapterUrl = `data:text/javascript,${encodeURIComponent(rewrittenAdapter)}`;
const parametersModule = await import(parametersUrl);
const adapterModule = await import(adapterUrl);

test("builds only the Motiongen Seedance payload fields and applies defaults", () => {
    assert.deepEqual(adapterModule.buildPayload({ prompt: "A cinematic scene" }), {
        model: "seedance-25-studio-s14",
        prompt: "A cinematic scene",
        mode: "r2v",
        aspect_ratio: "9:16",
        duration: "15",
        resolution: "720p"
    });
});

test("preserves optional reference media and webhook alias", () => {
    assert.deepEqual(adapterModule.buildPayload({
        mode: "v2v",
        image_urls: [" https://example.com/a.jpg "],
        video_urls: ["https://example.com/ref.mp4"],
        webhook: "https://example.com/hook"
    }), {
        model: "seedance-25-studio-s14",
        mode: "v2v",
        aspect_ratio: "9:16",
        duration: "15",
        resolution: "720p",
        image_urls: ["https://example.com/a.jpg"],
        video_urls: ["https://example.com/ref.mp4"],
        webhook_url: "https://example.com/hook"
    });
});

test("allows an empty prompt and rejects invalid enums and excess media", () => {
    assert.equal(parametersModule.validate({}).valid, true);
    assert.equal(parametersModule.validate({ mode: "unknown" }).valid, false);
    assert.equal(parametersModule.validate({
        image_urls: Array.from({ length: 10 }, (_, index) => `https://example.com/${index}.jpg`)
    }).valid, false);
    assert.equal(parametersModule.validate({
        video_urls: Array.from({ length: 4 }, (_, index) => `https://example.com/${index}.mp4`)
    }).valid, false);
});