import { Card } from "@/components/ui/card";

export function AppStatus() {
    return (
        <div className="flex flex-row gap-1">
            <Card className="px-2 py-0 bg-background/40 overflow-hidden">
                <div className="flex items-center gap-2 select-none">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="inline-block text-sm font-normal">online</h3>
                </div>
                <div className="!h-4 bottom-fade z-[-5]" />
            </Card>
            <Card className="px-2 py-0 flex-1 bg-background/40 overflow-hidden">
                <div className="flex items-center gap-2 justify-center">
                    <h3 className="inline-block text-sm font-normal select-none">
                        crème'ai v0.0.1
                    </h3>
                </div>
                <div className="!h-4 bottom-fade z-[-5]" />
            </Card>
        </div>
    );
}
