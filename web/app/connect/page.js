import ConnectClient from './ConnectClient';

export default async function ConnectPage({ searchParams }) {
  const params = await searchParams;
  return <ConnectClient code={params?.code || ''} />;
}
