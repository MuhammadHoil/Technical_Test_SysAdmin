const apiKey = '7847bd6f21d285e11a7de473e7f40227'; // Ganti dengan API Key kamu
const cities = ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi', ''];
const cityList = document.getElementById('city-list');

async function fetchWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=id`
    );
    const data = await response.json();

    if (data.cod !== "200") {
      alert(`Gagal mengambil data untuk ${city}: ${data.message}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(error);
    alert(`Error mengambil data untuk ${city}`);
    return null;
  }
}

function createCityCard(data) {
  const existingCard = document.getElementById(`card-${data.city.name}`);
  if (existingCard) {
    existingCard.remove(); // hapus dulu biar update
  }

  const cityCard = document.createElement('div');
  cityCard.className = 'city-card';
  cityCard.id = `card-${data.city.name}`;

  const cityName = data.city.name;
  const currentWeather = data.list[0];

  cityCard.innerHTML = `
    <div class="weather-info">
      <h2>${cityName}</h2>
      <p>${currentWeather.weather[0].description}</p>
      <p>Suhu: ${currentWeather.main.temp}°C</p>
    </div>
    <canvas id="chart-${cityName}"></canvas>
  `;

  cityList.appendChild(cityCard);
  updateChart(data, `chart-${cityName}`);
}

function updateChart(data, canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  const labels = data.list
    .filter(item => item.dt_txt.includes("12:00:00"))
    .map(item => new Date(item.dt_txt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));

  const temps = data.list
    .filter(item => item.dt_txt.includes("12:00:00"))
    .map(item => item.main.temp);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Suhu Siang (°C)',
        data: temps,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: true,
        tension: 0.3,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

async function init() {
  cityList.innerHTML = ''; // reset dulu
  for (const city of cities) {
    const data = await fetchWeather(city);
    if (data) {
      createCityCard(data);
    }
  }
}

function addCity() {
  const input = document.getElementById('city-input');
  const cityName = input.value.trim();
  if (cityName && !cities.includes(cityName)) {
    cities.push(cityName);
    fetchWeather(cityName).then(data => {
      if (data) createCityCard(data);
    });
    input.value = '';
  } else {
    alert('Kota sudah ditambahkan atau input kosong!');
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Refresh otomatis tiap 10 menit
setInterval(init, 600000); // 600000 ms = 10 menit

init();
