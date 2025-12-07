const UserSkeleton = () => {
    return (
        <div className="flex items-center justify-between px-4 py-3 animate-pulse">
            <div className="flex items-center gap-3 flex-1">
                {/* Avatar skeleton */}
                <div className="w-12 h-12 rounded-full bg-muted" />

                {/* Text skeletons */}
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-32" />
                </div>
            </div>

            {/* Button skeleton */}
            <div className="h-8 w-20 bg-muted rounded-lg" />
        </div>
    );
};

export default UserSkeleton;
