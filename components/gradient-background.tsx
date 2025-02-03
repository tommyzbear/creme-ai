export default function GradientBackground() {
    return (
        <div className="fixed inset-0">
            <div
                className={`absolute h-[50vw] w-[50vw] rounded-full bg-radial 
                    from-rose-600 via-rose-400 to-transparent animate-float
                    opacity-100 blur-[7rem]`}
            />
            <div
                className={`absolute h-[30vw] w-[30vw] rounded-full bg-radial 
                    from-orange-600 via-orange-400 to-transparent animate-float-fast
                    opacity-100 blur-[5rem]`}
            />
        </div>
    );
}
