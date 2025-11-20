# Docker Setup for MissionConnect

This project includes Docker Compose configurations for running the backend server and MongoDB database.

## Prerequisites

- Docker and Docker Compose installed on your system
- (Optional) Create a `.env` file based on `.env.example` to customize configuration

## Quick Start

### Development Mode (with hot reload)

```bash
# Start services in development mode
docker-compose -f docker-compose.dev.yml up

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

### Production Mode

```bash
# Start services in production mode
docker-compose up

# Or run in detached mode
docker-compose up -d
```

## Services

### MongoDB
- **Port**: 27017
- **Default Database**: missionconnect
- **Default Credentials**: admin/password (change in `.env`)

### Backend API
- **Port**: 5000 (configurable via `PORT` env variable)
- **Health Check**: http://localhost:5000/

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://mongodb:27017/missionconnect
JWT_SECRET=your-secret-key-change-in-production
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
MONGO_DATABASE=missionconnect
```

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Stop services
```bash
docker-compose down

# Also remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Rebuild containers
```bash
# Rebuild after code changes
docker-compose build

# Rebuild and restart
docker-compose up --build
```

### Access MongoDB shell
```bash
# Connect to MongoDB container
docker exec -it missionconnect-mongodb mongosh

# Or with authentication
docker exec -it missionconnect-mongodb mongosh -u admin -p password
```

### Access backend container
```bash
docker exec -it missionconnect-backend sh
```

## Development Tips

1. **Hot Reload**: The development setup uses nodemon for automatic server restarts when code changes.

2. **Database Persistence**: Data is stored in Docker volumes and persists between container restarts.

3. **Local Development**: If you want to run the server locally (not in Docker) but use Docker MongoDB:
   ```bash
   # Start only MongoDB
   docker-compose up mongodb
   
   # Then run server locally with:
   # MONGO_URI=mongodb://localhost:27017/missionconnect npm run dev
   ```

4. **Reset Database**: To start fresh:
   ```bash
   docker-compose down -v
   docker-compose up
   ```

## Troubleshooting

### Port already in use
If port 5000 or 27017 is already in use, either:
- Stop the conflicting service
- Change the port in `.env` file

### MongoDB connection issues
- Ensure MongoDB container is healthy: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- Verify MONGO_URI in `.env` matches the service name: `mongodb://mongodb:27017/missionconnect`

### Backend not starting
- Check backend logs: `docker-compose logs backend`
- Verify all environment variables are set correctly
- Ensure MongoDB is healthy before backend starts (handled by `depends_on`)

