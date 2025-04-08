'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navItems = [
  { name: 'Einführung', href: '/' },
  { name: 'Tokenisierung', href: '/tokenization' },
  { name: 'Next-Token-Prediction', href: '/next-token' },
  { name: 'Daten', href: '/daten'},
  { name: 'Training vs. Inferenz', href: '/training' },
  { name: 'Finetuning', href: '/finetuning' },
  { name: 'RLHF', href: '/rlhf' },
  { name: 'RAG', href: '/rag' },
  { name: 'Chain-of-Thought', href: '/chain-of-thought' },
  { name: 'Embeddings', href: '/embeddings' },
  { name: 'Ressourcen', href: '/resources' }
]

export function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close sheet when route changes (on mobile)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const NavLinks = () => (
    <div className="space-y-1">
      {navItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href} 
          className="block"
        >
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === item.href 
                ? "bg-violet-100 text-violet-900 hover:bg-violet-200" 
                : ""
            )}
          >
            {item.name}
          </Button>
        </Link>
      ))}
    </div>
  )

  const NavHeader = () => (
    <div className="p-5 border-b">
      <h1 className="text-xl font-bold text-violet-900">Behind ChatGPT</h1>
      <p className="text-sm text-gray-500 mt-1">Wie funktionieren LLMs?</p>
    </div>
  )

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block md:w-64 h-screen sticky top-0 border-r bg-white overflow-y-auto">
        <NavHeader />
        <div className="p-4">
          <NavLinks />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="fixed top-4 left-4 z-40"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <NavHeader />
            <div className="p-4">
              <NavLinks />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}