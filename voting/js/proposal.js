var proposals = [];
var voting;
var myAddress;

window.addEventListener('load', async function() {
	getMyAccounts(await web3.eth.getAccounts());

	voting = new web3.eth.Contract(VotingContractInterface, CONTRACT_ADDRESS);

	getProposals(loadProposals);
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
    var row = "";

    for (let proposal of proposals) {
        row += '<tr>';
        row += '<td>' + proposal['name'] + '</td>';
        row += "</tr>";
    }

	document.getElementById("table").innerHTML = row;
}

function showModalCreate() {
    Swal.fire({
        title: 'Nova',
        html:
            '<input id="id" type="hidden">' +
            '<input id="proposal" class="swal2-input" placeholder="Proposta">',
        focusConfirm: false,
        preConfirm: () => {
            createProposal(document.getElementById("proposal").value);
        }
    })
}

function createProposal(proposal) {
	voting.methods.addProposal(proposal).send({from: myAddress})
	.on('receipt', function(receipt) {
		windows.location.reaload(true);
 	})
 	.on('error', function(error) {
		console.log(error.message);
		return;
	});
}