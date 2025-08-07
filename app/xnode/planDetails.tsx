'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface PlanDetailsProps {
    planData: {
        serverPlan: string;
        startingDate: string;
        expiringDate: string;
        price: string;
        currentPrice: string;
        associatedApp: string;
        renewalCost: string;
        gasFee: string;
        totalCost?: string;
        gasPercentage?: number;
    };
}

export default function PlanDetails({ planData }: PlanDetailsProps) {
   const [isExpanded, setIsExpanded] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [contentHeight, setContentHeight] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const [renewalMonths, setRenewalMonths] = useState('');

    const pricePerMonth = parseFloat(planData.price) || 0;
    const gasPercentage = planData.gasPercentage || 0.2;
    const months = parseInt(renewalMonths) || 0;

    const calculatedRenewalCost = (months > 0 ? months * pricePerMonth : 0).toFixed(2);
    const calculatedGasFee = (months > 0 ? parseFloat(calculatedRenewalCost) * gasPercentage : 0).toFixed(2);
    const totalCost = (parseFloat(calculatedRenewalCost) + parseFloat(calculatedGasFee)).toFixed(2);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [isExpanded]);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date();
            const expirationDate = new Date(planData.expiringDate);
            const difference = expirationDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeRemaining({ days, hours, minutes, seconds });
            } else {
                setTimeRemaining({ days: 20, hours: 12, minutes: 37, seconds: 40 });
            }
        };

        calculateTimeRemaining();
        const timer = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(timer);
    }, [planData.expiringDate]);

    const daysUntilExpiration = timeRemaining.days;

    return (
        <div className="rounded-lg border border-[#EBEBEB] shadow-sm">
            <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-sm font-semibold text-[#000000] md:text-xl">Plan Details</h2>
                {isExpanded ? (
                    <ChevronUp className="size-5 text-[#959595]" />
                ) : (
                    <ChevronDown className="size-5 text-[#959595]" />
                )}
            </div>

            <div
                style={{
                    maxHeight: isExpanded ? `${contentHeight}px` : '0px',
                }}
                className="overflow-hidden transition-all duration-500 ease-in-out"
            >
                <div ref={contentRef} className="px-4 pb-4">
                    {daysUntilExpiration < 30 && (
                        <div className="mb-4 rounded-md border border-solid border-[#F6DFDF] bg-[#F6DFDF] px-4 py-3 text-[#C73A3A]">
                            <p className="text-sm font-semibold">
                                Your plan expires in {daysUntilExpiration} days. <br />
                                <span className="font-normal">Renew now to prevent permanent data loss!</span>
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        <div className="space-y-8">
                            <h3 className=" rounded-[12px] border border-[#F0F0F0] bg-[#F5F5F5]  py-4 pl-4 text-[14px] font-medium text-[#141414] md:text-[18px]">
                                Current Plan
                            </h3>
                            <div className="space-y-6 px-4">
                                <div className="flex justify-between">
                                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">Server Plan:</span>
                                    <span className="text-[12px] font-medium text-[#3D3D3D] md:text-sm">{planData.serverPlan}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">Starting Date:</span>
                                    <span className="text-[12px] font-medium text-[#3D3D3D] md:text-sm">{planData.startingDate}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">Expiring Date:</span>
                                    <span className="text-[12px] font-medium text-[#3D3D3D] md:text-sm">
                                        {planData.expiringDate}
                                    </span>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">Price:</span>
                                    <span className="flex items-center text-[12px] font-medium md:text-sm">
                                        {planData.currentPrice}
                                        <div className="ml-1 flex size-4 items-center justify-center">
                                            <img src="/images/viewDeployment/ollama.svg" alt="" />
                                        </div>
                                    </span>
                                </div>
                                <hr />
                                <div className="flex justify-between ">
                                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">Associated App:</span>
                                    <span className="text-[12px] font-medium md:text-sm">{planData.associatedApp}</span>
                                </div>
                            </div>

                            <div
                                className={`rounded-md border px-4 py-3 ${timeRemaining.days > 30
                                    ? 'border-[#DFF6DF] bg-[#DFF6DF] text-[#0F7B0F]'
                                    : 'border-[#F6DFDF] bg-[#F6DFDF] text-[#C73A3A]'
                                    }`}
                            >
                                <div className="flex justify-between text-[12px] font-semibold md:text-sm">
                                    <span>Time Remaining</span>
                                    <span>
                                        {timeRemaining.days} days, {timeRemaining.hours} hours, {timeRemaining.minutes} minutes,{' '}
                                        {timeRemaining.seconds} seconds
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="rounded-[12px] border  border-[#F0F0F0] bg-[#F5F5F5]  py-4 pl-4 text-[14px] font-medium text-[#141414] md:text-[18px]">
                                Manage your Plan
                            </h3>

                            <div className="space-y-8 px-4">
                                <div className="flex w-full items-center justify-between">
                                    <label className=" text-[12px] font-medium text-[#525252] md:text-sm">Renewal Time Period (Months)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter in Months"
                                        value={renewalMonths}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (value.length <= 2) {
                                                setRenewalMonths(value);
                                            }
                                        }}
                                        // eslint-disable-next-line tailwindcss/no-unnecessary-arbitrary-value
                                        className="w-[50%] rounded-md border border-gray-300 px-3 py-2"
                                        min={1}
                                        max={99}
                                    />
                                </div>

                                <hr />

                                <div className="flex justify-between">
                                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">Renewal Cost:</span>
                                    <span className="flex items-center text-[12px] font-medium md:text-sm">
                                        {calculatedRenewalCost}{' '}
                                        <span className="ml-1 text-[12px] font-semibold text-[#525252] md:text-sm">OPENX</span>
                                        <div className="ml-1 flex size-4 items-center justify-center">
                                            <img src="/images/viewDeployment/ollama.svg" alt="" />
                                        </div>
                                    </span>
                                </div>

                                <hr />

                                <div className="flex justify-between">
                                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">Gas fee:</span>
                                    <span className="flex items-center text-[12px] font-medium md:text-sm">
                                        {calculatedGasFee}{' '}

                                    </span>
                                </div>

                                <hr className="h-0 text-[#CCCCCC]" />

                                <div className="flex justify-between">
                                    <span className="text-[12px] font-[400] text-[#525252] md:text-sm">Total Cost:</span>
                                    <span className="flex items-center font-medium">
                                        <span className="text-[12px]  font-bold text-[#0040B8] md:text-sm">
                                            {parseFloat(totalCost) === 0 ? '0.00' : totalCost}
                                            <span className="font-semibold"> OPENX /mo</span>
                                        </span>
                                        <div className="ml-1 flex size-4 items-center justify-center">
                                            <img src="/images/viewDeployment/ollama.svg" alt="" />
                                        </div>
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        if (parseInt(renewalMonths) > 0) {
                                            setRenewalMonths('');
                                        }
                                    }}
                                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${parseInt(renewalMonths) > 0
                                        ? 'bg-[#0059FF] text-white hover:bg-blue-400 cursor-pointer'
                                        : 'bg-[#99BDFF] text-white cursor-not-allowed'
                                        }`}
                                    disabled={!renewalMonths || parseInt(renewalMonths) <= 0}
                                >
                                    Renew
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 