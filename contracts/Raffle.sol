// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// Raffle definition - raising money by selling numbered tickets, one or some of which are
// subsequently drawn at random, the holder of such tickets winning a prize

//Pick a random winner (verifiably random so that no one can tamper with it)

// Winner selected automatically at certain interval

// Chainlink oracles are used - Randmness, Automated execution (Chainlink keepers)

//Using chainlik Get a random number to generate a verifyable random number
// Run yarn add --dev @chainlink/contracts to get all the contracts
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol';

/*** @title - A sample Raffle contract
 * @author - Sai Pramod U
 * @notice - this contract is to create a decentrilized raffle
 * @dev - This uses chainlink VRF v2
 */

// In order to inherit VRFConsumerBaseV2.sol use 'is'
contract Raffle is VRFConsumerBaseV2 {
  /***********Enums ****************/
  // Enums are the way to create custom data types
  enum RaffleState {
    OPEN,
    CALCULATING
  } // This Rafflestate is a uint256 data type with 0= Open and 1 = calculating

  /***********Error Functions ************/
  //Error function to create custom errors
  error Raffle_NotenoughETHEntered();
  error Raffle__TransferFailed();
  error Raffle__RaffleIsNotCurrentlyOPEN();
  error Raffle__ErrorInConditions(
    uint256 currentBalance,
    uint256 playerPoolLength,
    RaffleState stateOfRaffle
  );

  /*****************State Variables initialization*********/
  //i is for immmutable (constant), immutable variables need to be assigned in constructor
  uint256 private immutable i_entranceFee;
  //we want to use VRFCoordinatorV2Interface, creating contract variable
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  bytes32 private immutable i_keyhash; // look into VRFCoordinatorV2Interface to learn about keyhash
  uint64 private immutable i_subId;
  uint16 private constant c_minimumRequestConfirmations = 3;
  uint32 private immutable i_callbackGasLimit;
  uint32 private constant c_numWords = 1; // No. of random nos we want

  /******** Lottery Variables ************/
  // we want all the players in storage variable to access even outside the functions
  address payable[] s_players;
  address payable s_recentwinner;
  RaffleState private s_raffleState;
  uint256 private s_lasttimeStamp;
  uint256 private immutable i_interval;

  /***************Events **************/

  //Events - events are a way to store something in the transaction log which can be accessed later
  // indexed variables are easier to access when needed
  event RaffleEnter(address indexed player);
  event RequestedRaffleWinner(uint256 indexed requestId);
  event RaffleWinner(address indexed recentWinner);

  /***********Constructor**********/

  //Constructor is exceuted first with the arguments
  // If we inherit any contract, we need to put that contract's constructor here, see VRFConsumerBaseV2 contarct constructor
  constructor(
    address _vrfCoordinator, //_vrfCoordinator address is not available for local chain, we need to deploy a mock for this
    uint256 entranceFee,
    bytes32 keyhash,
    uint64 subId,
    uint32 callbackGasLimit,
    uint256 interval
  ) VRFConsumerBaseV2(_vrfCoordinator) {
    //Here we are assigning a minimum value to enter the raffle
    i_entranceFee = entranceFee;
    // contract variable = contract_name(contract_address)
    i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    // Assigning all required variables for calling interface contract
    i_keyhash = keyhash;
    i_subId = subId;
    i_callbackGasLimit = callbackGasLimit;
    s_raffleState = RaffleState.OPEN; // We can also use s_raffleState = RaffleState(0) - This is because 0 is OPEN
    s_lasttimeStamp = block.timestamp;
    i_interval = interval;
  }

  /********Condition to Enter Raffle ************/

  //creating the function to enter the raffle, it is payable so that people can send eth to it
  function enterRaffle() public payable {
    //Checking if entered amount is more than entrance fee, revert is gas efficient to do this
    if (msg.value < i_entranceFee) {
      revert Raffle_NotenoughETHEntered();
    }
    // Checking if the raffle is still open or not
    if (s_raffleState == RaffleState.CALCULATING) {
      revert Raffle__RaffleIsNotCurrentlyOPEN();
    }
    //We can push the msg.sender address to s_players array, we have to typecast msg.sender as payable as
    //it is not payable by default
    s_players.push(payable(msg.sender));
    //Emitting the data for the event
    emit RaffleEnter(msg.sender);
  }

  /************Picking the Random Number **********************/
  /* * This is the funcion that chainlink keeper node calls
   * Here we are just automating to generate a random number once certain conditions are met
   * The following should be true to proceed to get a random number
   1. The set time interval should have passed
   2. The lottery should be open - ie. no one should be able to enter the raffle when we are processing the winner
   3. The raffle (this contract) has ETH and atleast one player
   4. For this off chain timer - subsricption is needed and should have enough LINK tokens funded in it
   */

  // We are not passing anything to function, perform data is something that we can get back if certain conditions
  // are fullfilled, once the returned upkeepNeeded passes, automatically performUpkeep is triggered
  // Notice that checkupkeep and performUpkeep are from AutomationCompatibleInterface, we do not need contract addresses to use these
  function checkUpkeep()
    public
    view
    returns (
      // bytes calldata /*checkData */
      bool upkeepNeeded,
      bytes memory /*performData */
    )
  {
    // We will now check all the conditions we need
    bool isOpen = (s_raffleState == RaffleState.OPEN);
    bool timePassed = (block.timestamp - s_lasttimeStamp) > i_interval;
    bool hasPlayers = s_players.length > 0;
    bool hasBalance = address(this).balance > 0;
    upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
    return (upkeepNeeded, '0x0');
  }

  /**
   * @dev Once `checkUpkeep` is returning `true`, performUpkeep function is called automatically
   * and it kicks off a Chainlink requestRandomWords VRF call to get a random winner.
   */

  //Now we need to pick a random winner from the pool of people who have entered
  // Here we will just get one random number from oracle chainlink
  function performUpkeep() external // bytes calldata /* performData */
  {
    (bool upkeepNeeded, ) = checkUpkeep();
    if (!upkeepNeeded) {
      revert Raffle__ErrorInConditions(
        address(this).balance,
        s_players.length,
        s_raffleState
      );
    }
    // We can assign rafflestate as calculating here, as we are processing the randomwinner
    s_raffleState = RaffleState.CALCULATING;
    // Here we request the random number, i_vrfCoordinator.requestRandomWords() is called from interface
    uint256 requestId = i_vrfCoordinator.requestRandomWords(
      i_keyhash,
      i_subId,
      c_minimumRequestConfirmations,
      i_callbackGasLimit,
      c_minimumRequestConfirmations
    );
    emit RequestedRaffleWinner(requestId);
  }

  /************Picking the Random Winner **********************/
  //fulfillRandomWords is from VRFConsumerBaseV2 abstract contract,
  // override will override the function in VRFConsumerBaseV2 contract with this function
  function fulfillRandomWords(
    uint256,
    /*requestId */
    // Request id is not used
    uint256[] memory randomWords
  ) internal override {
    // The random number generated will be so long, we need to use a modulus operator to size it within pool
    // Only 1 random no. is generated in our case (c_minimumRequestConfirmations) which we can assign to randomWords
    uint256 indexofWinner = randomWords[0] % s_players.length;
    address payable recentWinner = s_players[indexofWinner];
    s_recentwinner = recentWinner;
    // Now we can send all the money to the winner. We can use call same as Fundme contract.
    (bool callSuccess, ) = recentWinner.call{ value: address(this).balance }(
      ''
    );
    // We can now throw an error if callSuccess is false
    if (!callSuccess) {
      revert Raffle__TransferFailed();
    }
    // We can log the recent winners in the transaction log
    emit RaffleWinner(recentWinner);

    // After we have picked the winner and sent all the eth, we can now reset the pool of players
    // we are making s_players a new array with size zero - (0)
    s_players = new address payable[](0);
    // As we have picked the winner, we can assign the Rafflestate back to open
    s_raffleState = RaffleState.OPEN;
    // We can reset the timestamp
    s_lasttimeStamp = block.timestamp;
  }

  /************* View or Pure Getter Functions ***************/
  //we can create a function to view the entrance fee, best practice is to use get for view functions
  function getEntrancFee() public view returns (uint256) {
    return i_entranceFee;
  }

  //function to get the address of a player from s_players array
  function getPlayer(uint256 index) public view returns (address) {
    return s_players[index];
  }

  //function to get players length
  function getPlayersLength() public view returns (uint256) {
    return s_players.length;
  }

  //function to get raffle state
  function getRaffleState() public view returns (RaffleState) {
    return s_raffleState;
  }

  //function to get how many block confirmations we coded, notice the pure finction
  // since c_minimumRequestConfirmations is constant it is not stored in storage, it can be assigned as pure
  function getBlockConfirmations() public pure returns (uint256) {
    return c_minimumRequestConfirmations;
  }

  // Function to get recentwinner
  function getRecentWinner() public view returns (address) {
    return s_recentwinner;
  }

  //function to get last time stamp
  function getLastTimeStamp() public view returns (uint256) {
    return s_lasttimeStamp;
  }

  //function to get interval coded
  function getInterval() public view returns (uint256) {
    return i_interval;
  }
}
