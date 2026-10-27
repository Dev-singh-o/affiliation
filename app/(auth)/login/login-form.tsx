"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { LogInIcon } from "lucide-react";

import { loginAction, type LoginFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginFormState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!state.fieldErrors?.email}
        />
        {state.fieldErrors?.email?.map((message) => (
          <p key={message} className="text-destructive text-sm">
            {message}
          </p>
        ))}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={!!state.fieldErrors?.password}
        />
        {state.fieldErrors?.password?.map((message) => (
          <p key={message} className="text-destructive text-sm">
            {message}
          </p>
        ))}
      </div>

      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        <LogInIcon />
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
