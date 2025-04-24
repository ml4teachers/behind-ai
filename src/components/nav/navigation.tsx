'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion" // Import Accordion components

// Define the new navigation structure
const mainSections = [
  {
    title: "Hinter den Modellen",
    id: "behind-models",
    links: [
      // Einführung removed
      { name: 'Tokenisierung', href: '/tokenization' },
      { name: 'Next-Token-Prediction', href: '/next-token' },
      { name: 'Daten', href: '/daten'},
      { name: 'Training vs. Inferenz', href: '/training' },
      { name: 'Finetuning', href: '/finetuning' },
      { name: 'RLHF', href: '/rlhf' },
      { name: 'RAG', href: '/rag' },
      { name: 'Chain-of-Thought', href: '/chain-of-thought' },
      { name: 'Embeddings', href: '/embeddings' },
      // Ressourcen removed
    ],
  },
  {
    title: "KI im Einsatz",
    id: "ai-in-use",
    links: [
      { name: "Lokal vs. Cloud", href: "/lokal-vs-cloud" },
      { name: "Hardware-Check", href: "/hardware-check" },
      { name: "Kosten", href: "/kosten" },
      { name: "Datenschutz (DSG)", href: "/datenschutz" },
        ],
  },
];

// Define top-level links
const topLevelLinks = [
    { name: 'Einführung', href: '/' },
];

const bottomLevelLinks = [
    { name: 'Ressourcen', href: '/resources' }
];


export function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(() => {
    // Find which section the current path belongs to and set it as default open
    const currentSection = mainSections.find(section =>
      section.links.some(link => link.href === pathname)
    );
    // If path is not in main sections, check top/bottom level links
    if (!currentSection && (topLevelLinks.some(l => l.href === pathname) || bottomLevelLinks.some(l => l.href === pathname))) {
        return undefined; // No accordion item should be open for top/bottom level links
    }
    return currentSection?.id || mainSections[0]?.id; // Default to first section if no match or on root
  });

  // Close sheet when route changes (on mobile)
  useEffect(() => {
    setOpen(false)
    // Update active accordion item based on new path
    const currentSection = mainSections.find(section =>
      section.links.some(link => link.href === pathname)
    );
    if (currentSection) {
      setActiveAccordionItem(currentSection.id);
    } else if (topLevelLinks.some(l => l.href === pathname) || bottomLevelLinks.some(l => l.href === pathname)) {
        // Collapse accordion if a top/bottom level link is active
        setActiveAccordionItem(undefined);
    } else {
        // Default to first section if path is unknown (e.g., initial load on root)
        setActiveAccordionItem(mainSections[0]?.id);
    }

  }, [pathname])

  // Helper function to render individual links (used for top/bottom and inside accordion)
  const renderLink = (item: { name: string; href: string }, isTopOrBottomLevel: boolean = false) => (
    <Link
      key={item.href}
      href={item.href}
      className="block"
      onClick={() => setOpen(false)} // Close sheet on link click
    >
      <Button
        variant={pathname === item.href ? (isTopOrBottomLevel ? "default" : "secondary") : "ghost"}
        className={cn(
          "w-full justify-start h-9 px-3 text-sm", // Slightly increased height for better spacing
          pathname === item.href
            ? "bg-violet-100 text-violet-900 font-semibold hover:bg-violet-200"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          isTopOrBottomLevel ? "font-medium" : ""
        )}
      >
        {item.name}
      </Button>
    </Link>
  );

  // Updated NavLinks component using Accordion and top/bottom links
  const NavLinks = () => (
    <div className="space-y-1">
      {/* Top Level Links */}
      {topLevelLinks.map(item => renderLink(item, true))}

      {/* Accordion Sections */}
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={activeAccordionItem}
        onValueChange={setActiveAccordionItem} // Allow user to change open section
      >
        {mainSections.map((section) => (
          <AccordionItem value={section.id} key={section.id} className="border-b-0">
            <AccordionTrigger className="py-2 px-3 hover:bg-violet-50 rounded-md text-sm font-medium text-gray-700 hover:no-underline hover:text-violet-900 [&[data-state=open]]:text-violet-900 [&[data-state=open]]:bg-violet-100">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0 pl-3"> {/* Adjusted padding */}
              <div className="space-y-1">
                {section.links.map(item => renderLink(item))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Bottom Level Links */}
      {bottomLevelLinks.map(item => renderLink(item, true))}
    </div>
  )

  // ... (NavHeader remains the same) ...
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
              className="fixed top-4 left-4 z-40 bg-white/80 backdrop-blur-sm" // Added background for better visibility
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