import React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image';
import {
    
    Trash2,
  } from 'lucide-react'

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
    app_logo?:string;
    version_logo?:string;
    version?:string;
    website?: string;
  }

interface Deployed_Apps_Props {
services: Service[];
setDeleteServiceOpen?: (nixName?: string) => void;
}

const Deployed_Apps = ({services,setDeleteServiceOpen}:Deployed_Apps_Props) => {
    
  return (
    <div>
        <div className='pb-2 pt-8 text-[12px] font-[700] text-[#141414] xl:text-[16px] 2xl:text-[20px] 3xl:text-[24px] '>Apps({services.length})</div>
        <div className='flex gap-8 py-4'>
            {services?.map((service,index)=>(
                <div className='flex flex-col gap-4 rounded-xl border-[1.2px] border-[#E0E0E0] p-6'>
                    <div className='flex justify-between'>
                        <div className='flex  gap-4'>
                            <Image src={service?.app_logo} alt='' width={50} height={50} className='rounded-md border 2xl:w-[50px] 3xl:w-[60px]'/>
                            <div className='flex flex-col gap-1 '>
                                <div className='text-[12px] font-[600] text-[#141414] xl:text-[16px] 2xl:text-[16px] 3xl:text-[24px]'>{service.name ?? service.nixName}</div>
                                <div className='flex items-center gap-2'>
                                    {service?.version_logo &&(
                                        <Image src={service?.version_logo} alt='' width={20} height={20}/>
                                    )}
                                    <span className='text-[#525252] text-[12px] xl:text-[14px] 2xl:text-[14px] 3xl:text-[20px] font-[500]'>{service?.version}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            size="iconSm"
                            className='!cursor-pointer border-none bg-transparent text-red-500 hover:bg-transparent'
                            onClick={() =>
                              setDeleteServiceOpen?.(service.nixName)
                             
                            }
                          >
                            <Trash2 className="size-4 !cursor-pointer" />
                            <span className="sr-only">Delete</span>
                          </Button>
                    </div>
                    <div className="flex justify-between gap-4 py-2 max-[1550px]:gap-3.5 max-[1350px]:gap-3 max-[1250px]:gap-2.5 max-[992px]:gap-2">
                  <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-1 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                    <div className="max-[1550px]:w-4.5 max-[1550px]:h-4.5 size-5 shrink-0 text-gray-400 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="80%" height="80%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                        <line x1="7" y1="2" x2="7" y2="22"></line>
                        <line x1="17" y1="2" x2="17" y2="22"></line>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <line x1="2" y1="7" x2="7" y2="7"></line>
                        <line x1="2" y1="17" x2="7" y2="17"></line>
                        <line x1="17" y1="17" x2="22" y2="17"></line>
                        <line x1="17" y1="7" x2="22" y2="7"></line>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 max-[1550px]:text-[10px] max-[1350px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">RAM</div>
                      <div className="text-sm font-[500] max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{service?.specs?.ram / 1000} GB</div>
                    </div>
                  </div>
                  
                  <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-1 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                    <div className="max-[1550px]:w-4.5 max-[1550px]:h-4.5 size-5 shrink-0 text-gray-400 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="90%" height="90%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5z"></path>
                        <path d="M8 10h8"></path>
                        <path d="M8 14h8"></path>
                        <path d="M8 18h8"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 max-[1550px]:text-[10px] max-[1350px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">Storage</div>
                      <div className="text-sm font-[500] max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{service?.specs?.storage/1000} SSD</div>
                    </div>
                  </div>
                  
                  <div className="max-[1550px]:gap-1.75 max-[992px]:gap-0.75 flex items-center gap-1 max-[1350px]:gap-1.5 max-[1250px]:gap-1">
                    <div className="max-[1550px]:w-4.5 max-[1550px]:h-4.5 size-5 shrink-0 text-gray-400 max-[1350px]:size-4 max-[1250px]:size-3.5 max-[992px]:size-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="90%" height="90%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                        <rect x="9" y="9" width="6" height="6"></rect>
                        <line x1="9" y1="2" x2="9" y2="4"></line>
                        <line x1="15" y1="2" x2="15" y2="4"></line>
                        <line x1="9" y1="20" x2="9" y2="22"></line>
                        <line x1="15" y1="20" x2="15" y2="22"></line>
                        <line x1="20" y1="9" x2="22" y2="9"></line>
                        <line x1="20" y1="14" x2="22" y2="14"></line>
                        <line x1="2" y1="9" x2="4" y2="9"></line>
                        <line x1="2" y1="14" x2="4" y2="14"></line>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 max-[1550px]:text-[10px] max-[1350px]:text-[9px] max-[1250px]:text-[8px] max-[992px]:text-[7px]">CPU</div>
                      <div className="text-sm font-[500] max-[1550px]:text-xs max-[1350px]:text-[11px] max-[1250px]:text-[10px] max-[992px]:text-[9px]">{service?.options[0]?.cpu} cores</div>
                    </div>
                  </div>
                </div>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex cursor-pointer items-center justify-center rounded-md border border-[#525252] px-12 py-2 text-[10px] font-[500] text-[#525252] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px]'>Process</div>
                        <div  className='flex cursor-pointer items-center justify-center rounded-md border border-[#525252] px-12 py-2 text-[10px] font-[500] text-[#525252] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px]'>File Explore</div>
                        <div  className='flex cursor-pointer items-center justify-center rounded-md border border-[#525252] px-12 py-2 text-[10px] font-[500] text-[#525252] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px]'>Edit</div>
                        <div  className='flex cursor-pointer items-center justify-center rounded-md border border-[#525252] px-12 py-2 text-[10px] font-[500] text-[#525252] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px]'>Update</div>
                    </div>
                    <div className='mt-6 flex items-center justify-center gap-3 rounded-md bg-blue500 py-2 text-[12px] font-[500] text-white xl:text-[14px] 2xl:text-[14px] 3xl:text-[20px]'> Open {service.name ?? service.nixName} <Image src='/images/arrow-up-right.svg' alt="" width={20} height={20} className='' /> </div>
                </div>
            ))}
        </div>
    </div>
    
  )
}

export default Deployed_Apps