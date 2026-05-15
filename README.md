<div align="center"> 
  <img width="100" height="100" src="https://github.com/user-attachments/assets/651c21d4-1074-4ccc-9407-7f57ac2d8588"  />

  # ZooAsk - Website Kuis Edukatif Interaktif Dengan Smart Pomodoro, Analisis Perilaku, Dan Gamifikasi Virtual Pet
</div>



<div align="center">

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-12.13.0-FFCA28?style=flat-square&logo=firebase&logoColor=white)](https://firebase.google.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.104.1-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-4.5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

**Transform Your Learning with Interactive Quizzes, Focus Sessions, and Adorable Pet Companions! 🐾**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Technologies](#-technologies) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**ZooAsk** adalah website kuis edukatif interaktif
yang dilengkapi dengan fitur Smart Pomodoro untuk membantu manajemen
waktu belajar, Behaviour Analysis untuk menganalisis kebiasaan pengguna,
serta sistem gamifikasi virtual pet yang bertujuan meningkatkan motivasi dan
keterlibatan pengguna selama proses belajar, ZooAsk membantu pengguna:

- ✅ Menyelesaikan kuis dan menguji pengetahuan mereka
- ✅ Fokus pada tugas dengan Fokus Mode yang immersive
- ✅ Memelihara virtual pet yang merespons aktivitas mereka
- ✅ Melacak progress dan statistik pembelajaran
- ✅ Menikmati pengalaman yang personalized dan engaging

---

## 🎯 Features

### 📚 Interactive Quiz System
- **Quiz Catalog**: Browse dan pilih dari berbagai quiz
- **Quiz Player**: Interface yang user-friendly untuk menjawab pertanyaan
- **Real-time Results**: Lihat score dan analisis jawaban Anda
- **Performance Analytics**: Tracking progress dan statistics

### ⏱️ Fokus Mode (Pomodoro)
- **Timer Management**: Custom duration untuk fokus sessions
- **Session History**: Kelola dan lihat riwayat fokus sessions Anda
- **Mood Tracking**: Pantau boredom level dan produktivitas
- **Background Music**: Musik ambient untuk meningkatkan konsentrasi

### 📊 Behavior Analysis
- **Overview Statistics**: Ringkasan performa dan aktivitas
- **Charts & Visualizations**: ApexCharts untuk data visualization
- **Performance Insights**: Analisis mendalam tentang learning progress

### 🐾 Virtual Pet Game
- **Interactive Pets**: Pilih dari berbagai karakter (cat, dog, frog, lamb, kangaroo)
- **Dynamic Animations**: Pet bereaksi terhadap mood Anda (bored, happy, idle)
- **Draggable Window**: Pindahkan pet di mana saja di layar
- **Boredom Bar**: Visual indicator untuk mood pet Anda

### 👥 User Authentication
- **Secure Login**: Integrasi Firebase & Supabase
- **User Profiles**: Personal dashboard dan settings
- **Data Persistence**: Sinkronisasi data real-time

---

## 💻 Tech Stack

### Frontend Framework
- **React** 18.2.0 - Modern UI library dengan hooks
- **Vite** 4.5.0 - Lightning-fast build tool
- **React Router DOM** 6.17.0 - Client-side routing

### Styling & UI
- **Tailwind CSS** 3.3.4 - Utility-first CSS framework
- **Material Tailwind** 2.1.4 - Pre-built React components
- **PostCSS** - CSS transformations
- **Prettier** - Code formatting

### Backend & Database
- **Firebase** 12.13.0 - Authentication & realtime database
- **Supabase** 2.104.1 - PostgreSQL & API platform

### Animations & Visualization
- **Lottie Web** 5.13.0 - High-quality animations
- **ApexCharts** 3.44.0 - Interactive charts
- **Heat Map UI** - Custom visualization components

### Development Tools
- **ESLint** - Code quality
- **JSConfig** - JavaScript module resolution
- **Autoprefixer** - CSS vendor prefixes

---

## 🚀 Installation

### Prerequisites
- Node.js 16+ 
- npm atau yarn
- Git

### Step-by-Step Setup

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/zooask.git
cd zooask
```

2. **Install Dependencies**
```bash
npm install
# atau
yarn install
```

3. **Configure Environment**
Buat file `.env.local` di root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start Development Server**
```bash
npm run dev
```
Aplikasi akan buka di `http://localhost:5173`

5. **Build untuk Production**
```bash
npm run build
```

---

## 📖 Usage

### Untuk End Users

1. **Login/Register**
   - Buka aplikasi dan daftar dengan email
   - Atau login jika sudah punya akun

2. **Explore Quiz**
   - Navigate ke Quiz section
   - Pilih quiz yang ingin dicoba
   - Jawab semua pertanyaan
   - Lihat hasil dan analisis

3. **Gunakan Fokus Mode**
   - Buka Fokus Mode dari dashboard
   - Atur durasi fokus session
   - Mulai timer dan fokus pada pekerjaan Anda
   - Musik ambient akan membantu konsentrasi

4. **Interact dengan Pet**
   - Pet Anda akan muncul di sidebar
   - Pet akan merespons mood berdasarkan aktivitas Anda
   - Klik untuk drag pet ke posisi favorit

---

## 📁 Project Structure

```
zooask/
├── public/
│   ├── css/
│   │   └── tailwind.css          # Tailwind styles
│   └── img/                       # Static images
├── src/
│   ├── assets/
│   │   └── game/                  # Pet animations (Lottie JSON)
│   ├── components/
│   │   └── AuthGate.jsx           # Authentication guard
│   ├── configs/
│   │   ├── charts-config.js       # ApexCharts configuration
│   │   └── index.js
│   ├── context/
│   │   ├── authContext.jsx        # Auth state management
│   │   ├── FokusContext.jsx       # Fokus mode state
│   │   └── MusicContext.jsx       # Music state
│   ├── data/
│   │   └── *.js                   # Static data & tables
│   ├── layouts/
│   │   ├── auth.jsx               # Auth layout
│   │   ├── dashboard.jsx          # Dashboard layout
│   │   └── index.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── sign-in.jsx
│   │   │   ├── sign-up.jsx
│   │   │   └── forgot-password.jsx
│   │   ├── dashboard/
│   │   │   ├── home.jsx
│   │   │   ├── analysis.jsx
│   │   │   └── fokusMode.jsx
│   │   └── quiz/
│   │       ├── QuizList.jsx       # Quiz listing
│   │       ├── QuizDetail.jsx     # Quiz details
│   │       ├── QuizPlay.jsx       # Quiz player
│   │       └── QuizResult.jsx     # Results page
│   ├── utils/
│   │   ├── firebase.jsx           # Firebase config
│   │   └── supabase.jsx           # Supabase config
│   ├── widgets/
│   │   ├── cards/                 # Reusable card components
│   │   ├── charts/                # Chart components
│   │   ├── game/                  # Pet game components
│   │   └── layout/                # Layout components
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx                 # Route definitions
├── package.json
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.cjs
├── prettier.config.cjs
└── README.md
```

---

## 🛠️ Available Scripts

```bash
# Development server
npm run dev

# Build untuk production
npm run build

# Preview build locally
npm run preview
```

---

## 🗝️ Key Features in Detail

### 📊 Analytics Dashboard
- Real-time statistics tentang quiz performance
- Visual charts untuk tracking progress
- Performance insights dan recommendations

### 🎨 Beautiful UI/UX
- Responsive design yang mobile-friendly
- Smooth animations menggunakan Lottie
- Material Design components
- Dark/Light mode support

### 🔐 Security
- Secure authentication dengan Firebase
- Protected routes dan components
- Environment variables untuk sensitive data

### ⚡ Performance
- Optimized dengan Vite bundler
- Code splitting dan lazy loading
- Efficient state management

---

## 🔄 State Management

Aplikasi menggunakan React Context API untuk state management:

```javascript
// Authentication Context
useAuth() // User authentication state

// Fokus Context
useFokus() // Focus sessions & timer state

// Music Context
useMusic() // Background music state
```

---

## 📱 Responsive Design

ZooAsk fully responsive dan bekerja sempurna di:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 🖥️ Desktops (1024px+)

---

## 📄 File Descriptions

| File | Purpose |
|------|---------|
| `src/main.jsx` | React app entry point |
| `src/App.jsx` | Main app component dengan routing |
| `src/routes.jsx` | Route definitions |
| `vite.config.js` | Vite configuration |
| `tailwind.config.cjs` | Tailwind CSS config |
| `package.json` | Dependencies dan scripts |
| `genezio.yaml` | Deployment configuration |
| `vercel.json` | Vercel deployment config |

---

## 🐛 Troubleshooting

### Issue: Port already in use
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

### Issue: Dependencies conflict
```bash
# Clear node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Firebase not connecting
- Verify `.env.local` configuration
- Check Firebase project settings
- Ensure API keys are correct

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** - Untuk library yang amazing
- **Tailwind Labs** - Untuk Tailwind CSS
- **Firebase & Supabase** - Untuk backend services
- **Community Contributors** - Terima kasih untuk kontribusi Anda!

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

<div align="center">

### Made with by the ZooAsk Team

</div>
