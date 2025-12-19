"use client";

import { usePathname } from "next/navigation";

interface ClientLayoutWrapperProps {
    children: React.ReactNode;
    navbar: React.ReactNode;
    chatWidget: React.ReactNode;
}

export function ClientLayoutWrapper({ children, navbar, chatWidget }: ClientLayoutWrapperProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    return (
        <>
            {!isLoginPage && navbar}
            {children}
            {!isLoginPage && chatWidget}
        </>
    );
}
