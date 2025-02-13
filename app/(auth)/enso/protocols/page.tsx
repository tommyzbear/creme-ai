"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Chain {
    id: number;
    name: string;
}

interface Protocol {
    slug: string;
    url: string;
    logosUri: string[];
    description: string;
    name: string;
    chains: Chain[];
}

const ProtocolSkeleton = () => (
    <Card className="overflow-hidden">
        <CardHeader className="space-y-4">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
            </div>
        </CardContent>
    </Card>
);

export default function ProtocolsPage() {
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProtocols = async () => {
            try {
                const response = await fetch("/api/enso/protocols");
                if (!response.ok) throw new Error("Failed to fetch protocols");
                const data = await response.json();
                setProtocols(data);
            } catch (error) {
                console.error("Error fetching protocols:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProtocols();
    }, []);

    const filteredProtocols = protocols.filter(protocol =>
        (protocol.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (protocol.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container py-8 max-w-7xl">
            <div className="flex flex-col space-y-8">
                <div className="flex flex-col space-y-4">
                    <h1 className="text-4xl font-bold">All Available DeFi Protocols</h1>
                    <p className="text-muted-foreground">
                        Explore and interact with various DeFi protocols across multiple chains
                    </p>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search protocols..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => <ProtocolSkeleton key={i} />)
                        : filteredProtocols.map((protocol) => (
                            <Card key={protocol.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                            <Image
                                                src={protocol.logosUri.length > 0 ? protocol.logosUri[0] : "/creme-ai.png"}
                                                alt={protocol.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{protocol.name}</span>
                                                <Link
                                                    href={protocol.url}
                                                    target="_blank"
                                                    className="text-muted-foreground hover:text-primary"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </CardTitle>
                                            <CardDescription>{protocol.description || "No description available"}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {protocol.chains.map((chain) => (
                                            <Badge
                                                key={`${protocol.slug}-${chain.id}`}
                                                variant="secondary"
                                                className="capitalize"
                                            >
                                                {chain.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    );
} 