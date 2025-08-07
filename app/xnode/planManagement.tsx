'use client';

import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import PlanDetails from './planDetails';
import TransferNFT from './transferNft';
import planData from '../../utils/plan-data.json';
import { type Xnode } from '@/types/node';

interface PlanManagementProps {
  xnode: Xnode;
}

const formatStorage = (bytes: number): string => {
  if (bytes >= 1024 ** 4) return `${(bytes / 1024 ** 4).toFixed(1)}PB`;
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(0)}TB`;
  return `${(bytes / 1024 ** 2).toFixed(0)}GB`;
};

export default function PlanManagement({ xnode }: PlanManagementProps) {
  const { name, cores, ram = 0, storage = 0, gpu = 0 } = xnode;

  const formattedSpecs = useMemo(() => {
    const ramGB = Math.round(ram / 1024 ** 3);
    const storageStr = formatStorage(storage);
    return `${cores} cores, ${ramGB}GB RAM, ${storageStr} Storage, ${gpu} GPU`;
  }, [cores, ram, storage, gpu]);

  const handleTransfer = useCallback((recipientAddress: string) => {
    
    console.log('Transfer NFT to:', recipientAddress);
  }, []);

  return (
    <div className="">
     
      <div className="mb-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/images/viewDeployment/xnode.svg"
            alt="XNode"
            width={56}
            height={56}
          />

          <div>
            <div className="flex items-center gap-1">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-[#000000]">
                {name}
                <Image
                  src="/images/viewDeployment/ollama.svg"
                  alt="Ollama"
                  width={24}
                  height={24}
                />
              </h2>
            </div>
            <p className="text-sm text-[#8F8F8F]">{formattedSpecs}</p>
          </div>
        </div>

        <button
          className="flex cursor-not-allowed items-center rounded-md bg-blue500 px-4 py-2 text-sm font-[500] text-white opacity-50"
          disabled
        >
          Push to Marketplace
          <ArrowUpRight className="ml-2" />
        </button>
      </div>

      
      <div className="space-y-6">
        <PlanDetails planData={planData.planDetails} />
        <TransferNFT
          onTransfer={handleTransfer}
          currentWalletAddress={planData.planDetails.currentWalletAddress}
        />
      </div>
    </div>
  );
}
