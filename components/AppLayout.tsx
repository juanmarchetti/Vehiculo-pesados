import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  topbarTitle?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function AppLayout({ children, topbarTitle, breadcrumb }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={topbarTitle} breadcrumb={breadcrumb} />
        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
