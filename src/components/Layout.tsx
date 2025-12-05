import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Squares2X2Icon,
  LightBulbIcon,
  FireIcon,
  ChartBarIcon,
  ScaleIcon,
  ChartPieIcon,
  Bars3Icon
} from '@heroicons/react/24/solid';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  headerContent?: React.ReactNode;
}

const navItems = [
  { label: 'AI Trader Insights', path: '/trade-analyzer', icon: LightBulbIcon },
  { label: 'Liquidations', path: '/liquidations', icon: FireIcon },
  { label: 'Calculator', path: '/calculator', icon: ChartBarIcon },
  { label: 'Compare Wallets', path: '/community', icon: ScaleIcon },
  { label: 'Analytics', path: '/analytics', icon: ChartPieIcon },
];

export function Layout({ children, showNav = true, headerContent }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Squares2X2Icon className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-sm md:text-base font-semibold text-foreground">
                LighterDash
              </h1>
            </div>
            
            <div className="flex items-center gap-1.5">
              {headerContent}
              
              <ThemeToggle />
              
              {/* Desktop Navigation - Always visible */}
              <div className="hidden md:flex items-center gap-1 lg:gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    variant={location.pathname === item.path ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1 h-7 px-2 text-[10px] lg:h-8 lg:px-3 lg:text-xs"
                  >
                    <item.icon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>

              {/* Mobile Navigation Menu - Always visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden h-7 w-7">
                    <Bars3Icon className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {navItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`gap-2 cursor-pointer text-xs ${
                        location.pathname === item.path ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <item.icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}