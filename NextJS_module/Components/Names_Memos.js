import { useEffect, useState } from 'react';
import abi from '/Users/pramod/Documents/Blockchain development/Hardhat_freecodecamp/Hardhat_Modules/artifacts/contracts/BuyMeaCoffee.sol/BuyMeACoffee.json';
import { ethers } from 'ethers';

export default function Names_Memos() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  //Getting contract variables
  const contractABI = abi.abi;
  const contractAddress = '0x95d17644f504ca0C5234BB84f0bf9c0808d1C45C';

  const onNameChange = (e) => {
    setName(e.target.value);
    // console.log('The name', name);
  };

  const onMessageChange = (e) => {
    setMessage(e.target.value);
    // console.log('Message', message);
  };

  //We can have one function to get the contract
  const getCoffeeContract = async () => {
    try {
      //We will need contract ABI and the contract address to intercat with the contract
      let buyMeCoffeeContract;
      let provider;
      let signer;

      //Let's check if metamask is available
      const { ethereum } = window;
      if (ethereum) {
        provider = new ethers.providers.Web3Provider(ethereum, 'any');
        signer = provider.getSigner();
        //Lets get the contract if ethereum exists
        buyMeCoffeeContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
      }
      return [buyMeCoffeeContract, provider, signer];
    } catch (error) {
      console.log(error);
    }
  };

  //Logic to make transaction to transfer money to the contract
  const buyMeACoffee = async () => {
    try {
      //Let us get the contract now
      const [buyMeCoffeeContract, provider, signer] = await getCoffeeContract();

      // const { buyMeCoffeeContract } = await getCoffeeContract();
      // Now we can interact with the contract
      console.log('Buying cofee..');

      // function buyCofee(string memory _name, string memory _message)
      const tippingTx = await buyMeCoffeeContract.buyCofee(
        name ? name : 'Anonymus',
        message ? message : 'Enjy your coffee',
        { value: ethers.utils.parseEther('0.001') }
      );
      const tippingTxResponse = await tippingTx.wait(1);
      console.log('Mined', tippingTx.hash);
      const contractBalance = await provider.getBalance(contractAddress);
      console.log(
        'Great, you have purchased a coffee for Sai and the balance in contract is',
        ethers.utils.formatEther(contractBalance)
      );

      //We can now clear the names and message
      setName('');
      setMessage('');
    } catch (error) {
      console.log(error);
    }
  };

  //Logic to withdraw the amount to the owner account
  const withdraw = async () => {
    try {
      // Let's get the contract
      const [buyMeCoffeeContract, provider, signer] = await getCoffeeContract();
      //Now we can intract with the contract
      console.log('Withdrawing to owner account....');
      const withdrawtx = await buyMeCoffeeContract.withdraw();
      await withdrawtx.wait(2);
      console.log('Withdraw successfull...');
      const contractBalance = await provider.getBalance(contractAddress);
      const ownerBalance = await signer.getBalance();
      console.log(
        'The contract Balance - ',
        ethers.utils.formatEther(contractBalance),
        'The owner Balance - ',
        ethers.utils.formatEther(ownerBalance)
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      className='flex flex-col'
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className='flex flex-col items-center p-2'>
        <label className='pb-2'>Name</label>
        <input
          type='text'
          placeholder='Your Name'
          onChange={onNameChange}
          className='flex border-2 border-gray-500 rounded-md items-start justify-center w-[30vh]'
        />
      </div>
      <div className='flex flex-col items-center p-2'>
        <label className='pb-2'>Send Sai a cool message with the coffee</label>
        <input
          type='text'
          placeholder='Enjoy your coffee!!!'
          onChange={onMessageChange}
          className='flex border-2  border-gray-500 rounded-md w-[30vh] h-[15vh]'
        />
        <button
          className=' text-xs m-2 bg-blue-300 w-[20vh] h-[3vh] rounded-lg hover:bg-blue-400'
          onClick={buyMeACoffee}
        >
          Send 1 Coffee for 0.001 ETH
        </button>
        <button
          className=' text-xs m-2 bg-blue-300 w-[10vh] h-[3vh] rounded-lg hover:bg-blue-400'
          onClick={withdraw}
        >
          Withdraw
        </button>
      </div>
      <div className='flex flex-col'>
        <p className='text-center mt-3 text-base font-bold'>Memos Received</p>
        <div className='flex flex-col w-[50vh] h-[10vh] border-gray-500 border-2 rounded-md mt-4 items-start justify-center'>
          <p className='p-1 text-xs font-bold'>'You don't like coffee'</p>
          <p className='p-1 text-xs'>From: Time:</p>
        </div>
      </div>
    </form>
  );
}
