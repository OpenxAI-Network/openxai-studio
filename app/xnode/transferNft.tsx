'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';


interface TransferNFTProps {
    onTransfer?: (recipientAddress: string) => void;
    currentWalletAddress?: string;
}


function isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export default function TransferNFT({ onTransfer, currentWalletAddress }: TransferNFTProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [recipientAddress, setRecipientAddress] = useState('');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);
    const handleTransferClick = () => {

        if (!recipientAddress.trim()) {
            setErrorMessage("Please enter a recipient address.");
            return;
        }


        if (!isValidEthereumAddress(recipientAddress)) {
            setErrorMessage("Invalid address");
            return;
        }


        if (currentWalletAddress && recipientAddress.toLowerCase() === currentWalletAddress.toLowerCase()) {
            setErrorMessage("You cannot transfer to your own wallet.");
            return;
        }


        setShowConfirmModal(true);
    };


    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRecipientAddress(value);


        if (!value.trim()) {
            setErrorMessage('');
            return;
        }


        if (currentWalletAddress && value.toLowerCase() === currentWalletAddress.toLowerCase()) {
            setErrorMessage("You cannot transfer to your own wallet.");
            return;
        }


        if (!isValidEthereumAddress(value)) {
            setErrorMessage("Invalid address");
            return;
        }


        setErrorMessage('');
    };

    const confirmTransfer = () => {
        onTransfer?.(recipientAddress);
        setShowConfirmModal(false);
        setRecipientAddress('');
        setIsExpanded(false);
    };

    return (
        <div className="relative rounded-lg border border-[#EBEBEB] shadow-sm">
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-xl font-semibold text-[#000000]">Transfer NFT</h2>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-[#959595]" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-[#959595]" />
                )}
            </div>

            <div
                style={{ maxHeight: isExpanded ? `1000px` : '0px' }}
                className="overflow-hidden transition-all duration-500 ease-in-out"
            >
                <div ref={contentRef} className="px-4 pb-4">
                    <p className="text-sm text-[#525252] mb-6 mt-4">
                        Transferring ERC721 NFT will transfer the ownership and billing responsibility to the recipient.
                    </p>

                    <div className="mb-8 w-[40%]">
                        <input
                            type="text"
                            placeholder="Recipient Wallet Address"
                            value={recipientAddress}
                            onChange={handleAddressChange}
                            className={`w-full px-3 py-2 border rounded-md ${errorMessage ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errorMessage && (
                            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                        )}
                    </div>

                    <button
                        onClick={handleTransferClick}
                        disabled={!recipientAddress.trim()}
                        className={`w-[40%] text-white py-2 px-4 rounded-md mb-4 transition-colors font-medium ${!recipientAddress.trim()
                            ? 'bg-[#99BDFF] cursor-not-allowed'
                            : 'bg-[#0059FF] hover:bg-blue-700'
                            }`}
                    >
                        Transfer
                    </button>
                </div>
            </div>
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="relative bg-white rounded-[24px] shadow-lg w-1/2 py-6">


                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-medium"
                            aria-label="Close"
                        >
                            &times;
                        </button>

                        <h3 className="text-lg font-medium mb-4 text-[#141414] pl-6">Confirm Transfer</h3>
                        <hr className='' />
                        <div className='px-6'>
                            <p className="text-[16px] text-[#141414] mb-4 text-center leading-6 p-6">
                                Are you sure you want to transfer all your ownership and billing responsibility to the wallet address:
                                <span className="mx-2 font-mono border border-[#D6E4FF] bg-[#EBF2FF] px-2 py-1 rounded-md text-[#525252]">
                                    {recipientAddress}
                                </span>
                                ?
                            </p>

                            <div className="bg-[#FBEFEF] border border-[#F6DFDF] text-[#C73A3A] px-4 py-3  rounded-[12px] mb-4 text-sm">
                                <strong>Disclaimer:</strong> This action is irreversible. Transferring this NFT will permanently transfer
                                ownership and all associated billing responsibility for this server. Ensure the recipient wallet address is
                                correct.
                            </div>

                            <div className="flex gap-4 w-full mt-8">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="w-full border border-[#4787FF] text-[#0059FF] px-4 py-2 rounded-[12px] hover:bg-blue-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmTransfer}
                                    className="w-full bg-[#0059FF] text-white px-4 py-2 rounded-[12px] hover:bg-blue-700"
                                >
                                    Transfer
                                </button>
                            </div>
                        </div>


                    </div>
                </div>
            )}

        </div>
    );
}
