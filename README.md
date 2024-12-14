# GifTrove 🎯

A modern, secure platform for hosting and sharing GIFs with built-in privacy controls and a beautiful user interface.

![GIF](/public/gif-demo-max.gif)

## ✨ Features

- 🔒 **Privacy Controls**: Public and private GIF sharing options
- 🎨 **Modern UI**: Clean, responsive design with dark/light mode support
- 🔍 **Smart Search**: Real-time GIF search functionality
- 👤 **User Management**: Secure authentication and user profiles
- 📤 **Easy Sharing**: Quick share options with multiple format support
- 🌐 **Multi-format Support**: Support for various GIF formats
- 💾 **File Management**: 25MB file size limit with automatic cleanup
- 🎯 **Content Safety**: Built-in content moderation policies
- 🌙 **Theme Support**: Elegant dark and light mode themes
- 📱 **Responsive Design**: Works seamlessly on all devices

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Chakra UI, Framer Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based auth system
- **Storage**: Local file system with automatic cleanup
- **API**: RESTful API with rate limiting

## 🛠️ Setup

1. **Clone the repository**
```bash
git clone https://github.com/rohitg00/host-your-gif
cd host-your-gif
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Environment Setup**
Copy `.env.example` to `.env` in both client and server directories and update the values:

```env
# Server Environment Variables
DATABASE_URL=postgresql://user:password@localhost:5432/giftrove
JWT_SECRET=your_jwt_secret_key
PORT=3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=25000000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Client Environment Variables
VITE_API_URL=http://localhost:3000
```

4. **Database Setup**
```bash
cd server
npm run db:migrate
```

5. **Start the Application**
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```
## 🐳 Run with Docker

1. **Pull the Docker Image**
```bash
docker pull rohitghumare64/host-your-gif:latest
```

2. **Run the Docker Container**
```bash
docker run -p 3000:3000 rohitghumare64/host-your-gif:latest \
-e DATABASE_URL=postgresql://user:password@localhost:5432/giftrove \
-e JWT_SECRET=your_jwt_secret_key
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### GIF Endpoints
- `POST /api/upload` - Upload new GIF(s)
- `GET /api/gifs` - Get all public GIFs
- `GET /api/gifs/:id` - Get specific GIF
- `DELETE /api/gifs/:id` - Delete a GIF

## 🔒 Security

- Rate limiting on all API endpoints
- JWT-based authentication
- File type validation
- Content moderation
- Secure file storage
- XSS protection

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📋 Content Policy

Please review our [Content Policy](POLICY.md) for guidelines on acceptable content.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Hosted on [Sevalla](https://sevalla.com)
- Built with [Chakra UI](https://chakra-ui.com)
- Icons by [React Icons](https://react-icons.github.io/react-icons)
