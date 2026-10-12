const parameters = [
    {
        name: "prompt",
        type: "string",
        required: false,
        maxLength: 30000,
        description: "Deskripsi adegan; opsional untuk model ini."
    },
    {
        name: "mode",
        type: "string",
        required: false,
        enum: ["t2v", "i2v", "f2f", "r2v", "v2v"],
        default: "r2v",
        description: "Mode generasi Seedance."
    },
    {
        name: "aspect_ratio",
        type: "string",
        required: false,
        enum: ["9:16", "16:9"],
        default: "9:16",
        description: "Rasio aspek video."
    },
    {
        name: "duration",
        type: "string",
        required: false,
        enum: ["5", "8", "10", "12", "15", "30"],
        default: "15",
        description: "Durasi video dalam detik."
    },
    {
        name: "resolution",
        type: "string",
        required: false,
        enum: ["720p", "480p"],
        default: "720p",
        description: "Resolusi video."
    },
    {
        name: "image_urls",
        type: "image_urls",
        required: false,
        maxItems: 9,
        description: "Hingga 9 URL gambar referensi publik."
    },
    {
        name: "video_urls",
        type: "video_urls",
        required: false,
        maxItems: 3,
        description: "Hingga 3 URL video referensi publik."
    },
    {
        name: "webhook_url",
        type: "string",
        required: false,
        description: "URL callback; alias webhook juga didukung."
    }
];

const definitions = new Map(parameters.map(parameter => [parameter.name, parameter]));

function normalizeString(value) {
    return value == null ? "" : String(value).trim();
}

function normalizeUrls(value) {
    const values = Array.isArray(value)
        ? value
        : typeof value === "string" && value.trim()
            ? [value]
            : [];

    return values
        .map(normalizeString)
        .filter(Boolean);
}

function getSource(body = {}) {
    if (body?.parameters && typeof body.parameters === "object" && !Array.isArray(body.parameters)) {
        return body.parameters;
    }

    return body && typeof body === "object" && !Array.isArray(body) ? body : {};
}

function getParameters(body = {}) {
    const source = getSource(body);
    const webhookUrl = normalizeString(source.webhook_url || source.webhook);

    return {
        prompt: normalizeString(source.prompt),
        mode: normalizeString(source.mode) || "r2v",
        aspect_ratio: normalizeString(source.aspect_ratio) || "9:16",
        duration: normalizeString(source.duration) || "15",
        resolution: normalizeString(source.resolution) || "720p",
        image_urls: normalizeUrls(source.image_urls),
        video_urls: normalizeUrls(source.video_urls),
        ...(webhookUrl ? { webhook_url: webhookUrl } : {})
    };
}

function sanitizeParameters(body = {}) {
    return getParameters(body);
}

function validate(input = {}) {
    const errors = [];

    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return { valid: false, errors: ["Parameter input harus berupa object."] };
    }

    for (const name of ["mode", "aspect_ratio", "duration", "resolution"]) {
        const definition = definitions.get(name);
        const value = input[name] == null || input[name] === ""
            ? definition.default
            : String(input[name]).trim();

        if (!definition.enum.includes(value)) {
            errors.push(`${name} tidak valid. Pilihan: ${definition.enum.join(", ")}.`);
        }
    }

    const prompt = normalizeString(input.prompt);
    if (prompt.length > definitions.get("prompt").maxLength) {
        errors.push(`Prompt maksimal ${definitions.get("prompt").maxLength} karakter.`);
    }

    const imageUrls = normalizeUrls(input.image_urls);
    const videoUrls = normalizeUrls(input.video_urls);
    if (imageUrls.length > 9) errors.push("Maksimal 9 gambar referensi.");
    if (videoUrls.length > 3) errors.push("Maksimal 3 video referensi.");

    if (input.webhook_url != null && !normalizeString(input.webhook_url)) {
        errors.push("Webhook URL tidak boleh kosong jika dikirim.");
    }

    return { valid: errors.length === 0, errors };
}

export { getParameters, getSource, sanitizeParameters, validate };
export default parameters;