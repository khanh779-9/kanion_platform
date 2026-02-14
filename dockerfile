FROM node:20-alpine

WORKDIR /app

# Copy toàn bộ source
COPY . .

# Cài deps
RUN npm install || true
RUN cd apps/backend && npm install
RUN cd apps/frontend && npm install && npm run build

# Copy build React sang backend/public
RUN mkdir -p apps/backend/public
RUN cp -r apps/frontend/dist/* apps/backend/public/

# Render sẽ inject PORT
ENV PORT=10000

EXPOSE 10000

# Chạy backend
CMD ["npm", "run", "start", "--prefix", "apps/backend"]
