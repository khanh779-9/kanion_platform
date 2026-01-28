import { Link } from 'react-router-dom';
import { Lock, FileText, ArrowRight } from 'lucide-react';

export default function Home({ user }) {
  const cards = [
    { to: '/vault', title: 'Vault', desc: 'Manage passwords, OTP secrets, and sensitive data', icon: Lock },
    { to: '/notes', title: 'Notes', desc: 'Create and share encrypted notes securely', icon: FileText },
  ];
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
        {/* Hero Section */}
        {!user && (
          <div className="mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-700/40 bg-emerald-900/10">
              <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              <span className="text-sm font-semibold text-emerald-700">Secure Your Life</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-100 mt-4 mb-6 leading-tight">Everything You Need<br />To Stay Secure</h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mb-8">Protect your passwords, secrets, and sensitive information with military-grade encryption.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all bg-emerald-700 hover:bg-emerald-800">
              Get Started Free
              <ArrowRight size={20} />
            </Link>
          </div>
        )}

        {/* Features Grid - horizontal card, icon left, content right */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <Link key={c.to} to={c.to} className="group flex items-center rounded-xl bg-gray-900 dark:bg-gray-800 p-4 sm:p-5 shadow hover:shadow-lg transition-all border border-gray-800 dark:border-gray-700 hover:bg-gray-800/80">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center bg-emerald-900/30 mr-4">
                  <Icon size={26} style={{ color: '#17A24B' }} />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-100 mb-0.5 truncate">{c.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-snug truncate">{c.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-emerald-800"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%23ffffff%27%20fill-opacity=%270.05%27%3E%3Cpath%20d=%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            <div className="relative px-6 py-12 sm:px-12 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to take control?</h2>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-8">Join thousands of users protecting their data with Kanion Secure Space</p>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg" style={{ color: '#17A24B' }}>
                Create Your Account
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
