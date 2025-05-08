# UIUC Study Buddy

A web application that helps UIUC students find study partners for their courses. Built with Next.js, Prisma, and NextAuth.js.

## Features

- Sign in with Google
- Add your current courses
- Find study partners taking the same courses
- Match and connect with other students
- Modern UI with UIUC colors (orange and blue)

## Prerequisites

- Node.js 18+ and npm
- A Google Cloud project with OAuth 2.0 credentials

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/uiuc-study-buddy.git
   cd uiuc-study-buddy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Set up a Google Cloud project and create OAuth 2.0 credentials
   - Add your Google Client ID and Secret to `.env`
   - Generate a random string for NEXTAUTH_SECRET

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User**: Stores user information and authentication details
- **Course**: Represents a course with its code, name, and semester
- **Match**: Connects users who are studying the same course

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
