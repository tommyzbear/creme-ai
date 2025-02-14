export default function GradientBackground() {
    return (
        <div className="fixed inset-0 overflow-visible">
            <div
                className={`absolute h-[110vh] w-[110vh] rounded-full bg-radial 
                    from-rose-600 via-rose-400 to-transparent animate-roam
                    opacity-100 blur-[5rem]`}
                style={{ animation: "roam 60s infinite" }}
            />
            <div
                className={`absolute h-[60vh] w-[60vh] rounded-full bg-radial 
                    from-orange-600 via-orange-400 to-transparent animate-roam-fast
                    opacity-100 blur-[2rem]`}
                style={{ animation: "roam 40s infinite reverse" }}
            />
        </div>
    );
}
