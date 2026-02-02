import { Link } from 'react-router-dom';
import { Lock, FileText, ArrowRight } from 'lucide-react';

import { useContext } from 'react';
import { ThemeContext } from '@/components/ThemeContext.jsx';
import { themeColors, getThemeColor } from '../themeColors';

export default function Home({ user }) {
  const { theme } = useContext(ThemeContext);
  const cards = [
    { to: '/vault', title: 'Vault', desc: 'Manage passwords, OTP secrets, and sensitive data', icon: Lock },
    { to: '/notes', title: 'Notes', desc: 'Create and share encrypted notes securely', icon: FileText },
  ];
  // Use only themeColors.js for all backgrounds, text, cards, and buttons
  let mainClass = 'min-h-screen ' + getThemeColor(theme, 'background');
  const cardBg = getThemeColor(theme, 'card');
  const cardTitleClass = getThemeColor(theme, 'cardTitle');
  const cardDescClass = getThemeColor(theme, 'cardDesc');
  const headingClass = getThemeColor(theme, 'text');
  const subheadingClass = getThemeColor(theme, 'textSecondary');
  const heroBtnClass = getThemeColor(theme, 'button') + ' inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all';
  const ctaBtnClass = getThemeColor(theme, 'button') + ' inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg';
  const serviceCardClass = `group relative flex items-center rounded-2xl border ${getThemeColor(theme, 'border')} ${cardBg} p-4 sm:p-5 shadow-md hover:shadow-2xl transition-all hover:-translate-y-0.5`;
  const serviceIconWrapClass = `flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mr-4 ${getThemeColor(theme, 'backgroundSecondary')} group-hover:${getThemeColor(theme, 'accent')} transition-colors`;
  const serviceIconClass = `transition-colors ${getThemeColor(theme, 'text')} group-hover:${getThemeColor(theme, 'accentText')}`;
  const servicePillClass = `ml-auto px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getThemeColor(theme, 'button')} shadow-sm group-hover:shadow-md transition-all`;
  return (
    <main className={mainClass}>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
        {/* Hero Section */}
        {!user && (
          <div className="mb-16 sm:mb-20">
            <div className={"inline-flex items-center gap-2 px-4 py-2 rounded-full border " + getThemeColor(theme, 'border') + ' ' + getThemeColor(theme, 'backgroundSecondary')}>
              <div className={"w-2 h-2 rounded-full " + getThemeColor(theme, 'backgroundSecondary')}></div>
              <span className={"text-sm font-semibold " + getThemeColor(theme, 'textSecondary')}>Secure Your Life</span>
            </div>
            <h1 className={`text-4xl sm:text-6xl font-bold mt-4 mb-6 leading-tight ${headingClass}`}>Everything You Need<br />To Stay Secure</h1>
            <p className={`text-lg sm:text-xl max-w-2xl mb-8 ${subheadingClass}`}>Protect your passwords, secrets, and sensitive information with military-grade encryption.</p>
            <Link to="/register" className={heroBtnClass}>
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
              <Link key={c.to} to={c.to} className={serviceCardClass}>
                <div className={serviceIconWrapClass}>
                  <Icon size={36} className={serviceIconClass} />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className={`text-base sm:text-lg font-bold mb-0.5 truncate ${cardTitleClass}`}>{c.title}</h3>
                  <p className={`text-xs sm:text-sm leading-snug truncate ${cardDescClass}`}>{c.desc}</p>
                </div>
                <span className={servicePillClass}>Open</span>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        {!user && (
          <div className={"relative rounded-3xl overflow-hidden shadow-2xl " + getThemeColor(theme, 'backgroundSecondary') + ' ' + getThemeColor(theme, 'border')}>
            <div className={"relative px-6 py-12 sm:px-12 sm:py-20 text-center"}>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${headingClass}`}>Ready to take control?</h2>
              <p className={`text-base sm:text-lg max-w-2xl mx-auto mb-8 ${subheadingClass}`}>Join thousands of users protecting their data with Kanion Secure Space</p>
              <Link to="/register" className={ctaBtnClass}>
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
