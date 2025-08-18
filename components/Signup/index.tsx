import type { xnode } from '@openmesh-network/xnode-manager-sdk'
import Loading from 'components/Loading'
import { useAccount, useSignMessage } from 'wagmi'

import { toXnodeAddress } from '@/lib/xnode'

export const Signup = ({
  xnode,
  onSigned,
}: {
  xnode: string
  onSigned: (signature: xnode.auth.login_input) => void
}) => {
  const { address, isConnected, isConnecting } = useAccount()
  const { signMessageAsync } = useSignMessage()

  return (
    <>
      <div className="mt-40 flex place-items-center justify-center gap-5">
        {isConnecting && <Loading />}
        <div className="w-full">
          <div className="mx-auto flex w-fit flex-col place-items-center gap-3">
            <span className="text-2xl font-semibold">Final Step</span>
            <span className="text-lg">
              Log into your Tokenized GPU to unlock monitoring and management.
            </span>
            <span className="text-lg">
              The session is safely stored in your browser.
            </span>
            <w3m-button />
            {isConnected && (
              <div>
                {
                  <button
                    className="cursor-pointer items-center rounded-[5px] border border-blue-500 bg-blue-500 px-[25px] py-[8px] text-[13px] font-bold !leading-[19px] text-white hover:bg-[#064DD2] lg:text-[16px]"
                    onClick={() => {
                      const messageTimestamp = Math.round(Date.now() / 1000)
                      signMessageAsync({
                        account: address,
                        message: `Xnode Auth authenticate ${xnode.replace('https://', '')} at ${messageTimestamp}`,
                      })
                        .then((signature) => {
                          onSigned({
                            baseUrl: xnode,
                            user: toXnodeAddress({ address }),
                            signature,
                            timestamp: messageTimestamp.toString(),
                          })
                        })
                        .catch(console.error)
                    }}
                  >
                    Sign Authentication Message
                  </button>
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
