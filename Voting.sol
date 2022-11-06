pragma solidity 0.8.7;

/// @title Voting with delegation.
contract Ballot {
    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single voter.
    struct Voter {
        bytes32 name;
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    address public chairperson;

    // This declares a state variable that
    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;
    mapping(uint => address) public addresses;
    uint public votersCount;
    bool votingClosed = false;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;
    Proposal[] public proposalsRankedByVotes;

    /// Create a new ballot to choose one of `proposalNames`.
    constructor() {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        voters[chairperson].name = "Chairperson";
        addresses[0] = chairperson;
        votersCount = 1;
        votingClosed = false;
    }

    function addProposal(string memory name) public {
        require(!votingClosed, "Voting has already been closed.");
        require(
            msg.sender == chairperson,
            "Only chairperson can add proposals."
        );
        proposals.push(Proposal({
            name: stringToBytes32(name),
            voteCount: 0
        }));
        proposalsRankedByVotes.push(Proposal({
            name: stringToBytes32(name),
            voteCount: 0
        }));
    }

    // Give `voter` the right to vote on this ballot.
    // May only be called by `chairperson`.
    function giveRightToVote(address adress, string memory name) public {
        // If the first argument of `require` evaluates
        // to `false`, execution terminates and all
        // changes to the state and to Ether balances
        // are reverted.
        // This used to consume all gas in old EVM versions, but
        // not anymore.
        // It is often a good idea to use `require` to check if
        // functions are called correctly.
        // As a second argument, you can also provide an
        // explanation about what went wrong.
        require(!votingClosed, "Voting has already been closed.");
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            !voters[adress].voted,
            "The voter has already voted."
        );
        require(voters[adress].weight == 0);
        voters[adress].weight = 1;
        voters[adress].name = stringToBytes32(name);
        addresses[votersCount] = adress;
        votersCount++;
    }

    function getAllVoters() public view returns (Voter[] memory){
        Voter[] memory votersArray = new Voter[](votersCount);
        for (uint i = 0; i < votersCount; i++) {
            Voter storage voter = voters[addresses[i]];
            votersArray[i] = voter;
        }
        return votersArray;
    }

    function getSenderVotingStatus(address adress) public view returns (string memory voterStatus){
        Voter storage sender = voters[adress];
        string memory status = "You do not have right to vote.";
        if (sender.weight > 0) {
            if (sender.delegate != address(0)) {
                status = "You have delegated your vote.";
            } else {
                if (sender.voted) {
                    status = "You have already voted.";
                } else {
                    status = "You can now vote.";
                }
            }
        }
        return status;
    }

    /// Delegate your vote to the voter `to`.
    function delegate(address to) public {
        require(!votingClosed, "Voting has already been closed.");
        // assigns reference
        Voter storage sender = voters[msg.sender];
        require(sender.weight > 0, "You do not have right to vote, so you cannot delegate it.");
        require(!sender.voted, "You have already voted.");
        require(to != msg.sender, "Self-delegation is not allowed.");

        // Forward the delegation as long as
        // `to` also delegated.
        // In general, such loops are very dangerous,
        // because if they run too long, they might
        // need more gas than is available in a block.
        // In this case, the delegation will not be executed,
        // but in other situations, such loops might
        // cause a contract to get "stuck" completely.
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }

        Voter storage delegate_ = voters[to];
        require(delegate_.weight != 0, "Cannot delegate a vote to one who does not have the right to vote.");
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }

        // Since `sender` is a reference, this
        // modifies `voters[msg.sender].voted`
        sender.voted = true;
        sender.delegate = to;
    }

    /// Give your vote (including votes delegated to you)
    /// to proposal `proposals[proposal].name`.
    function vote(uint proposal) public {
        require(!votingClosed, "Voting has already been closed.");
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "You have no right to vote.");
        require(!sender.voted, "You have already voted.");
        sender.voted = true;
        sender.vote = proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.weight;
        refreshProposalsRanking(proposals[proposal]);
    }

    function closeVoting() public {
        require(!votingClosed, "Voting has already been closed.");
        require(
            msg.sender == chairperson,
            "Only chairperson can close voting."
        );
        votingClosed = true;
    }

    function reopenVoting() public {
        require(votingClosed, "Voting is open.");
        require(
            msg.sender == chairperson,
            "Only chairperson can reopen voting."
        );
        votingClosed = false;
    }

    function getVotingResult() public view returns (Proposal[] memory){
		require(votingClosed, "Voting is still open.");
        return proposalsRankedByVotes;
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        require(votingClosed, "Voting is still open.");
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() public view
            returns (bytes32 winnerName_)
    {
        require(votingClosed, "Voting is still open.");
        winnerName_ = proposals[winningProposal()].name;
    }
    
    function getProposalsCount() public view 
            returns (uint count) 
    {
        count = proposals.length;
    }
    
    function getProposal(uint index) public view
            returns (bytes32 name, uint voteCount)
    {
        name = proposals[index].name;
        voteCount = proposals[index].voteCount;
    }

    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function refreshProposalsRanking(Proposal memory proposal) private {
        uint i = 0;
        for(i; i < proposalsRankedByVotes.length; i++) {
            if(proposalsRankedByVotes[i].voteCount < proposal.voteCount) {
                break;
            }
        }
        for(uint j = proposalsRankedByVotes.length - 1; j > i; j--) {
            proposalsRankedByVotes[j] = proposalsRankedByVotes[j - 1];
        }
        proposalsRankedByVotes[i] = proposal;
    }

}