# 🚀 TaskFlow Pro

A modern, intelligent task management application built with **Next.js** and **Firebase**.

![TaskFlow Pro](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue?style=for-the-badge&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)

## ✨ Features

- 🔥 **Real-time synchronization** with Firebase
- 🎨 **Modern UI/UX** with Tailwind CSS
- 🌙 **Dark mode** support
- 📱 **Responsive design** for all devices
- ⭐ **Star tasks** for quick access
- 🗂️ **Categories** and **priority levels**
- 📅 **Due dates** with overdue detection
- 🔍 **Search** and **filter** functionality
- 📊 **Progress tracking** and statistics
- ⚡ **Optimistic updates** for better UX
- 🔒 **Secure** environment variables

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Database**: Firebase Realtime Database
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Language**: JavaScript/TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- Firebase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/taskflow-pro.git
cd taskflow-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Realtime Database
3. Copy your configuration to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Security Rules

```json
{
  "rules": {
    "tasks": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Vercel
- `npm run clean` - Clean build files

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/taskflow-pro)

**Or manually:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel login
vercel --prod
```

3. **Set environment variables** in Vercel Dashboard

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/taskflow-pro)

## 📱 Features Overview

### Task Management
- ✅ Create, edit, delete tasks
- ⭐ Star important tasks
- 📋 Organize by categories (Work, Personal, Learning, Health, Projects)
- 🚦 Set priority levels (Low, Medium, High)
- 📅 Set due dates with overdue alerts

### User Interface
- 🌙 Dark/Light mode toggle
- 📱 Fully responsive design
- 🔍 Real-time search
- 🗂️ Smart filtering (All, Today, Upcoming, Starred, Overdue)
- 📊 Progress visualization
- ⚡ Smooth animations and transitions

### Data & Sync
- 🔥 Real-time Firebase synchronization
- 💾 Auto-save functionality
- 🔄 Optimistic updates
- 📡 Connection status monitoring
- 🔒 Secure environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Firebase** for the robust backend services
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icons
- **Vercel** for seamless deployment

## 📞 Support

- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/taskflow-pro/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/taskflow-pro/discussions)

---

Made with ❤️ by [Your Name](https://github.com/yourusername)