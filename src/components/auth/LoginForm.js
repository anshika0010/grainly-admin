"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Package,
  ShoppingBag,
  Users,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const areas = [
  { icon: Package, title: "Products", text: "Add, edit and organise your catalogue." },
  { icon: ShoppingBag, title: "Booking", text: "Track and fulfil Booking as they come in." },
  {icon: BookOpen, title: "Blogs",text: "Create and manage blog posts, publish content, and boost your website's SEO.",},
];

function Logo({ className = "" }) {
  return (
    <span className={`flex h-full items-center text-2xl font-bold tracking-tight ${className}`}>
      Grainly
    </span>
  );
}

export function LoginForm() {
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(form.email, form.password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError("We couldn't sign you in. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/10 md:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground md:flex">
        {/* depth: light from top-left, shade at bottom-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgb(255_255_255/0.18),transparent_55%),linear-gradient(to_bottom_right,transparent_40%,rgb(0_0_0/0.25))]"
        />
        {/* dot grid, fading out toward the bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgb(255_255_255/0.5)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
        />
        {/* concentric rings */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full border border-primary-foreground/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full border border-primary-foreground/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 rounded-full border border-primary-foreground/10"
        />

        <div className="relative">
          {/* White tile guarantees the logo is legible on any brand colour */}
          <div className="inline-flex h-16 items-center rounded-2xl bg-white px-5 py-3 shadow-lg shadow-black/20">
            <Logo className="text-slate-900" />
          </div>

          <h2 className="mt-10 text-3xl font-semibold leading-tight tracking-tight">
            Run your store from one place.
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-primary-foreground/75">
            Sign in to the Grainly admin dashboard.
          </p>
        </div>

        <ul className="relative space-y-3">
          {areas.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex items-start gap-3.5 rounded-2xl bg-primary-foreground/10 p-3.5 ring-1 ring-primary-foreground/15 backdrop-blur-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-primary-foreground/70">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Form panel */}
      <section className="flex flex-col justify-center p-8 sm:p-12">
        {/* Logo shows here on mobile, where the brand panel is hidden */}
        <div className="mb-8 h-11 self-start md:hidden">
          <Logo className="text-foreground" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your details to sign in.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                placeholder="admin@promolecules.com"
                className="h-12 rounded-xl bg-muted/50 pl-11 pr-4 transition-shadow focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="h-12 rounded-xl bg-muted/50 pl-11 pr-12 transition-shadow focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={form.remember}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, remember: checked === true }))
              }
            />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-sm font-normal text-muted-foreground"
            >
              Keep me signed in
            </Label>
          </div>

          <Button
            className="h-12 w-full rounded-xl text-sm font-medium shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/30"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Authorized staff only
        </p>
      </section>
    </div>
  );
}