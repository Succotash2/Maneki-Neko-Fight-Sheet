document.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');

  const baseUrl = 'https://script.google.com/macros/s/AKfycbxbcqhjp6ZEXA_ZtBcAAnylsvXhRi7Hnj_jV2mclxnBN2ZE34qvFWbBPzuOr9v4Mh5v/exec';
  let dataByServer = {};

  async function fetchData() {
    console.log('Fetching data from:', baseUrl);
    try {
      const response = await fetch(baseUrl);
      const data = await response.json();
      console.log('Fetched data:', data);
      processData(data.values);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  function processData(data) {
    console.log('Processing data:', data);
    const servers = new Set();
    dataByServer = {};

    data.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      const [name, server, points, rank, str, dex, con, wins, losses, totalFights] = row;

      if (!dataByServer[server]) {
        dataByServer[server] = [];
      }

      dataByServer[server].push({ name, points, rank, str, dex, con, wins, losses, totalFights });
      servers.add(server);
    });

    populateServerSelect([...servers]);
  }

  function populateServerSelect(servers) {
    console.log('Populating server select:', servers);
    const serverSelect = document.getElementById('server-select');
    servers.forEach(server => {
      const option = document.createElement('option');
      option.value = server;
      option.textContent = server;
      serverSelect.appendChild(option);
    });
  }

  function updateCharacterSelect() {
    console.log('Updating character select');
    const serverSelect = document.getElementById('server-select');
    const characterSelect = document.getElementById('character-select');
    const selectedServer = serverSelect.value;

    // Clear previous character options
    characterSelect.innerHTML = '<option value="">--Please choose an option--</option>';

    if (dataByServer[selectedServer]) {
      dataByServer[selectedServer].forEach(character => {
        const option = document.createElement('option');
        option.value = character.name;
        option.textContent = character.name;
        characterSelect.appendChild(option);
      });
    }

    // Add event listener to update player info when a character is selected
    characterSelect.onchange = function() {
      const selectedCharacter = characterSelect.value;
      displayCharacterInfo(selectedServer, selectedCharacter);
    };
  }

  async function displayCharacterInfo(server, characterName) {
    console.log(`Displaying info for character: ${characterName} on server: ${server}`);
    try {
      const response = await fetch(`${baseUrl}?server=${server}&name=${characterName}`);
      const character = await response.json();
      const container = document.getElementById('player-info');
      container.innerHTML = ''; // Clear previous info

      if (character) {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `
          <h3>${character[0]}</h3>
          <p><strong>Server:</strong> ${server}</p>
          <p><strong>Points:</strong> ${character[2]}</p>
          <p><strong>Rank:</strong> ${character[3]}</p>
          <p><strong>Strength:</strong> ${character[4]}</p>
          <p><strong>Dexterity:</strong> ${character[5]}</p>
          <p><strong>Constitution:</strong> ${character[6]}</p>
          <p><strong>Wins:</strong> ${character[7]}</p>
          <p><strong>Losses:</strong> ${character[8]}</p>
          <p><strong>Total Fights:</strong> ${character[9]}</p>
        `;
        playerDiv.style.color = 'white';
        playerDiv.style.marginBottom = '20px';
        container.appendChild(playerDiv);
      }
    } catch (error) {
      console.error('Error displaying character info:', error);
    }
  }

  fetchData();
});
