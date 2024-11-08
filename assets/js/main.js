// API base URL
const API_BASE_URL = 'http://localhost:8080';

const searchInput = document.querySelector('.search input');
searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  filterPatients(query);
});

let patientsData = []; // Lista completa de pacientes

// Função de filtro por busca e status
function filterPatients(query = '', status = null) {
  const filteredPatients = patientsData.filter((patient) => {
    const nameMatch = patient.name.toLowerCase().includes(query);
    const ageMatch = patient.age.toString().includes(query);
    const genderMatch = patient.gender.toLowerCase().includes(query);
    const statusMatch = status ? patient.status === status : true;

    return (nameMatch || ageMatch || genderMatch) && statusMatch;
  });

  displayPatients(filteredPatients);
}

// Função para carregar todos os pacientes e exibi-los
async function getPatients() {
  try {
      const response = await fetch(`${API_BASE_URL}/user`);
      const data = await response.json();
      patientsData = data.data;
      displayPatients(patientsData);
  } catch (error) {
      console.error("Erro ao listar pacientes:", error);
  }
}

// Função de exibição de pacientes
function displayPatients(patients) {
  const patientList = document.getElementById("patientList");
  patientList.innerHTML = "";

  patients.forEach((patient) => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = patient.name;

    const ageTd = document.createElement("td");
    const age = calculateAge(patient.dateOfBirth);
    ageTd.textContent = age;

    const genderTd = document.createElement("td");
    genderTd.textContent = patient.gender;

    const statusTd = document.createElement("td");
    const statusSpan = document.createElement("span");
    statusSpan.classList.add("status");

    switch (patient.status) {
      case 'Baixa':
        statusSpan.classList.add('delivered');
        break;
      case 'Média':
        statusSpan.classList.add('pending');
        break;
      case 'Alta':
        statusSpan.classList.add('return');
        break;
      default:
        statusSpan.classList.add('default');
    }

    statusSpan.textContent = patient.status;
    statusTd.appendChild(statusSpan);

    tr.appendChild(nameTd);
    tr.appendChild(ageTd);
    tr.appendChild(genderTd);
    tr.appendChild(statusTd);

    patientList.appendChild(tr);
  });
}

// Função para cadastrar paciente
async function createPatient(patientData) {
  try {
      const response = await fetch(`${API_BASE_URL}/user`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(patientData),
      });
      if (response.ok) {
          alert("Paciente cadastrado com sucesso!");
          getPatients();
      } else {
          alert("Erro ao cadastrar paciente");
      }
  } catch (error) {
      console.error("Erro ao cadastrar paciente:", error);
  }
}

// Função para formatar a data no formato YYYY-MM-DD
function formatDate(date) {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}

// Função para calcular a idade
function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }

  return age;
}

// Função para sortear um status aleatório
function getRandomStatus() {
  const statuses = ['Baixa', 'Média', 'Alta'];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
}

// Capturar o envio do formulário e chamar a função de criação de paciente
document.getElementById("patientForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const gender = document.getElementById("gender").value;
  const dateOfBirth = document.getElementById("dateOfBirth").value;
  const cpf = document.getElementById("cpf").value;
  const cardNumber = document.getElementById("cardNumber").value;

  const formattedDateOfBirth = formatDate(dateOfBirth);
  const age = calculateAge(dateOfBirth);
  const ageAsString = age.toString();
  const status = getRandomStatus();

  const newPatient = { 
    name, 
    gender,
    cpf,
    cardNumber,
    age: ageAsString,
    status,
    dateOfBirth: formattedDateOfBirth,
  };

  createPatient(newPatient);

  document.getElementById("patientForm").reset();
});

// Eventos de clique para filtrar pacientes por status ao clicar nos cards
document.querySelector(".all-patients").addEventListener("click", () => filterPatients('', null));
document.querySelector(".low-priority").addEventListener("click", () => filterPatients('', 'Baixa'));
document.querySelector(".medium-priority").addEventListener("click", () => filterPatients('', 'Média'));
document.querySelector(".high-priority").addEventListener("click", () => filterPatients('', 'Alta'));

// Carregar lista de pacientes ao carregar a página
document.addEventListener("DOMContentLoaded", getPatients);
