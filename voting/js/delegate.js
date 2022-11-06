var voters = [];
var voting;
var myAddress;

window.addEventListener('load', async function() {
	getMyAccounts(await web3.eth.getAccounts());

	voting = new web3.eth.Contract(VotingContractInterface, CONTRACT_ADDRESS);
});

function delegate() {
	voting.methods.delegate(document.getElementById("address").value).send({from: myAddress})
	.on('receipt', function(receipt) {
		Swal.fire("Delegação efetuada.");
 	})
 	.on('error', function(error) {
		console.log(error.message);
		return;
	});
}