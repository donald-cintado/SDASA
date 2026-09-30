FROM node:24.21.0-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 SDASA_DATA_DIR=/app/data
COPY --chown=node:node server ./server
COPY --chown=node:node shared ./shared
COPY --chown=node:node js ./js
COPY --chown=node:node css ./css
COPY --chown=node:node scripts/create-admin.js scripts/backup.js scripts/restore.js ./scripts/
COPY --chown=node:node index.html package.json ./
RUN mkdir -p /app/data /app/backups && chown node:node /app/data /app/backups
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/app.js"]
