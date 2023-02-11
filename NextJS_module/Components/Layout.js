import Head from 'next/head';

export default function Layout({ title, children }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name='description' content='Our Smart Contract Lottery' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex flex-col h-screen justify-center items-center'>
        <div className='flex flex-col justify-between'>
          {children}
          <footer className='flex absolute bottom-0 right-0 w-full h-10 justify-center items-center shadow-lg border border-t-2'>
            Created by @saipramodu for a web3 practice
          </footer>
        </div>
      </div>
    </div>
  );
}
