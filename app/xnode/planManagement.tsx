'use client';

import { useState } from 'react';
import PlanDetails from './planDetails';
import TransferNFT from './transferNft';
import planData from '../../utils/plan-data.json';
import { type Xnode } from '@/types/node'
import { ArrowUpRight } from 'lucide-react';
interface PlanManagementProps {
    xnode: Xnode;
}
export default function PlanManagement({ xnode }: PlanManagementProps) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleTransfer = (recipientAddress: string) => {

        setShowSuccessMessage(true);

        setTimeout(() => {
            setShowSuccessMessage(false);
        }, 3000);
    };

    return (
        <div className="">
            <div className="mx-auto ">
                <div className="flex justify-between items-start">

                    <div className="flex items-center gap-3 mb-10">

                        <img src="/images/viewDeployment/xnode.svg" alt="XNode" className="w-14 h-14" />


                        <div>
                            <div className="flex items-center gap-1">
                                <h2 className="text-xl font-semibold flex items-center gap-2 text-[#000000]">
                                    {xnode.name}

                                    <img src="/images/viewDeployment/ollama.svg" alt="" />
                                </h2>
                            </div>
                            <p className="text-sm text-[#8F8F8F]">
                                {xnode?.cores} cores,{' '}
                                {xnode?.ram ? Math.round(xnode.ram / 1024 ** 3) : 0}GB RAM,{' '}
                                {xnode?.storage
                                    ? xnode.storage >= 1024 ** 4
                                        ? `${(xnode.storage / 1024 ** 4).toFixed(1)}PB`
                                        : xnode.storage >= 1024 ** 3
                                            ? `${(xnode.storage / 1024 ** 3).toFixed(0)}TB`
                                            : `${(xnode.storage / 1024 ** 2).toFixed(0)}GB`
                                    : '0GB'}{' '}
                                Storage, {xnode?.gpu} GPU
                            </p>
                        </div>
                    </div>
                    <button
                        className="flex items-center bg-[#0059FF] text-white px-4 py-2 rounded-md text-sm font-[500] opacity-50 cursor-not-allowed"
                        disabled
                    >
                        Push to Marketplace
                        <ArrowUpRight className="ml-2" />
                    </button>


                </div>



                <div className="space-y-6">

                    <PlanDetails planData={planData.planDetails} />


                    <TransferNFT onTransfer={handleTransfer} />
                </div>
            </div>
        </div>
    );
} 