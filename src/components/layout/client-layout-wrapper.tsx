"use client";

import { usePathname } from "next/navigation";

interface ClientLayoutWrapperProps {
    children: React.ReactNode;
    navbar: React.ReactNode;
    chatWidget: React.ReactNode;
}

import { ProfileOnboarding } from "@/components/auth/profile-onboarding";

export function ClientLayoutWrapper({ children, navbar, chatWidget }: ClientLayoutWrapperProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    return (
        <>
            <ProfileOnboarding />
            {!isLoginPage && navbar}
            {children}
            {!isLoginPage && chatWidget}
        </>
    );
}
