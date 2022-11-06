const ethEnabled = () => {
	if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();

        return true;
  	}

    return false;
}

window.addEventListener('load', async function() {
	if (!ethEnabled()) {
  		alert("Instale um navegador compatível com Ethereum ou uma extensão como o MetaMask para utilizar esse site!");
	}
});