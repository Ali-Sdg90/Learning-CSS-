const tbody = document.querySelector("tbody");

fetch("games.json")
    .then((response) => response.json())
    .then((data) => {
        console.log(data);

        data.sort((a, b) => {
            if (a.game.toLowerCase() < b.game.toLowerCase()) return -1;
            if (a.game.toLowerCase() > b.game.toLowerCase()) return 1;
            return 0;
        });

        data.forEach((game) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${game.game}</td>
                <td>${game.status}</td>
                <td>${game.rating}</td>
                <td>${game.difficulty}</td>
                <td>${game.note}</td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch((error) => console.error("Error fetching games data:", error));
