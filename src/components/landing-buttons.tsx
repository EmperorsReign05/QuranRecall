"use client";

import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type LandingButtonsProps = {
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
};

export function LandingButtons({
  className,
  primaryClassName,
  secondaryClassName,
}: LandingButtonsProps) {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGuestLogin = () => {
    sessionStorage.setItem("dev_guest", "true");
    router.push("/dashboard");
  };

  if (!mounted || isLoading) {
    return (
      <div className={cn("mt-8 flex flex-col gap-3 sm:flex-row opacity-50", className)}>
        <Button size="lg" disabled>Loading...</Button>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className={cn("mt-8 flex flex-col gap-3 sm:flex-row", className)}>
        <Button asChild size="lg" className={primaryClassName}>
          <Link href="/dashboard">
            Open dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("mt-8 flex flex-col gap-3 sm:flex-row", className)}>
      <Button
        size="lg"
        onClick={login}
        className={cn("bg-emerald-600 text-white hover:bg-emerald-700", primaryClassName)}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign in with Quran.com
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={handleGuestLogin}
        className={secondaryClassName}
      >
        Continue as Guest (Dev)
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
