"use client"

import { Card } from "@/components/ui/card"
import { usePrivy } from "@privy-io/react-auth"
import { redirect } from "next/navigation"

export default function HomePage() {
  const { ready, authenticated } = usePrivy()

  if (ready && !authenticated) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - 1 column */}
        <div className="col-span-1 space-y-6">
          <div className="grid grid-rows-9 gap-4 h-[calc(100vh-6rem)]">
            <Card className="w-full row-span-1 bg-zinc-900" />
            <Card className="w-full row-span-4 bg-zinc-900" />
            <Card className="w-full row-span-4 bg-zinc-900" />
          </div>
        </div>

        {/* Account Balances - 3 columns */}
        <div className="col-span-3 space-y-6">
          <div className="grid grid-rows-9 gap-6 h-[calc(100vh-6rem)]">
            <Card className="w-full row-span-1 bg-zinc-100">
              <div className="p-6">
                <h3 className="text-sm text-muted-foreground">Profile</h3>
              </div>
            </Card>
            <Card className="w-full row-span-4 bg-zinc-100">
              <div className="p-6">
                <h3 className="text-sm text-muted-foreground">Balance</h3>
              </div>
            </Card>
            <Card className="w-full row-span-4 bg-zinc-100">
              <div className="p-6">
                <h3 className="text-sm text-muted-foreground">Recently</h3>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content 1 - 4 columns */}
        <div className="col-span-4 h-[calc(100vh-6rem)]">
          {/* Top section */}
          {/* Main card */}
          <Card className="w-full h-full bg-zinc-100">
            <div className="p-6">
              <h3 className="text-sm text-muted-foreground">Market</h3>
            </div>
          </Card>
        </div>

        {/* Main Content 2 - 4 columns */}
        <div className="col-span-4 h-[calc(100vh-6rem)]">
          <Card className="w-full h-full bg-zinc-100">
            <div className="p-6">
              <h3 className="text-sm text-muted-foreground">Chatbot</h3>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
