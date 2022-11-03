loadVotingOutcome();

function loadVotingOutcome() {
    var row = "";

    // for (let item of data) {
        row += '<tr>';
        // row += '<td>' + item['nota'] + '</td>';
        row += '<td>' + 'Proposta 1' + '</td>';
        row += '<td>' + '0' + '</td>';
        row += "</tr>";

        row += '<tr>';
        // row += '<td>' + item['nota'] + '</td>';
        row += '<td>' + 'Proposta 2' + '</td>';
        row += '<td>' + '1' + '</td>';
        row += "</tr>";
    // }

    document.getElementById("table").innerHTML = row;
}

function closeVoting() {
    loadVotingOutcome();
}