# Host your GIF

Host your GIF is a feature-rich, modern GIF hosting and sharing platform built with React, TypeScript, Express.js, and PostgreSQL. It provides a seamless experience for managing and sharing your favorite GIF files with a beautiful and intuitive interface.

## Features

### Core Features
- 🎯 Bulk GIF upload with preview
- 🔄 Real-time upload progress
- 🔍 Search through your GIF collection
- 📋 Copy-to-clipboard sharing
- 🔗 Direct link generation
- 📱 Responsive design for all devices

### User Experience
- ⚡️ Fast loading and optimization
- 🎨 Modern, intuitive interface
- 📊 Upload status tracking
- 🏷️ Title and description management
- 📂 Grid-based gallery view

### Technical Features
- 🔒 Secure file handling
- 💾 PostgreSQL metadata storage
- 🚀 Optimized file serving
- 📈 Error handling and logging
- 🔍 Image preview generation

### Sharing & Social
- 🔗 One-click sharing
- 🔗 Direct URL access
- 📋 Easy copy link button
- 👥 Public access to shared GIFs

### Management
- 📁 Simple upload interface
- 📋 Basic metadata editing
- 🗑️ Delete functionality
- 📱 Mobile-friendly interface

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite (Build tool)

### Backend
- Express.js
- TypeScript
- PostgreSQL
- Drizzle ORM

### Infrastructure
- Docker
- Docker Compose

## Prerequisites

- Node.js (v20 or later)
- Docker and Docker Compose
- PostgreSQL (for local development)

## Environment Setup

1. Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@postgres:5432/giftrove?sslmode=disable
VITE_API_URL=http://localhost:3000
```

## Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Running with Docker

1. Build and start the containers:
```bash
docker-compose up --build
```

2. The application will be available at `http://localhost:3000`

3. To stop the containers:
```bash
docker-compose down
```

4. To remove all data (volumes):
```bash
docker-compose down -v
```

## Project Structure

```
Host your GIF/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   └── styles/       # CSS styles
├── server/                # Backend Express application
│   ├── routes/           # API routes
│   └── db/              # Database configuration
├── db/                   # Database migrations
├── uploads/             # GIF file storage
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Docker configuration
└── package.json         # Project dependencies
```

## Database Migrations

The project uses Drizzle ORM for database management. Migrations are automatically run when starting the Docker containers.

To run migrations manually:
```bash
npm run db:migrate
```

## Development Workflow

1. Make changes to the code
2. Test locally using `npm run dev`
3. Build the project using `npm run build`
4. Test the production build using Docker

## Production Deployment

1. Ensure all environment variables are properly set
2. Build and start the containers:
```bash
docker-compose -f docker-compose.yml up -d
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure migrations have run

2. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Check server logs for errors

3. **Docker Issues**
   - Clear Docker cache: `docker system prune`
   - Rebuild containers: `docker-compose up --build`
   - Check Docker logs: `docker-compose logs`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.
