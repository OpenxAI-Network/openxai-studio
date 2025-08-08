import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator'
const Skeleton_deployment = () => {
    return (
        <div className="space-y-6 mt-12">

            <div className="mb-4 flex items-center space-x-2">
                <Skeleton className="h-5 w-28" />
                <ChevronRight size={20} className="text-[#9B9B9B]" />
                <Skeleton className="h-5 w-40" />
            </div>

            <div className="rounded border p-6">
                <div className="mb-10 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-14 rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-72" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-44" />
                </div>

                <div className="space-y-6">

                    <div className="rounded-lg border border-[#EBEBEB] shadow-sm">
                        <div className="flex items-center justify-between p-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="size-5 rounded-full" />
                        </div>
                        <div className="p-4">
                            <div className="mb-4 rounded-md border bg-muted/30 p-4">
                                <Skeleton className="h-4 w-80" />
                            </div>
                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                                <div className="space-y-6">
                                    <Skeleton className="h-10 w-full rounded-[12px]" />
                                    <div className="space-y-4 px-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div className="space-y-2" key={i}>
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-4 w-40" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                                <Separator />
                                            </div>
                                        ))}
                                    </div>
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                                <div className="space-y-6">
                                    <Skeleton className="h-10 w-full rounded-[12px]" />
                                    <div className="space-y-4 px-2">
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-4 w-56" />
                                            <Skeleton className="h-9 w-40" />
                                        </div>
                                        <Separator />
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div className="flex justify-between" key={i}>
                                                <Skeleton className="h-4 w-40" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        ))}
                                        <Separator />
                                        <Skeleton className="h-10 w-full rounded-md" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="rounded-lg border border-[#EBEBEB] shadow-sm">
                        <div className="flex items-center justify-between p-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="size-5 rounded-full" />
                        </div>
                        <div className="px-4 pb-4">
                            <Skeleton className="mb-6 h-4 w-96" />
                            <Skeleton className="mb-4 h-10 w-2/5" />
                            <Skeleton className="h-10 w-2/5" />
                        </div>
                    </div>
                </div>
            </div>


            <div className="rounded border p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="mt-2 h-4 w-48" />
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-14 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center gap-2 rounded-2xl border-[1.2px] border-[#E0E0E0] p-4"
                        >
                            <div className="text-center">
                                <Skeleton className="mx-auto mb-2 h-5 w-20" />
                                <Skeleton className="mx-auto h-4 w-32" />
                            </div>
                            <Skeleton className="size-32 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>


            <div className="rounded border p-6">
                <div className="flex items-center justify-between py-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <div className="grid grid-cols-1 gap-8 py-4 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border p-6">
                            <div className="flex justify-between">
                                <div className="flex gap-4">
                                    <Skeleton className="size-12 rounded-md" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="size-6 rounded" />
                            </div>
                            <div className="flex justify-between gap-4 py-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-8 w-full rounded-md" />
                                ))}
                            </div>
                            <Skeleton className="mt-6 h-10 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Skeleton_deployment;