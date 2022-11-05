var voters = [];
var voting;
var myAddress;

window.addEventListener('load', async function() {
	getMyAccounts(await web3.eth.getAccounts());

	voting = new web3.eth.Contract(VotingContractInterface, CONTRACT_ADDRESS);

	getVoters(loadVoters);
});

function getVoters(callback)
{
	voting.methods.getAllVoters().call(async function (error, data) {
        data.forEach((voter, index) => {
            voters.push(voter);
 		});

		if (callback) {
			callback(voters);
		}
	});
}

function loadVoters(voters) {
    var select = document.getElementById("voterDelegate");

    select.options[select.options.length] = new Option('Selecione o eleitor para delegação',
        'Selecione o eleitor para delegação');

    for (let voter of voters) {
        select.options[select.options.length] = new Option(web3.utils.toUtf8(voter.name), voter.delegate);
    }
}

function delegate() {
	voting.methods.delegate(document.getElementById("voterDelegate").value).send({from: myAddress})
	.on('receipt', function(receipt) {
		Swal.fire("Delegação efetuada");
 	})
 	.on('error', function(error) {
		console.log(error.message);
		return;
	});
}