module.exports = {
    apps: [{
        name: 'hoffmann-niklas-chat',
        script: 'server.js',
        instances: 1,
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        // Restart on crash
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',

        // Logging
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

        // Advanced features
        max_restarts: 10,
        min_uptime: '10s',
        listen_timeout: 5000,
        kill_timeout: 5000
    }]
};
