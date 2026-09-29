"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import SCHEMA from "@/lib/globalSchema";
import loginService from "./loginService";

const LoginSchema = SCHEMA.USER.LOGIN;
type LoginForm = z.infer<typeof LoginSchema>;

const initialLoginState: LoginForm = {
  email: "",
  password: "",
};

const redirectPaths: Record<string, string> = {
  PARTICIPANT: "/participant/dashboard",
  JUDGE: "/judge/dashboard",
  ORGANIZER: "/organizer/dashboard",
  ADMIN: "/admin/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: initialLoginState,
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const response = await loginService.loginUser(data);

      console.log("Response :::: ", response);
      if (response.success && response.data != null) {
        toast.add({
          title: "User login",
          description: "Redirecting to your dashboard...",
        });
        await router.push(redirectPaths[response.data.role] || "/");
      } else {
        toast.add({
          title: "Login Failed",
          description: response.error?.message || "Invalid credentials.",
        });
      }
    } catch (error: any) {
      console.error("Error While Logging In: ", error);
      toast.add({
        title: "Login Error",
        description:
          error?.message || "Something went wrong while logging in.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#121212] p-4 text-[#E0E0E0] antialiased">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md"
      >
        <Card className="border border-[#282828] bg-[#181818] shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight text-[#EDEDED]">
                Login User
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-[#888888]">
                Not registered?
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[#2A2A2A] bg-[#222222] text-xs text-[#B0B0B0] hover:bg-[#2A2A2A] hover:text-[#FFFFFF]"
              onClick={() => router.push("/register")}
            >
              Register
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs text-[#A0A0A0]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="border-[#2A2A2A] bg-[#121212] text-sm text-[#EDEDED] placeholder:text-[#555555] focus:border-[#444444] focus:ring-0"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-xs text-[#A0A0A0]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="border-[#2A2A2A] bg-[#121212] text-sm text-[#EDEDED] placeholder:text-[#555555] focus:border-[#444444] focus:ring-0"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#EDEDED] text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF] disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}