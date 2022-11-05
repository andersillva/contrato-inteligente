var proposals = [];
var voting;
var myAddress;

window.addEventListener('load', async function() {
	getMyAccounts(await web3.eth.getAccounts());

	voting = new web3.eth.Contract(VotingContractInterface, CONTRACT_ADDRESS);

	getProposals(loadProposals);
    updateStatus();
});

function getProposals(callback)
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

		if (callback) {
			callback(proposals);
		}
	});
}

function loadProposals(proposals) {
    var select = document.getElementById("proposals");

    select.options[select.options.length] = new Option('Selecione a proposta desejada',
        'Selecione a proposta desejada');

    for (let proposal of proposals) {
        select.options[select.options.length] = new Option(proposal.name, proposal.name); // Qual é o número
    }
}

function updateStatus() {
    voting.methods.getSenderVotingStatus().call(async function (error, status) {
        document.getElementById('status').innerHTML = getTranslatedStatus(status);
        formatAccessComponents(status);
	});
}

function getTranslatedStatus(status) {
    if (status == "You do not have right to vote.")
        return "Você não tem direito a voto";

    if (status == "You have already voted.")
        return "Você já votou";

    if (status == "You can now vote.")
        return "Votação disponível";

    return "";
}

function formatAccessComponents(status) {
    var blockVote = (status == "You do not have right to vote.") || (status == "You have already voted.");

    document.getElementById("proposals").disabled = blockVote;
    document.getElementById("vote").disabled = blockVote;
}

function blockVote(status) {
    return (status == "You do not have right to vote.") || (status == "You have already voted.");
}

function vote() {
	voting.methods.vote(document.getElementById("proposals").value).send({from: myAddress})
	.on('receipt', function(receipt) {
		Swal.fire("Votação efetuada.");
 	})
 	.on('error', function(error) {
		console.log(error.message);
		return;
	});
}