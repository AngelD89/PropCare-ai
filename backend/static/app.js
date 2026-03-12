/* ===============================
Configuration
=============================== */

const API_BASE = "/api";
const token = localStorage.getItem("token");


/* ===============================
API Helper
=============================== */

async function apiRequest(url, options = {}) {

    const response = await fetch(url, options);

    if (!response.ok) {

        const text = await response.text();
        console.error("API Error:", text);

        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}


/* ===============================
API Health Check
=============================== */

async function checkAPI() {

    try {

        const res = await fetch("/api/health");
        const data = await res.json();

        const status = document.getElementById("apiStatus");

        if (status) {
            status.innerText = "Online";
            status.style.background = "#4CAF50";
            status.style.color = "white";
        }

    } catch {

        const status = document.getElementById("apiStatus");

        if (status) {
            status.innerText = "Offline";
            status.style.background = "#E53935";
            status.style.color = "white";
        }

    }

}


/* ===============================
Logout
=============================== */

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
}


/* ===============================
Auth Headers
=============================== */

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}


/* ===============================
Analytics
=============================== */

async function loadAnalytics() {

    const loading = document.getElementById("loadingMessage");
    if (loading) loading.style.display = "block";

    try {

        const data = await apiRequest(`${API_BASE}/analytics/summary`, {
            headers: authHeaders()
        });

        document.getElementById("stat-properties").innerText = data.total_properties;
        document.getElementById("stat-services").innerText = data.total_services;
        document.getElementById("stat-completed").innerText = data.completed_services;
        document.getElementById("stat-scheduled").innerText = data.scheduled_services;

    } catch (err) {

        console.error("Analytics error:", err);
        alert("Failed to load analytics.");

    }

    if (loading) loading.style.display = "none";
}


/* ===============================
Properties
=============================== */

async function loadProperties() {

    try {

        const properties = await apiRequest(`${API_BASE}/properties`, {
            headers: authHeaders()
        });

        const list = document.getElementById("propertyList");
        const select = document.getElementById("service_property_id");

        if (list) list.innerHTML = "";
        if (select) select.innerHTML = `<option value="">Select Property</option>`;

        properties.forEach(p => {

            if (list) {

                const li = document.createElement("li");
                li.innerText = p.name;
                list.appendChild(li);

            }

            if (select) {

                const option = document.createElement("option");
                option.value = p.id;
                option.textContent = p.name;
                select.appendChild(option);

            }

        });

    } catch (err) {

        console.error("Properties error:", err);
        alert("Something went wrong loading properties.");

    }

}


async function addProperty(name) {

    try {

        await apiRequest(`${API_BASE}/properties`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ name })
        });

        const list = document.getElementById("propertyList");

        if (list) {

            const li = document.createElement("li");
            li.innerText = name;
            list.appendChild(li);

        }

        loadAnalytics();

    } catch (err) {

        console.error("Add property error:", err);
        alert("Failed to add property.");

    }

}


/* ===============================
Providers
=============================== */

async function loadProviders() {

    try {

        const providers = await apiRequest(`${API_BASE}/providers`, {
            headers: authHeaders()
        });

        const list = document.getElementById("providerList");
        const select = document.getElementById("service_provider_id");

        if (list) list.innerHTML = "";
        if (select) select.innerHTML = `<option value="">Select Provider</option>`;

        providers.forEach(p => {

            if (list) {

                const li = document.createElement("li");
                li.innerText = `${p.name} (${p.service_type})`;
                list.appendChild(li);

            }

            if (select) {

                const option = document.createElement("option");
                option.value = p.id;
                option.textContent = p.name;
                select.appendChild(option);

            }

        });

    } catch (err) {

        console.error("Provider load error:", err);
        alert("Failed to load providers.");

    }

}


async function addProvider(provider) {

    try {

        await apiRequest(`${API_BASE}/providers`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(provider)
        });

        loadProviders();
        loadAnalytics();

    } catch (err) {

        console.error("Add provider error:", err);
        alert("Failed to add provider.");

    }

}


/* ===============================
Services
=============================== */

async function loadServices() {

    try {

        const services = await apiRequest(`${API_BASE}/services`, {
            headers: authHeaders()
        });

        const list = document.getElementById("serviceList");
        if (!list) return;

        list.innerHTML = "";

        services.forEach(s => {

            const li = document.createElement("li");

            li.innerText =
                `${s.type} | Property ${s.property_id} | Status: ${s.status}`;

            list.appendChild(li);

        });

    } catch (err) {

        console.error("Service load error:", err);
        alert("Failed to load services.");

    }

}


async function addService(service) {

    try {

        await apiRequest(`${API_BASE}/services`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(service)
        });

        loadServices();
        loadAnalytics();

    } catch (err) {

        console.error("Add service error:", err);
        alert("Failed to add service.");

    }

}


/* ===============================
AI Assistant
=============================== */

async function askAI() {

    const prompt = document.getElementById("aiPrompt").value;

    document.getElementById("aiResponse").innerText = "Thinking...";

    try {

        const data = await apiRequest(`${API_BASE}/ai/assistant`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ prompt })
        });

        document.getElementById("aiResponse").innerText = data.response;

    } catch (err) {

        console.error("AI error:", err);

        document.getElementById("aiResponse").innerText =
            "AI request failed.";

    }

}


/* ===============================
Event Listeners
=============================== */

document.addEventListener("DOMContentLoaded", () => {

    checkAPI();

    loadAnalytics();
    loadProperties();
    loadProviders();
    loadServices();


    const propertyForm = document.getElementById("propertyForm");

    propertyForm?.addEventListener("submit", (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value;

        addProperty(name);

        propertyForm.reset();

    });


    const providerForm = document.getElementById("providerForm");

    providerForm?.addEventListener("submit", (e) => {

        e.preventDefault();

        const provider = {

            name: document.getElementById("provider_name").value,
            service_type: document.getElementById("provider_service_type").value,
            phone: document.getElementById("provider_phone").value,
            email: document.getElementById("provider_email").value,
            rating: parseInt(document.getElementById("provider_rating").value) || 0

        };

        addProvider(provider);

        providerForm.reset();

    });


    const serviceForm = document.getElementById("serviceForm");

    serviceForm?.addEventListener("submit", (e) => {

        e.preventDefault();

        const service = {

            property_id: document.getElementById("service_property_id").value,
            provider_id: document.getElementById("service_provider_id").value,
            type: document.getElementById("service_type").value,
            date: document.getElementById("service_date").value

        };

        addService(service);

        serviceForm.reset();

    });

});
