const config = {
    id: "seedance-25-studio-s14",
    motiongenModelId: "seedance-25-studio-s14",
    name: "Seedance 2.5 (30s)",
    providerId: "motiongen",
    providerName: "Motiongen-AI",
    type: "text-to-video",
    api: {
        createTask: "/api/v1/generate",
        queryTask: "/api/v1/jobs/{job_id}"
    }
};

export default config;