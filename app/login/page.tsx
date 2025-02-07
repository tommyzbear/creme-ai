"use client";

import { useLogin, User } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Login() {
    const router = useRouter();

    const postLogin = async (userData: User) => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error("Failed to send user data to backend");
            }

            return await response.json();
        } catch (error) {
            toast({
                title: "Error",
                description: "Error sending user data to backend",
                variant: "destructive",
            });
            console.error("Error sending user data to backend:", error);
        }
    };

    const { login } = useLogin({
        onComplete: async ({ user }) => {
            // Send user data to backend
            await postLogin(user);

            router.push("/");
        },
    });

    return (
        <main className="flex min-h-screen min-w-full">
            <div className="flex bg-privy-light-blue flex-1 p-6 justify-center items-center">
                <div className="">
                    <div className="select-none flex justify-center mb-8 transition-transform duration-1000 scale-x-[-1] hover:scale-[1.05] hover:scale-x-[-1.05]">
                        <Image
                            src="/creme-ai.png"
                            alt="Crème'ai Logo"
                            width={480}
                            height={480}
                            priority
                            draggable="false"
                            className="select-none rounded-3xl opacity-95 mix-blend-multiply animate-float hover:scale-[1.05] pointer-events-auto"
                        />
                    </div>
                    <div className="mt-6 flex items-center justify-center flex-col gap-2">
                        <Button
                            size="lg"
                            className="w-fit rounded-xl bg-accent/80 transition-colors hover:bg-accent"
                            onClick={login}
                        >
                            Sign Up
                        </Button>
                        <Button size="lg" className="w-fit rounded-xl" onClick={login}>
                            Log In
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
