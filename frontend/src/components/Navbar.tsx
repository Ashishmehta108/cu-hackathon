import { Link, useLocation } from "react-router-dom"
import { Menu, X, Mic2, Home as HomeIcon, LayoutDashboard, LibraryBig, Radio } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    const links = [
        { href: "/", label: "Home", icon: HomeIcon },
        { href: "/record-complaint", label: "Report Issue", icon: Mic2 },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/wiki", label: "Wiki", icon: LibraryBig },
        { href: "/record-wiki", label: "Share Wisdom", icon: Radio },
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                                <Mic2 className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Awaaz</span>
                        </Link>
                    </div>

                    {/* Desktop links */}
                    <div className="hidden md:flex md:items-center md:gap-6">
                        {links.map((link) => {
                            const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href))
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={cn(
                                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-border/40 bg-background">
                    <div className="space-y-1 px-4 pb-4 pt-2">
                        {links.map((link) => {
                            const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href))
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <link.icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </nav>
    )
}
