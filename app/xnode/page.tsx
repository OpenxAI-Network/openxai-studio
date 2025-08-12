import XNodeDashboard from './dashboard'

type XnodePageProps = {
  searchParams: {
    baseUrl: string
  }
}

export default function XNodePage({ searchParams }: XnodePageProps) {
  return <XNodeDashboard baseUrl={searchParams.baseUrl} />
}
