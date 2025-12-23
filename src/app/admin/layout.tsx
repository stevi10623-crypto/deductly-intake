'use client'

import Link from "next/link";
import Image from "next/image";
import { Users, LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const supabase = createClient();
    const [role, setRole] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        async function fetchRole() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profileError) {
                        console.error('Error fetching profile:', profileError);
                        setRole('office'); // Fallback to office if profile not found
                        return;
                    }
                    setRole(profile?.role || 'office');
                }
            } catch (err) {
                console.error('Layout auth error:', err);
                setRole('office');
            }
        }
        fetchRole();
    }, []);

    async function handleLogout() {
        if (!confirm('Are you sure you want to log out?')) return;

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push('/login');
        } catch (error: any) {
            console.error('Logout error:', error);
            alert(`Failed to sign out: ${error?.message || 'Unknown error'}`);
            // Force redirect anyway on error to avoid being stuck
            router.push('/login');
        }
    }

    // Close sidebar when clicking a nav item on mobile
    function handleNavClick() {
        setSidebarOpen(false);
    }

    return (
        <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-950 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
                <Image
                    src="/logo.png"
                    alt="JJ Swart Deductify"
                    width={120}
                    height={35}
                    className="h-auto w-auto max-w-[120px]"
                />
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 text-neutral-400 hover:text-white"
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:relative z-50 md:z-auto h-full w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col transition-transform duration-300 ease-in-out",
                "md:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-neutral-800 hidden md:block">
                    <div className="mb-2">
                        <Image
                            src="/logo.png"
                            alt="JJ Swart Deductify"
                            width={180}
                            height={50}
                            className="h-auto w-auto max-w-[180px]"
                        />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{role === 'admin' ? 'Firm Admin' : 'Office Staff'}</p>
                </div>

                {/* Mobile header spacing */}
                <div className="md:hidden h-16" />

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" onClick={handleNavClick} />
                    <NavItem href="/admin/clients" icon={Users} label="Clients" onClick={handleNavClick} />
                    {role === 'admin' && <NavItem href="/admin/users" icon={Users} label="Team Management" onClick={handleNavClick} />}
                    <NavItem href="/admin/settings" icon={Settings} label="Settings" onClick={handleNavClick} />
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-neutral-900 w-full">
                {/* Mobile header spacing */}
                <div className="md:hidden h-14" />
                <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-400 rounded-md hover:text-white hover:bg-neutral-800 transition-colors"
        >
            <Icon size={18} />
            <span>{label}</span>
        </Link>
    );
}
