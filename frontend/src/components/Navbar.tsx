import { Link, useLocation } from "react-router-dom"
import {
    HambergerMenu,
    CloseCircle,
    Microphone,
    Home2 as HomeIcon,
    Category,
    Book1,
    Radio,
    Microphone2,
} from "iconsax-react";
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    const links = [
        { href: "/", label: "Home", icon: HomeIcon },
        { href: "/record-complaint", label: "Report Issue", icon: Microphone },
        { href: "/dashboard", label: "Dashboard", icon: Category },
        { href: "/wiki", label: "Wiki", icon: Book1 },
        { href: "/record-wiki", label: "Share Wisdom", icon: Radio },
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/5 text-primary">
                            <Microphone2 className="h-6 w-6" color="black" variant="Linear" />
                        </div>
                        <span className="text-base font-semibold tracking-tight">
                            Awaaz
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {links.map((link) => {
                            const isActive =
                                location.pathname === link.href ||
                                (link.href !== '/' &&
                                    location.pathname.startsWith(link.href))

                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={cn(
                                        "relative flex items-center gap-2 text-sm font-medium transition-colors duration-200",
                                        isActive
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <link.icon
                                        className="h-4 w-4"
                                        variant="Linear"
                                        color="black"
                                    />
                                    {link.label}

                                    {/* Subtle underline indicator */}
                                    {isActive && (
                                        <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-primary/70 rounded-full" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-muted-foreground hover:text-foreground transition"
                        >
                            {isOpen ? (
                                <CloseCircle className="h-6 w-6" variant="Linear" />
                            ) : (
                                <HambergerMenu className="h-6 w-6" variant="Linear" color="black" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
                    <div className="px-4 py-3 space-y-2">
                        {links.map((link) => {
                            const isActive =
                                location.pathname === link.href ||
                                (link.href !== '/' &&
                                    location.pathname.startsWith(link.href))

                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                                        isActive
                                            ? "bg-primary/5 text-foreground"
                                            : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                                    )}
                                >
                                    <link.icon
                                        className="h-5 w-5"
                                        variant="Linear"
                                    />
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