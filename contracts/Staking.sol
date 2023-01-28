// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/* In this contract we want people to
1. Stake - lock tokens into our smart contract
2. withdraw - unstake the tokens and pull it out of the contract
3. claimrewards - users get rewards because of the staked tokens

What's a good reward mechanism or reward math
 */

//use yarn add @openzeppelin/contracts to install the contracts
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Staking {
  /**** Variables *****/
  //Creating a contract variable of type IERC20 to intreact with a particular token contract
  IERC20 public s_stakingTokenContract;
  // Creating a similar contract variable for reawrd token, the reward token contract could be diffrent
  IERC20 public s_rewardTokenContract;
  uint256 public s_totalSupply;
  uint256 public s_rewardPerTokenStored;
  uint256 public s_lastUpdatedTime;
  uint256 public constant c_Reward_rate = 100;
  bool internal s_locked;

  /***** mappings ******/
  mapping(address => uint256) s_balances;
  mapping(address => uint256) s_rewards;
  mapping(address => uint256) s_userRwardPerTokenPaid;

  /****** Error Functions *********/
  error Staking__TransferFailed();
  error Staking__NotEnoughBalance();
  error Staking__NotEnoughRewardTokenAvailable();
  error Staking__ReentrancyDetected();

  /******* Event functions *********/
  event amountStaked(address indexed senderAddress, uint256 indexed amount);
  event WinthdrewStake(
    address indexed receriverAddress,
    uint256 indexed amount
  );
  event RewardsClaimed(address indexed receriverAddress, uint256 amount);

  /***** Constructor Function *******/
  constructor(address stakingtoken, address rewardtoken) {
    //The ERC 20 tokens will have one address, we need to wrap it into type IERC20
    // what we are doing below is to call a contract with a deployed address
    // actual_contract_name contract_varible = actual_contract_name (contract address)
    s_stakingTokenContract = IERC20(stakingtoken);
    s_rewardTokenContract = IERC20(rewardtoken);
  }

  /********** Staking Functionality ***********/
  //Here we are not allowing any token to be staked - we are only allowing one specific token
  //To allow multiple tokens, we need to convert the prices between tokens
  /**
   * @notice This function deposits tokens into this contract
   * @param amount | How much to stake
   */
  function stake(uint256 amount) external updateReward(msg.sender) {
    //Keeping track of the balances, this will map each sender address to amount they staked
    s_balances[msg.sender] += amount;

    //Keeping track of the entire supply
    s_totalSupply += amount;

    // Staking here simply means the user sends the tokens to this contract
    // the s_stakingTokenContract is of type IERC20, IERC20 will provide you below function to transfer from one account to another
    /* function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool); */
    // using the above function, we can transfer from sender to this contract, notice we are not using payable here
    //ususally payable sends msg.value (what we send) to the contract

    bool success = s_stakingTokenContract.transferFrom(
      msg.sender,
      address(this),
      amount
    );
    // Throwing an error if transaction is failed
    if (!success) {
      revert Staking__TransferFailed();
    }
    emit amountStaked(msg.sender, amount);
  }

  /**
   * @notice This function withdraws amount from contract and sends it back to the users
   * @param amount | How much to withdraw
   */

  function withdraw(uint256 amount)
    external
    updateReward(msg.sender)
    nonReentrant
  {
    //We can check if the amount is more than balance in the sender account
    if (amount > s_balances[msg.sender]) {
      revert Staking__NotEnoughBalance();
    }
    //Updating the balances, keep in mind that we need to change the state before the transfers
    // this is to prevent reentrancy attacks
    s_balances[msg.sender] -= amount;
    s_totalSupply -= amount;

    //Transferring the amount to user
    //Need to check why below logic on usual transfer doesn't work
    // address currentUser = payable(msg.sender);
    // (bool callsuccess, ) = currentUser.call{ value: amount }('');
    // if (!callsuccess) {
    //   revert Staking__TransferFailed();
    // }

    //We can use transfer function. See that we are not using transfer from - transfer from is from any other place to this
    // transfer is to any other place from this
    // transefer from will need the users to approve the transaction
    // function transfer(address to, uint256 amount) external returns (bool);
    emit WinthdrewStake(msg.sender, amount);

    bool success = s_stakingTokenContract.transfer(msg.sender, amount);
    if (!success) {
      revert Staking__TransferFailed();
    }
  }

  function claimReward(uint256 amount)
    external
    updateReward(msg.sender)
    nonReentrant
  {
    //We can check if claimed reward is more than available
    if (amount > s_rewards[msg.sender]) {
      revert Staking__NotEnoughRewardTokenAvailable();
    }
    // Update the reward balances first
    s_rewards[msg.sender] -= amount;

    // We can now transfer the reward tokens
    // function transfer(address to, uint256 amount) external returns (bool);
    emit RewardsClaimed(msg.sender, amount);
    bool callsuccess = s_rewardTokenContract.transfer(msg.sender, amount);
    if (!callsuccess) {
      revert Staking__TransferFailed();
    }
  }

  /************** Modifires *********************/
  //For staking rewards, we need a math logic to see how much each will earn as a reward
  // Currently we are considering 100 tokens rewards per second as constant always
  // this means there be any number of people who staked, the total reward is always the same
  // What we need is to keep track of time and see how many people staked during each time interval
  // We also need to keep track of each user (account) with what they have earned

  modifier updateReward(address account) {
    //first let's see how much is the reward for each token staked - if only 100 tokens taked, the reward will be 100
    s_lastUpdatedTime = block.timestamp;
    s_rewardPerTokenStored = rewardPerToken();
    s_rewards[account] = totalRewardEarned(account);
    s_userRwardPerTokenPaid[account] = s_rewardPerTokenStored;
    _;
  }

  //The way to prevent re entrancy is o have a modifier to lock the contract to execute one function
  // before another function is called - with reentrancy, the same function withdraw is called over and over using fallback function
  modifier nonReentrant() {
    if (s_locked) {
      revert Staking__ReentrancyDetected();
    }
    s_locked = true;
    _;
    s_locked = false;
  }

  /******* Staking Logic *********/

  function rewardPerToken() public view returns (uint256) {
    // Seeing reward per token in the pool
    if (s_totalSupply == 0) {
      // We can return the same if total supply is 0
      return s_rewardPerTokenStored;
    }
    uint256 timePassed = block.timestamp - s_lastUpdatedTime;
    uint256 rewardAtThisTime = (c_Reward_rate * 1e18 * timePassed) /
      s_totalSupply;
    //1e18 is for gwei conversion
    uint256 totalRewardPerToken = s_rewardPerTokenStored + rewardAtThisTime;
    return totalRewardPerToken;
  }

  function totalRewardEarned(address account) public view returns (uint256) {
    uint256 totalReward = (((s_rewardPerTokenStored -
      s_userRwardPerTokenPaid[account]) * s_balances[account]) / 1e18) +
      s_rewards[account];
    return totalReward;
  }

  /****** Getter Functions ************/
  //As example we are only getting the balances in each account, but ideally we want getters for all the storage variables

  function getBalance(address account) public view returns (uint256) {
    return s_balances[account];
  }
}
