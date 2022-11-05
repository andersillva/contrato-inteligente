var proposals = [];
var voting;
var myAddress;

window.addEventListener('load', async function() {
    document.getElementById("votingOutcome").style.visibility='hidden';

	getMyAccounts(await web3.eth.getAccounts());

	voting = new web3.eth.Contract(VotingContractInterface, CONTRACT_ADDRESS);

	getProposals();
});

function getProposals()
{
	voting.methods.getProposalsCount().call(async function (error, count) {
		for (i=0; i<count; i++) {
			await voting.methods.getProposal(i).call().then((data)=> {
				var proposal = {
          				name : web3.utils.toUtf8(data[0]),
          				voteCount : data[1]
      				};

				proposals.push(proposal);
 			});
		}
	});
}

function closeVoting() {
	voting.methods.closeVoting().send({from: myAddress})
	.on('receipt', function(receipt) {
        Swal.fire("Votação encerrada.");

        loadVotingOutcome();

        document.getElementById("votingOutcome").style.visibility = 'visible';
 	})
 	.on('error', function(error) {
		console.log(error.message);
		return;
	});
}

function loadVotingOutcome(proposals) {
    var row = "";

    for (let proposal of proposals) {
        row += '<tr>';
        row += '<td>' + proposal['name'] + '</td>';
        row += '<td>' + proposal['voteCount'] + '</td>';
        row += "</tr>";
    }

	document.getElementById("table").innerHTML = row;
}