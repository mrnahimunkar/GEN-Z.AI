import {
    getParameters,
    getSource,
    sanitizeParameters,
    validate
} from "./parameters.js";

const ALLOWED_FIELDS = new Set([
    "model",
    "prompt",
    "aspect_ratio",
    "duration",
    "resolution",
    "image_urls",
    "video_urls",
    "mode",
    "webhook_url"
]);

function buildPayload(body = {}) {
    const payload = {
        model: "seedance-25-studio-s14",
        ...sanitizeParameters(getSource(body))
    };

    return Object.fromEntries(
        Object.entries(payload).filter(([key, value]) =>
            ALLOWED_FIELDS.has(key) &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0)
        )
    );
}

function validateParameters(body = {}) {
    return validate(sanitizeParameters(getSource(body)));
}

export {
    buildPayload,
    getParameters,
    getSource,
    sanitizeParameters,
    validateParameters
};