const API_BASE = "http://127.0.0.1:5000/api";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

/* =========================
   API FETCH WITH TOKEN
========================= */

async function apiFetch(url, options = {}) {

    const token = localStorage.getItem("token");

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    return response;
}

/* =========================
   ANALYTICS
========================= */

async function loadAnalytics() {

    const res = await apiFetch(`${API_BASE}/analytics/summary`);
    const data = await res.json();

    document.getElementById("stat-properties").innerText = data.properties;
    document.getElementById("stat-services").innerText = data.services;
    document.getElementById("stat-completed").innerText = data.completed;
    document.getElementById("stat-scheduled").innerText = data.scheduled;
}

/* =========================
   PROPERTIES
========================= */

async function loadProperties() {

    const res = await apiFetch(`${API_BASE}/properties`);
    const properties = await res.json();

    const list = document.getElementById("propertyList");
    const dropdown = document.getElementById("service_property_id");

    list.innerHTML = "";
    dropdown.innerHTML = '<option value="">Select Property</option>';

    properties.forEach(property => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${property.name}
            <button onclick="deleteProperty(${property.id})">Delete</button>
        `;

        list.appendChild(li);

        const option = document.createElement("option");
        option.value = property.id;
        option.textContent = property.name;

        dropdown.appendChild(option);
    });
}

document.getElementById("propertyForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value;

    await apiFetch(`${API_BASE}/properties`, {
        method: "POST",
        body: JSON.stringify({ name })
    });

    document.getElementById("propertyForm").reset();

    loadProperties();
    loadAnalytics();
});

async function deleteProperty(id) {

    await apiFetch(`${API_BASE}/properties/${id}`, {
        method: "DELETE"
    });

    loadProperties();
    loadAnalytics();
}

/* =========================
   PROVIDERS
========================= */

async function loadProviders() {

    const res = await apiFetch(`${API_BASE}/providers`);
    const providers = await res.json();

    const list = document.getElementById("providerList");
    const dropdown = document.getElementById("service_provider_id");
    const filter = document.getElementById("providerFilter");

    list.innerHTML = "";
    dropdown.innerHTML = '<option value="">Select Provider</option>';

    const serviceTypes = new Set();

    providers.forEach(provider => {

        serviceTypes.add(provider.service_type);

        const li = document.createElement("li");

        li.setAttribute("data-service", provider.service_type);

        li.innerHTML = `
            ${provider.name} (${provider.service_type}) ⭐${provider.rating}
            <button onclick="deleteProvider(${provider.id})">Delete</button>
        `;

        list.appendChild(li);

        const option = document.createElement("option");
        option.value = provider.id;
        option.textContent = provider.name;

        dropdown.appendChild(option);
    });

    filter.innerHTML = '<option value="all">All</option>';

    serviceTypes.forEach(type => {

        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;

        filter.appendChild(option);
    });
}

document.getElementById("providerForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("provider_name").value;
    const service_type = document.getElementById("provider_service_type").value;
    const phone = document.getElementById("provider_phone").value;
    const email = document.getElementById("provider_email").value;
    const rating = document.getElementById("provider_rating").value;

    await apiFetch(`${API_BASE}/providers`, {
        method: "POST",
        body: JSON.stringify({
            name,
            service_type,
            phone,
            email,
            rating
        })
    });

    document.getElementById("providerForm").reset();

    loadProviders();
});

async function deleteProvider(id) {

    await apiFetch(`${API_BASE}/providers/${id}`, {
        method: "DELETE"
    });

    loadProviders();
}

/* =========================
   PROVIDER FILTER
========================= */

document.getElementById("providerFilter").addEventListener("change", function() {

    const selected = this.value;

    const providers = document.querySelectorAll("#providerList li");

    providers.forEach(provider => {

        if (selected === "all") {

            provider.style.display = "flex";

        } else {

            const service = provider.getAttribute("data-service");

            provider.style.display = service === selected ? "flex" : "none";

        }

    });

});

/* =========================
   SERVICES
========================= */

async function loadServices() {

    const res = await apiFetch(`${API_BASE}/services`);
    const services = await res.json();

    const list = document.getElementById("serviceList");

    list.innerHTML = "";

    services.forEach(service => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${service.type} - ${service.status}
            <button onclick="deleteService(${service.id})">Delete</button>
        `;

        list.appendChild(li);
    });
}

document.getElementById("serviceForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const property_id = document.getElementById("service_property_id").value;
    const provider_id = document.getElementById("service_provider_id").value;
    const type = document.getElementById("service_type").value;
    const date = document.getElementById("service_date").value;

    await apiFetch(`${API_BASE}/services`, {
        method: "POST",
        body: JSON.stringify({
            property_id,
            provider_id: provider_id || null,
            type,
            date
        })
    });

    document.getElementById("serviceForm").reset();

    loadServices();
    loadAnalytics();
});

async function deleteService(id) {

    await apiFetch(`${API_BASE}/services/${id}`, {
        method: "DELETE"
    });

    loadServices();
    loadAnalytics();
}

/* =========================
   INITIAL LOAD
========================= */

loadAnalytics();
loadProperties();
loadProviders();
loadServices();
