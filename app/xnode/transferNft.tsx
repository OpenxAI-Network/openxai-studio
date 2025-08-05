'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TransferNFTProps {
    onTransfer?: (recipientAddress: string) => void;
}

export default function TransferNFT({ onTransfer }: TransferNFTProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [recipientAddress, setRecipientAddress] = useState('');

    const handleTransfer = () => {
        if (recipientAddress.trim()) {
            onTransfer?.(recipientAddress);
            setRecipientAddress('');
        }
    };

    return (
        <div className=" rounded-lg border border-[#EBEBEB] shadow-sm">

            <div
                className="flex items-center justify-between p-4 cursor-pointer "
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-xl font-semibold text-[#000000] ">Transfer NFT</h2>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-[#959595]" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-[#959595]" />
                )}
            </div>


            {isExpanded && (
                <div className="px-4 pb-4">

                    <p className="text-sm text-[#525252] mb-6 mt-4">
                        Transferring ERC721 NFT will transfer the ownership and billing responsibility to the recipient.
                    </p>

                    <div className="mb-8  w-1/2">
                        <input
                            type="text"
                            placeholder="Recipient Wallet Address"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>


                    <button
                        onClick={handleTransfer}
                        disabled={!recipientAddress.trim()}
                        className=" bg-[#99BDFF]  w-1/2 text-white py-2 px-4 rounded-md hover:bg-blue-400 transition-colors font-medium "
                    >
                        Transfer
                    </button>
                </div>
            )}
        </div>
    );
} 