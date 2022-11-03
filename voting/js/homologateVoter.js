var homologatedVoters = [];
var voting;

window.addEventListener('load', async function() {
	getMyAccounts(await web3.eth.getAccounts());

	voting = new web3.eth.Contract(VotingContractInterface, CONTRACT_ADDRESS);

	getHomologatedVoters(loadHomologatedVoters);
});

function getHomologatedVoters(callback)
{
	voting.methods.getAllVoters().call(async function (error, data) {
        data.forEach((homologatedVoter, index) => {
            homologatedVoters.push(homologatedVoter);
 		});

		if (callback) {
			callback(homologatedVoters);
		}
	});
}

function loadHomologatedVoters(homologatedVoters) {
    var row = "";

    for (let homologatedVoter of homologatedVoters) {
        row += '<tr>';
        row += '<td>' + web3.utils.toUtf8(homologatedVoter['name']) + '</td>';
        row += '<td>' + '' + '</td>';
        row += '<td>' + getStatus(homologatedVoter['voted'], web3.utils.toUtf8(homologatedVoter['delegate'])) + '</td>';
        row += "</tr>";
    }

	document.getElementById("table").innerHTML = row;
}

function getStatus(voted, delegate) {
    if (voted) {
        return "Votou";
    }

    if (delegate) {
        return "Delegou o voto";
    }

    return "Aguardando voto ou delegação";
}

function showModalCreate() {
    Swal.fire({
        title: 'Nova',
        html:
            '<input id="id" type="hidden">' +
            '<input id="voter" class="swal2-input" placeholder="Eleitor">' +
            '<input id="address" class="swal2-input" placeholder="Endereço">',
        focusConfirm: false,
        preConfirm: () => {
            createHomologatedVoter(document.getElementById("address").value, document.getElementById("voter").value);
        }
    })
}

function createHomologatedVoter(address, voter) {
	voting.methods.giveRightToVote(address, voter).send({from: myAddress})
	.on('receipt', function(receipt) {
		windows.location.reaload(true);
 	})
 	.on('error', function(error) {
		console.log(error.message);
		return;
	});
}