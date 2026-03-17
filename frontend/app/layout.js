import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';  // ← Add karo

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SkillSphere — Learn Anything',
  description: 'Online Learning Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <Toaster 
            position="top-right"
            toastOptions={{
              success: {
                duration: 4000,
                style: {
                  background: '#10b981',
                  color: 'white',
                  fontWeight: '600'
                }
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: '600'
                }
              }
            }}
          />  {/* ← Add karo */}
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}