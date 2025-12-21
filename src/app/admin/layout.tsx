'use client'

import Link from "next/link";
import Image from "next/image";
import { Users, LayoutDashboard, Settings, LogOut } from "lucide-react";
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
        if (confirm('Are you sure you want to log out?')) {
            await supabase.auth.signOut();
            router.push('/login');
        }
    }

    return (
        <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col">
                <div className="p-6 border-b border-neutral-800">
                    <div className="mb-2">
                        <Image
                            src="https://storage.googleapis.com/jjswart/c1b522_903f82c37aab4da28ae9886f72add797~mv2.avif"


                            alt="JJ Swart Deductify"
                            width={180}
                            height={50}
                            className="h-auto w-auto max-w-[180px]"
                        />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{role === 'admin' ? 'Firm Admin' : 'Office Staff'}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem href="/admin/clients" icon={Users} label="Clients" />
                    {role === 'admin' && <NavItem href="/admin/users" icon={Users} label="Team Management" />}
                    <NavItem href="/admin/settings" icon={Settings} label="Settings" />
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
            <main className="flex-1 overflow-auto bg-neutral-900">
                <div className="container mx-auto max-w-6xl p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-400 rounded-md hover:text-white hover:bg-neutral-800 transition-colors"
        >
            <Icon size={18} />
            <span>{label}</span>
        </Link>
    );
}
