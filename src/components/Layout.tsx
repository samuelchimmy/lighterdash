import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LineChart, 
  GitCompare, 
  Calculator, 
  ShieldAlert, 
  BarChart3,
  Menu,
  X
} from 'lucide-react';
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
  { label: 'AI Trader Insights', path: '/trade-analyzer', icon: LineChart },
  { label: 'Liquidations', path: '/liquidations', icon: ShieldAlert },
  { label: 'Calculator', path: '/calculator', icon: Calculator },
  { label: 'Compare Wallets', path: '/community', icon: GitCompare },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export function Layout({ children, showNav = true, headerContent }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="p-2 rounded-xl bg-primary/10">
                <LayoutDashboard className="w-6 h-6 text-primary" fill="currentColor" fillOpacity={0.2} />
              </div>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                LighterDash
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              {headerContent}
              
              {showNav && (
                <>
                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        variant={location.pathname === item.path ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Mobile Navigation Menu */}
                  {isMobile && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="md:hidden">
                          <Menu className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {navItems.map((item) => (
                          <DropdownMenuItem
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`gap-3 cursor-pointer ${
                              location.pathname === item.path ? 'bg-primary/10 text-primary' : ''
                            }`}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
              
              <ThemeToggle />
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
