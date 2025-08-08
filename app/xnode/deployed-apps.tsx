import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Xnode } from '@/types/node'
export interface ServiceSpec {
  ram?: number;
  storage?: number;
}

export interface ServiceOption {
  [key: string]: any;
}

export interface Service {
  desc?: string;
  implemented?: boolean;
  logo?: string;
  longDesc?: string;
  name?: string;
  nixName?: string;
  options?: ServiceOption[];
  specs?: ServiceSpec;
  support?: string;
  tags?: string[];
  useCases?: string;
  app_logo?: string;
  version_logo?: string;
  version?: string;
  website?: string;
}

interface DeployedAppsProps {
  services: Service[];
  setDeleteServiceOpen?: (nixName?: string) => void;
  xNode: Xnode
}

const InfoItem = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <div className="flex items-center gap-1">
    <div className="size-5 shrink-0 text-gray-400">
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-400 max-[1550px]:text-[10px] max-[1350px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">{label}</div>
      <div className="text-sm  font-[500]  max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{value}</div>
    </div>
  </div>
);

const DeployedApps = ({ services, xNode, setDeleteServiceOpen }: DeployedAppsProps) => {
  const { push } = useRouter();

  {/* ---------------- Use this function for button integration ----------------- */ }

  // const handleAction =(action:string) =>{
  //   switch(action){
  //     case 'Process':
  //       console.log("Process")
  //       break;
  //     case 'File Explore':
  //       console.log("File Explore")
  //       break;
  //     case 'Edit':
  //       console.log("Edit")
  //       break;
  //     case 'Update':
  //       console.log("Update")
  //       break;
  //     default:
  //       console.warn('Unknown action:', action);
  //   }
  // } 

  return (
    <div>
      <div className="flex items-center justify-between pb-2 pt-8">
        <div className="text-sm font-bold text-[#141414] xl:text-base 2xl:text-xl 3xl:text-2xl">
          Apps ({services.length})
        </div>
        <button
          onClick={() => push('/app-store')}
          className="rounded-lg border-2 border-[#525252] px-8 py-2 font-medium text-[#525252]"
        >
          + Add App
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 py-4 lg:grid-cols-3">
        {services?.map((service) => {
          const servicePort = service.options
            ?.flatMap((o) => {
              const nestedOptions = [o]
              let index = 0
              while (nestedOptions[index].options?.length) {
                nestedOptions.push(...nestedOptions[index].options)
                index++
              }
              return nestedOptions
            })
            .find(
              (option) =>
                option.nixName === 'port' ||
                option.nixName === 'server-port' ||
                option.nixName === 'guiAddress'
            )
            ?.value?.split(':')
            .at(-1)
          const serviceEnabled =
            service.options?.find(
              (option) => option.nixName === 'enable'
            )?.value === 'true'
          const serviceFirewall =
            service.options?.find(
              (option) => option.nixName === 'openFirewall'
            )?.value === 'true'

          return (
            <div
              key={service.nixName}
              className="flex w-full max-w-sm flex-col gap-4 rounded-xl border p-6"
            >
              <div className="flex justify-between">
                <div className="flex gap-4">
                  {service.app_logo && (
                    <Image
                      src={service.app_logo}
                      alt="logo"
                      width={50}
                      height={50}
                      className="rounded-md border"
                    />
                  )}
                  <div className="flex flex-col gap-1">
                    <div className='text-[12px] font-[600] text-[#141414] xl:text-[16px] 2xl:text-[16px] 3xl:text-[24px]'>
                      {service.name ?? service.nixName}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#525252]">
                      {service?.version_logo && (
                        <Image
                          src={service?.version_logo}
                          alt="version"
                          width={20}
                          height={20}
                        />
                      )}
                      <span className='text-[12px] font-[500] text-[#525252] xl:text-[14px] 2xl:text-[14px] 3xl:text-[20px]'>{service.version}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="iconSm"
                  className="border-none bg-transparent text-red-500 hover:bg-transparent"
                  onClick={() => setDeleteServiceOpen?.(service.nixName)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>

              <div className="flex justify-between gap-4 py-2">
                <InfoItem
                  label="RAM"
                  value={`${(service.specs?.ram ?? 10) / 1000} GB`}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>}
                />
                <InfoItem
                  label="Storage"
                  value={`${(service.specs?.storage ?? 10) / 1000} SSD`}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5z"></path><path d="M8 10h8"></path><path d="M8 14h8"></path><path d="M8 18h8"></path></svg>}
                />
                <InfoItem
                  label="CPU"
                  value={`${service.options?.[0]?.cpu ?? 2} cores`}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="2" x2="9" y2="4"></line><line x1="15" y1="2" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="22"></line><line x1="15" y1="20" x2="15" y2="22"></line><line x1="20" y1="9" x2="22" y2="9"></line><line x1="20" y1="14" x2="22" y2="14"></line><line x1="2" y1="9" x2="4" y2="9"></line><line x1="2" y1="14" x2="4" y2="14"></line></svg>}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['Process', 'File Explore', 'Edit', 'Update'].map((action) => (
                  <div
                    key={action}
                    className='flex cursor-pointer items-center justify-center rounded-md border border-[#525252] px-10 py-2 text-[10px] font-[500] text-[#525252] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px]'
                  //onClick={()=>{handleAction(action)}}
                  >
                    {action}
                  </div>
                ))}
              </div>

              <Link
                href={`http://${xNode.ipAddress}:${servicePort}`}
                aria-disabled={
                  !servicePort || !serviceEnabled || !serviceFirewall
                }
                target="_blank"
                rel="noreferrer noopener"

                className="mt-6 flex items-center justify-center gap-3 rounded-md bg-blue-500 py-2 text-sm font-medium text-white aria-disabled:pointer-events-none aria-disabled:opacity-50">
                Open {service.name ?? service.nixName}
                <Image src='/images/arrow-up-right.svg' alt="" width={20} height={20} />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default DeployedApps;
