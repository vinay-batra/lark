import { PublicNav } from '@/components/PublicNav';
import { Footer } from '@/components/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      {children}
      <Footer />
    </>
  );
}
