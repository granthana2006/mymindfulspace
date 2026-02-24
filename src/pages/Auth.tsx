import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Heart, Star, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--gradient-heavenly)" }}>
        <div className="animate-float text-6xl">✨</div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Check your email!", description: "We sent you a confirmation link." });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4" style={{ background: "var(--gradient-heavenly)" }}>
      {/* Floating decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Cloud className="absolute left-[10%] top-[15%] h-12 w-12 animate-float text-primary/10" />
        <Star className="absolute right-[15%] top-[20%] h-8 w-8 animate-float text-primary/15" style={{ animationDelay: "1s" }} />
        <Heart className="absolute bottom-[20%] left-[20%] h-6 w-6 animate-float text-primary/10" style={{ animationDelay: "2s" }} />
        <Sparkles className="absolute bottom-[30%] right-[10%] h-10 w-10 animate-float text-primary/15" style={{ animationDelay: "0.5s" }} />
        {/* Glitter dots */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/20 animate-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-block animate-float text-5xl">🌙</div>
          <h1 className="mb-1 font-serif text-3xl font-bold text-foreground">Soul Journal</h1>
          <p className="text-sm text-muted-foreground">Your safe space to breathe and reflect</p>
        </div>

        <div className="rounded-2xl border border-border/50 p-6 shadow-[var(--shadow-dreamy)]" style={{ background: "var(--gradient-glass)", backdropFilter: "blur(20px)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Display Name</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="border-border/50 bg-background/50" required />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="border-border/50 bg-background/50" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="border-border/50 bg-background/50" required minLength={6} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gap-2 shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
              {submitting ? "Please wait..." : isSignUp ? "Create Account" : "Enter Your Space"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
