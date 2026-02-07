module.exports = {
    apps: [
        {
            name: "tvs-backend",
            script: "uvicorn",
            args: "app.main:app --host 0.0.0.0 --port 8020",
            cwd: "./backend",
            interpreter: "python3",
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                PYTHONPATH: "."
            }
        },
        {
            name: "tvs-frontend",
            script: "npm",
            args: "run dev -- --port 3020 --host",
            cwd: ".",
            autorestart: true,
            watch: false,
            max_memory_restart: "1G"
        }
    ]
};
