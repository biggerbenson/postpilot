export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/40 bg-gradient-to-r from-orange-50 via-rose-50 to-amber-50 py-4 dark:border-border dark:bg-card">
      <div className="container mx-auto px-4 text-center text-sm text-slate-600 dark:text-muted-foreground">
        <p>
          © {year} PostPilot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
