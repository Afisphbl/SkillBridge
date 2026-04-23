# 🚀 SkillBridge - Modern Freelance Marketplace

SkillBridge is a high-performance, SaaS-grade freelance marketplace built with the latest web technologies. It connects skilled sellers with buyers, providing a seamless experience for service discovery, order management, and real-time collaboration.

**[🌐 Live Preview](https://skill-bridge-weld-delta.vercel.app/)**

![SkillBridge Banner](file:///c:/Users/YES-COMPUTER-ET/Documents/Projects/skill-bridge/app/icon.png)

## ✨ Key Features

### 🛒 For Buyers
- **Service Discovery**: Browse and filter services across multiple categories with advanced search capabilities.
- **Order Management**: Track your orders from pending to completion with a dedicated buyer dashboard.
- **Secure Communication**: Real-time messaging with sellers to discuss requirements and revisions.
- **Profile Customization**: Manage your personal profile and account settings.

### 💼 For Sellers
- **Professional Dashboard**: Comprehensive analytics including earnings trends, order status distribution, and revenue by service.
- **Service Management**: Create, edit, and duplicate services with a robust multi-step form and image upload support.
- **Order Lifecycle**: Full control over the order workflow: Accept, Deliver, Revision Request, and Completion.
- **Performance Metrics**: Monitor your completion rate, on-time delivery, and customer satisfaction.

### 🛠️ Core Capabilities
- **Real-time Engine**: Powered by Supabase Realtime for instant message updates and dashboard refreshes.
- **Dynamic Theming**: Fully responsive design with support for Light and Dark modes.
- **SEO Optimized**: Built with Next.js App Router for superior performance and search engine visibility.
- **Premium UI**: Crafted with a design-token-based system using Tailwind CSS 4 for a sleek, modern aesthetic.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime, Storage)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [CSS Modules](https://github.com/css-modules/css-modules)
- **State Management**: [React Context API](https://react.dev/reference/react/useContext) & [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

## 📂 Project Structure

```bash
skill-bridge/
├── app/                  # Next.js App Router (Pages & Layouts)
├── components/           # Reusable UI & Feature-specific components
├── contexts/             # Global State (Theme, Auth, etc.)
├── hooks/                # Custom React Hooks for data & logic
├── lib/                  # Shared utility functions & constants
├── public/               # Static assets (images, icons)
├── services/             # Supabase API services & database logic
├── styles/               # Global styles & Tailwind configuration
├── types/                # TypeScript interfaces & definitions
└── utils/                # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/skill-bridge.git
   cd skill-bridge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Building for Production

To create an optimized production build:
```bash
npm run build
```

## 📄 License
This project is licensed under the MIT License.
