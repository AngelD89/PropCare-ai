const API_URL = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
    loadProperties();
    loadServices();
    loadProviders();

    document.getElementById("propertyForm")
        .addEventListener("submit", addProperty);

    document.getElementById("serviceForm")
        .addEventListener("submit", addService);

    document.getElementById("providerForm")
        .addEventListener("submit", addProvider);
});


/* =========================
   PROPERTIES
========================= */

async function loadProperties() {
    const response = await fetch(`${API_URL}/properties`);
    const properties = await response.json();

    const list = document.getElementById("propertyList");
    const dropdown = document.getElementById("service_property_id");

    list.innerHTML = "";
    dropdown.innerHTML = '<option value="">Select Property</option>';

    properties.forEach(prop => {
        // Display list
        const li = document.createElement("li");
        li.innerHTML = `
            ${prop.name}
            <button onclick="deleteProperty(${prop.id})">Delete</button>
        `;
        list.appendChild(li);

        // Populate dropdown
        const option = document.createElement("option");
        option.value = prop.id;
        option.textContent = prop.name;
        dropdown.appendChild(option);
    });
}

async function addProperty(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const user_id = document.getElementById("user_id").value;

    await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            user_id: parseInt(user_id)
        })
    });

    document.getElementById("propertyForm").reset();
    loadProperties();
}

async function deleteProperty(id) {
    await fetch(`${API_URL}/properties/${id}`, {
        method: "DELETE"
    });

    loadProperties();
}


/* =========================
   SERVICES
========================= */

async function loadServices() {
    const response = await fetch(`${API_URL}/services`);
    const services = await response.json();

    const list = document.getElementById("serviceList");
    list.innerHTML = "";

    services.forEach(service => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>${service.type}</strong>
                <br>
                Status:
                <select onchange="updateServiceStatus(${service.id}, this.value)">
                    <option value="scheduled" ${service.status === "scheduled" ? "selected" : ""}>Scheduled</option>
                    <option value="completed" ${service.status === "completed" ? "selected" : ""}>Completed</option>
                    <option value="canceled" ${service.status === "canceled" ? "selected" : ""}>Canceled</option>
                </select>
            </div>

            <button onclick="deleteService(${service.id})">Delete</button>
        `;

        list.appendChild(li);
    });
}

async function updateServiceStatus(id, newStatus) {
    await fetch(`${API_URL}/services/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: newStatus
        })
    });

    loadServices();
}

async function addService(event) {
    event.preventDefault();

    const property_id = document.getElementById("service_property_id").value;
    const provider_id = document.getElementById("service_provider_id").value;
    const type = document.getElementById("service_type").value;
    const dateInput = document.getElementById("service_date").value;

    const date = dateInput ? new Date(dateInput).toISOString() : null;

    await fetch(`${API_URL}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            property_id: parseInt(property_id),
            provider_id: provider_id ? parseInt(provider_id) : null,
            type: type,
            date: date
        })
    });

    document.getElementById("serviceForm").reset();
    loadServices();
}

async function deleteService(id) {
    await fetch(`${API_URL}/services/${id}`, {
        method: "DELETE"
    });

    loadServices();
}


/* =========================
   PROVIDERS
========================= */

async function loadProviders() {
    const response = await fetch(`${API_URL}/providers`);
    const providers = await response.json();

    const list = document.getElementById("providerList");
    const dropdown = document.getElementById("service_provider_id");

    list.innerHTML = "";
    dropdown.innerHTML = '<option value="">Select Provider (Optional)</option>';

    providers.forEach(provider => {
        // Display list
        const li = document.createElement("li");
        li.innerHTML = `
            ${provider.name}
            <button onclick="deleteProvider(${provider.id})">Delete</button>
        `;
        list.appendChild(li);

        // Populate dropdown
        const option = document.createElement("option");
        option.value = provider.id;
        option.textContent = provider.name;
        dropdown.appendChild(option);
    });
}

async function addProvider(event) {
    event.preventDefault();

    const name = document.getElementById("provider_name").value;
    const service_type = document.getElementById("provider_service_type").value;
    const phone = document.getElementById("provider_phone").value;
    const email = document.getElementById("provider_email").value;

    await fetch(`${API_URL}/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            service_type: service_type,
            phone: phone,
            email: email
        })
    });

    document.getElementById("providerForm").reset();
    loadProviders();
}

async function deleteProvider(id) {
    await fetch(`${API_URL}/providers/${id}`, {
        method: "DELETE"
    });

    loadProviders();
}


/* =========================
   AI ASSISTANT
========================= */

async function askAI() {
    const prompt = document.getElementById("aiPrompt").value;

    const response = await fetch(`${API_URL}/ai/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    document.getElementById("aiResponse").textContent = data.response;
}
