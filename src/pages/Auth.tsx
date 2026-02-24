import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutDashboard } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-float text-4xl">✨</div>
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h1 className="mb-1 font-serif text-3xl font-bold text-foreground">LifeSpace</h1>
          <p className="text-sm text-muted-foreground">Your personal life dashboard</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Display Name</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
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
