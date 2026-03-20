import { Link } from "wouter";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <ShieldAlert className="w-24 h-24 text-destructive/50 mb-8" />
      <h1 className="text-6xl font-display font-bold text-white mb-4 tracking-tight">404</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        The sector you are trying to access does not exist in our database or has been restricted.
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all font-mono uppercase tracking-widest text-sm"
      >
        Return to Scanner
      </Link>
    </div>
  );
}
