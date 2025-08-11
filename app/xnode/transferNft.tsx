'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TransferNFTProps {
  onTransfer?: (recipientAddress: string) => void;
  currentWalletAddress?: string;
}

const isValidEthereumAddress = (address: string): boolean =>
  /^0x[a-fA-F0-9]{40}$/.test(address);

export default function TransferNFT({
  onTransfer,
  currentWalletAddress,
}: TransferNFTProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const validateRecipient = useCallback(
    (address: string): string => {
      if (!address.trim()) return 'Please enter a recipient address.';
      if (!isValidEthereumAddress(address)) return 'Invalid Wallet address.';
      if (
        currentWalletAddress &&
        address.toLowerCase() === currentWalletAddress.toLowerCase()
      )
        return 'You cannot transfer to your own wallet.';
      return '';
    },
    [currentWalletAddress]
  );

  const handleTransferClick = useCallback(() => {
    const error = validateRecipient(recipientAddress);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setShowConfirmModal(true);
  }, [recipientAddress, validateRecipient]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientAddress(value);
    setErrorMessage(validateRecipient(value));
  };

  const confirmTransfer = () => {
    onTransfer?.(recipientAddress);
    setShowConfirmModal(false);
    setRecipientAddress('');
    setIsExpanded(false);
  };

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div className="relative rounded-lg border border-[#EBEBEB] shadow-sm">

      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={toggleExpand}
      >
        <h2 className="text-xl font-semibold text-[#000000]">Transfer NFT</h2>
        {isExpanded ? (
          <ChevronUp className="size-5 text-[#959595]" />
        ) : (
          <ChevronDown className="size-5 text-[#959595]" />
        )}
      </div>

      <div
        style={{ maxHeight: isExpanded ? `1000px` : '0px' }}
        className="overflow-hidden transition-all duration-500 ease-in-out"
      >
        <div ref={contentRef} className="px-4 pb-4">
          <p className="mb-6 mt-4 text-sm text-[#525252]">
            Transferring ERC721 NFT will transfer the ownership and billing
            responsibility to the recipient.
          </p>

          <div className="mb-8 w-2/5">
            <input
              type="text"
              placeholder="Recipient Wallet Address"
              value={recipientAddress}
              onChange={handleAddressChange}
              className={`w-full rounded-md border px-3 py-2 ${
                errorMessage ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errorMessage && (
              <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
            )}
          </div>

          <button
            onClick={handleTransferClick}
            disabled={!recipientAddress.trim()}
            className={`mb-4 w-2/5 rounded-md px-4 py-2 font-medium text-white transition-colors ${
              !recipientAddress.trim()
                ? 'cursor-not-allowed bg-[#99BDFF]'
                : 'bg-blue500 hover:bg-blue-700'
            }`}
          >
            Transfer
          </button>
        </div>
      </div>

   
      {showConfirmModal && (
        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative w-1/2 rounded-[24px] bg-white py-6 shadow-lg">
           
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4 text-xl font-medium text-gray-500 hover:text-gray-800"
              aria-label="Close"
            >
              &times;
            </button>

            <h3 className="mb-4 pl-6 text-lg font-medium text-[#141414]">
              Confirm Transfer
            </h3>

            <hr />

            <div className="px-6">
              <p className="mb-4 p-6 text-center text-[16px] leading-6 text-[#141414]">
                Are you sure you want to transfer all your ownership and billing
                responsibility to the wallet address:
                <span className="mx-2 rounded-md border border-[#D6E4FF] bg-[#EBF2FF] px-2 py-1 font-mono text-[#525252]">
                  {recipientAddress}
                </span>
                ?
              </p>

              <div className="mb-4 rounded-[12px] border border-[#F6DFDF] bg-[#FBEFEF] px-4 py-3 text-sm text-[#C73A3A]">
                <strong>Disclaimer:</strong> This action is irreversible.
                Transferring this NFT will permanently transfer ownership and
                all associated billing responsibility for this server. Ensure
                the recipient wallet address is correct.
              </div>

              <div className="mt-8 flex w-full gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full rounded-[12px] border border-[#4787FF] px-4 py-2 text-blue500 hover:bg-blue-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTransfer}
                  className="w-full rounded-[12px] bg-blue500 px-4 py-2 text-white hover:bg-blue-700"
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
