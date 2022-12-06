//  SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol"; 
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
error Raffle__NotEnoughETHentered();
error Raffle_TransferFailed();
error Raffle__NotOpen();
error Lottery_UpkeepNotNeeded();

 abstract contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {

//storage variables
address payable[] private s_players;
uint256 private immutable i_entranceFee;
VRFCoordinatorV2Interface private immutable i_vrfCoordnator;
bytes32 private immutable gasLimit;
uint64 private immutable subId;
uint16 private constant waitconfirmations=3;
uint16 private immutable i_callbackGasLimit;
uint32 private constant NUM_WORDS=1;
uint256 private s_lastTimeStamp;
uint256 private immutable s_interval;
enum LotteryState{
  Open,
  Calculating
}
LotteryState private s_currentState;
//events
event LotteryEnter(address indexed player);
event RequestedWinner(uint256 indexed requestId);
event WinnerPicked (address indexed recentWinner);
//Lottery Variables

address private s_recentWinner;
constructor(uint256 entranceFee, address vrfCoordinatorV2, bytes32 m_gasLimit, uint64 m_subId, uint16 callbackGasLimit, uint256 interval) VRFConsumerBaseV2(vrfCoordinatorV2){
    i_entranceFee  = entranceFee;
    i_vrfCoordnator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    gasLimit = m_gasLimit;
     subId = m_subId; 
     i_callbackGasLimit= callbackGasLimit;
     s_currentState = LotteryState.Open;
     s_lastTimeStamp = block.timestamp;
     s_interval = interval;
}

 function checkUpkeep() public view returns(bool upkeepNeeded){
// This is the function that the ChainLink keepers will call
//The following should be true for the fn to return true:
// 1: Our time interval should have passed;
// 2: The lottery should have at least 1 player
// 3: The contract should have some ETH
// 4: The lottery should be in an "OPEN" state 
// 5: The subscription should be funded with LINK
bool isOpen = LotteryState.Open == s_currentState;
bool timePassed = (block.timestamp - s_lastTimeStamp) > s_interval; 
bool hasPlayers = (s_players.length > 0);
bool hasBalance = address(this).balance > 0;
 upkeepNeeded = (isOpen && timePassed && hasBalance && hasPlayers);

 }



function enterLottery() public payable{
if(msg.value < i_entranceFee){
revert Raffle__NotEnoughETHentered();
}
if(s_currentState != LotteryState.Open){
revert Raffle__NotOpen();
}
s_players.push(payable(msg.sender));
emit LotteryEnter(msg.sender); 
}

function getEntranceFee() public view returns(uint256){
return i_entranceFee;
}
// DO TUK SUM
function requestRandomWord() external {
  (bool upkeepNeeded) = checkUpkeep();
  if(!upkeepNeeded){
    revert Lottery_UpkeepNotNeeded(); 
  }
s_currentState = LotteryState.Calculating;
  uint256 reqId=i_vrfCoordnator.requestRandomWords(
            gasLimit,
            subId,
            waitconfirmations,
            i_callbackGasLimit,
            NUM_WORDS
        );
emit RequestedWinner(reqId);  
}
function fulfillRandomWords(uint256 /* requestId */, uint256[] memory randomWords) internal override{
uint256 indexOfWinner = randomWords[0] % s_players.length;
address payable recentWinner= s_players[indexOfWinner];
s_recentWinner= recentWinner;
(bool success, ) = recentWinner.call{value: address(this).balance}("");
s_currentState = LotteryState.Open;
s_players = new address payable[](0);
s_lastTimeStamp = block.timestamp;        
if(!success){
  revert Raffle_TransferFailed();
}
emit WinnerPicked(recentWinner);
}

function getRecentWinner() public view returns (address) {
  return s_recentWinner;
}


}


//Enter lottery (pay an amount)

//Pick a random winner

//Winner to be selected in a couple of minutes => automated

//Chainlink Oracle -> Randomness,Automated execution (keeper)