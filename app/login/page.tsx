"use client";

import { useLogin, User } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

export default function Login() {
    const router = useRouter();

    const postLogin = async (userData: User) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('Failed to send user data to backend');
            }

            return await response.json();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error sending user data to backend',
                variant: 'destructive',
            });
            console.error('Error sending user data to backend:', error);
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
                <div>
                    <div className="flex justify-center mb-8">
                        <Image
                            src="/creme-ai.png"
                            alt="Creme AI"
                            width={480}
                            height={480}
                            priority
                            className="rounded-3xl"
                        />
                    </div>
                    <div className="mt-6 flex justify-center text-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 py-3 px-6 text-white rounded-lg"
                            onClick={login}
                        >
                            Log in
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}