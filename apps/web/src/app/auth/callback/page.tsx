"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            localStorage.setItem("auth_token", token);
            router.push("/dashboard");
        } else {
            router.push("/login?error=auth_failed");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Autenticando...</p>
            </div>
        </div>
    );
}
