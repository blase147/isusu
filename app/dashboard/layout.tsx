import SideNav from '@/app/ui/dashboard/sidenav';
import NavBar from '@/app/ui/navbar/navbar';
import { SessionProvider } from 'next-auth/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
<SessionProvider>
      <div className="flex h-screen bg-gray flex-col md:flex-row md:overflow-hidden mt-20 sm:mt-30">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <NavBar />
      <div className="flex-grow p-6 md:overflow-y-auto md:p-4 mt-8">{children}      {/* Footer */}
          {/* Footer */}
          <footer id="contact" className="bg-gray-800 text-gray-300 py-6">
            <div className="container mx-auto text-center">
              <p>
                &copy; 2025 Isusu App. All rights reserved. <span className="mx-2">|</span>
                <a href="mailto:support@isusuapp.com" className="text-blue-400 hover:underline mx-4">
                  Contact Us
                </a>
                <span className="mx-2">|</span>
                <a href="/privacy-policy" className="text-blue-400 hover:underline mx-4">
                  Privacy Policy
                </a>
              </p>
            </div>
          </footer>
      </div>
    </div>
    </SessionProvider>
  );
}
