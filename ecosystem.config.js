module.exports = {
  apps: [
    {
      name: 'chaosviewer',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/home/obi/chaosViewer',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3039,
        HOSTNAME: '0.0.0.0',
        DATABASE_URL: 'file:/home/obi/chaosViewer/data/chaosviewer.db',
        UPLOAD_DIR: '/home/obi/chaosViewer/uploads',
      },
      error_file: '/home/obi/chaosViewer/logs/pm2-error.log',
      out_file: '/home/obi/chaosViewer/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
