import { PublicNav } from '@/components/PublicNav';
import { Footer } from '@/components/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed ambient orbs -- position:fixed means they are never clipped by section/page overflow */}
      <div aria-hidden="true" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 900px 700px at 96% -4%, rgba(var(--accent-rgb),0.15) 0%, transparent 60%),
          radial-gradient(ellipse 600px 600px at 2% 18%, rgba(var(--accent-rgb),0.09) 0%, transparent 60%),
          radial-gradient(ellipse 500px 500px at 88% 75%, rgba(var(--accent-rgb),0.06) 0%, transparent 60%)
        `,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <PublicNav />
        {children}
        <Footer />
      </div>
    </>
  );
}
