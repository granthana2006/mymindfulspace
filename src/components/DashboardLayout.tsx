import { ReactNode, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  BookOpen,
  Calendar,
  Film,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Journal", path: "/journal", icon: <BookOpen className="h-5 w-5" /> },
  { label: "Planner", path: "/planner", icon: <Calendar className="h-5 w-5" /> },
  { label: "Books", path: "/books", icon: <BookOpen className="h-5 w-5" /> },
  { label: "Movies & Series", path: "/movies", icon: <Film className="h-5 w-5" /> },
  { label: "College", path: "/college", icon: <GraduationCap className="h-5 w-5" /> },
  { label: "Personal Space", path: "/personal", icon: <Heart className="h-5 w-5" /> },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="font-serif text-lg font-semibold text-sidebar-foreground">LifeSpace</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden lg:flex">
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
