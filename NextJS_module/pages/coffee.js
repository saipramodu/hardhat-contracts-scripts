import { useEffect, useState } from 'react';
import Layout from '../Components/Layout';
import Names_Memos from '../Components/Names_Memos';

export default function buymeacoffee() {
  const [walletConnect, setWalletConnect] = useState(false);
  const [currentAcc, setCurrentAcc] = useState('');

  // We can use useEffect to make few checks, which will only load during first time load or referesh
  useEffect(() => {
    console.log('Page Refereshed');
    isWalletConnected();
  }, []);

  //Logic for Wallet connect
  const connectclick = async () => {
    //Here we can create logic to connect to wallet
    try {
      console.log('Connect Clicked');
      const { ethereum } = window;
      // console.log(window);

      //Check if Metamask is installed
      !ethereum && console.log('Please Install Metamask');

      //Getting the metamask accounts, the accounts will have all the accounts that are connected
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      // console.log('The accounts that are connected are', accounts[0]);

      //Multiple accounts might be connected, we can take the first one
      setCurrentAcc(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  //Logic to check and display if accounts are connected
  const isWalletConnected = async () => {
    try {
      //getting ethereum
      const { ethereum } = window;
      //get all the accounts are connected
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      //Check if accounts array has a length
      accounts.length > 0
        ? console.log('Account connected', accounts[0])
        : console.log(
            'Looks like metamask is not connected, please connect to metamask'
          );
      setCurrentAcc(accounts[0]);
    } catch (error) {
      console.log('Error', error);
    }
  };

  return (
    <div>
      <Layout title={'Buy me a coffee'}>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex text-3xl font-bold mb-5'>
            Buy Sai a Coffee!!!
          </div>
          {!currentAcc ? (
            <button
              className='flex items-center justify-center w-[20vh] bg-blue-300 rounded-md hover:bg-blue-400'
              onClick={connectclick}
            >
              Connect your wallet
            </button>
          ) : (
            <Names_Memos />
          )}
        </div>
      </Layout>
    </div>
  );
}
