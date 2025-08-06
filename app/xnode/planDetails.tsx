'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface PlanDetailsProps {
    planData: {
        serverPlan: string;
        startingDate: string;
        expiringDate: string;
        price: string;
        associatedApp: string;
        renewalCost: string;
        gasFee: string;
        totalCost?: string;
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
    const [renewalDays, setRenewalDays] = useState('');
    const [totalCost, setTotalCost] = useState("0.00");
    const [calculatedRenewalCost, setCalculatedRenewalCost] = useState("0.00");


    useEffect(() => {
        const perDayCost = parseFloat(planData.renewalCost) || 0;
        const gasFee = parseFloat(planData.gasFee) || 0;
        const days = parseInt(renewalDays) || 0;

        if (days > 0) {
            const cost = days * perDayCost;
            setCalculatedRenewalCost(cost.toFixed(2));
            setTotalCost((cost + gasFee).toFixed(2));
        } else {
            setCalculatedRenewalCost('0.00');
            setTotalCost('0.00');
        }
    }, [renewalDays, planData.renewalCost, planData.gasFee]);




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
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-xl font-semibold text-[#000000]">Plan Details</h2>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-[#959595]" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-[#959595]" />
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
                        <div className="bg-[#F6DFDF] text-[#C73A3A] px-4 py-3 border-[#F6DFDF] border border-solid rounded-md mb-4">
                            <p className="text-sm font-semibold">
                                Your plan expires in {daysUntilExpiration} days. <br />
                                <span className="font-normal">Renew now to prevent permanent data loss!</span>
                            </p>
                        </div>
                    )}


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h3 className=" font-mediun text-[#141414] text-[16px] bg-[#F5F5F5] py-4 pl-4 border border-[#F0F0F0] rounded-[12px]">
                                Current Plan
                            </h3>
                            <div className="space-y-6 px-4">
                                <div className="flex justify-between">
                                    <span className="text-[#525252] font-[400] ">Server Plan:</span>
                                    <span className="font-medium text-[#3D3D3D]">{planData.serverPlan}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <span className="text-[#525252] font-[400]">Starting Date:</span>
                                    <span className="font-medium text-[#3D3D3D]">{planData.startingDate}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <span className="text-[#525252] font-[400]">Expiring Date:</span>
                                    <span className="font-medium text-[#3D3D3D]">
                                        {planData.expiringDate}

                                    </span>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <span className="text-[#525252] font-[400]">Price:</span>
                                    <span className="font-medium flex items-center">
                                        {planData.price}
                                        <div className="ml-1 w-4 h-4 flex items-center justify-center">
                                            <img src="/images/viewDeployment/ollama.svg" alt="" />
                                        </div>
                                    </span>
                                </div>
                                <hr />
                                <div className="flex justify-between">
                                    <span className="text-[#525252] font-[400]">Associated App:</span>
                                    <span className="font-medium">{planData.associatedApp}</span>
                                </div>
                            </div>

                            <div
                                className={`px-4 py-3 border rounded-md ${timeRemaining.days > 30
                                    ? 'bg-[#DFF6DF] text-[#0F7B0F] border-[#DFF6DF]'
                                    : 'bg-[#F6DFDF] text-[#C73A3A] border-[#F6DFDF]'
                                    }`}
                            >
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>Time Remaining</span>
                                    <span>
                                        {timeRemaining.days} days, {timeRemaining.hours} hours, {timeRemaining.minutes} minutes,{' '}
                                        {timeRemaining.seconds} seconds
                                    </span>
                                </div>
                            </div>

                        </div>

                        <div className="space-y-8">
                            <h3 className="font-medium text-[#141414] text-[16px] bg-[#F5F5F5] py-4 pl-4 border border-[#F0F0F0] rounded-[12px]">
                                Manage your Plan
                            </h3>

                            <div className="space-y-8 px-4">

                                <div className="flex items-center justify-between w-full">
                                    <label className="text-sm font-medium text-[#525252]">Renewal Time Period</label>
                                    <input
                                        type="number"
                                        placeholder="Number of days of renewal"
                                        value={renewalDays}
                                        onChange={(e) => setRenewalDays(e.target.value)}
                                        className="w-[50%] px-3 py-2 border border-gray-300 rounded-md"
                                        min={1}
                                    />

                                </div>

                                <hr />

                                <div className="flex justify-between">
                                    <span className="text-[#525252] font-[400]">Renewal Cost:</span>
                                    <span className="font-medium flex items-center">
                                        {calculatedRenewalCost}{' '}
                                        <span className="text-[#525252] font-semibold ml-1">OPENX</span>
                                        <div className="ml-1 w-4 h-4 flex items-center justify-center">
                                            <img src="/images/viewDeployment/ollama.svg" alt="" />
                                        </div>
                                    </span>
                                </div>

                                <hr />


                                <div className="flex justify-between">
                                    <span className="text-[#525252] font-[400]">Gas fee:</span>
                                    <span className="font-medium">{planData.gasFee}</span>
                                </div>

                                <hr className="text-[#CCCCCC] h-4" />

                                <div className="flex justify-between">
                                    <span className="text-[#525252] font-[400]">Total Cost:</span>
                                    <span className="font-medium flex items-center">
                                        <span className="text-[#0040B8] text-lg font-bold">
                                            {parseFloat(totalCost) === 0 ? '0.00' : totalCost}
                                            <span className="font-semibold"> OPENX /mo</span>
                                        </span>
                                        <div className="ml-1 w-4 h-4 flex items-center justify-center">
                                            <img src="/images/viewDeployment/ollama.svg" alt="" />
                                        </div>
                                    </span>
                                </div>




                                <button
                                    onClick={() => {
                                        if (parseInt(renewalDays) > 0) {

                                            setRenewalDays('');
                                        }
                                    }}
                                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${parseInt(renewalDays) > 0
                                        ? 'bg-[#0059FF] text-white hover:bg-blue-400 cursor-pointer'
                                        : 'bg-[#99BDFF] text-white cursor-not-allowed'
                                        }`}
                                    disabled={!renewalDays || parseInt(renewalDays) <= 0}
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