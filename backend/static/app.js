// ===============================
// Configuration
// ===============================

const API_BASE = "/api";
const token =
const token = localStorage.getItem("token");

// ==============================
// Logout
// =============================

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
}


// ===============================
// Auth Headers
// ===============================

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}


// ===============================
// Analytics
// ===============================

async function loadAnalytics() {

    const loading = document.getElementById("loadingMessage");
    if (loading) loading.style.display = "block";

    try {

        const res = await fetch(`${API_BASE}/analytics/summary`, {
            headers: authHeaders()
        });

        const data = await res.json();

        document.getElementById("totalProperties").innerText = data.total_properties;
        document.getElementById("totalServices").innerText = data.total_services;
        document.getElementById("completedServices").innerText = data.completed_services;
        document.getElementById("scheduledServices").innerText = data.scheduled_services;

    } catch (err) {

        console.error("Analytics error:", err);
        alert("Failed to load analytics.");

    }

    if (loading) loading.style.display = "none";
}



// ===============================
// Properties
// ===============================

async function loadProperties() {

    try {

        const res = await fetch(`${API_BASE}/properties`, {
            headers: authHeaders()
        });

	if (!res.ok) {
		throw new Error("API request failed")
	}

        const properties = await res.json();

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

        console.error(err);
	alert ("Something went wrong loading properties.");

    }

}


async function addProperty(name) {

    await fetch(`${API_BASE}/properties`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name })
    });

    alert("Property added successfully!");

    loadProperties();

}



// ===============================
// Providers
// ===============================

async function loadProviders() {

    try {

        const res = await fetch(`${API_BASE}/providers`, {
            headers: authHeaders()
        });

        const providers = await res.json();

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

    }

}


async function addProvider(provider) {

    await fetch(`${API_BASE}/providers`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(provider)
    });

    alert("Provider added successfully!");

    loadProviders();

}



// ===============================
// Services
// ===============================

async function loadServices() {

    try {

        const res = await fetch(`${API_BASE}/services`, {
            headers: authHeaders()
        });

        const services = await res.json();

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

    }

}


async function addService(service) {

    await fetch(`${API_BASE}/services`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(service)
    });

    alert("Service added successfully!");

    loadServices();

}



// ===============================
// AI Assistant
// ===============================

async function askAI() {

    const prompt = document.getElementById("aiPrompt").value;

    document.getElementById("aiResponse").innerText = "Thinking...";

    try {

        const res = await fetch(`${API_BASE}/ai/assistant`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        document.getElementById("aiResponse").innerText = data.response;

    } catch (err) {

        console.error("AI error:", err);

        document.getElementById("aiResponse").innerText =
            "AI request failed.";

    }

}



// ===============================
// Event Listeners
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    if (!token) {

        console.log("User not logged in");

    }

    loadAnalytics();
    loadProperties();
    loadProviders();
    loadServices();



    // Property Form

    const propertyForm = document.getElementById("propertyForm");

    propertyForm?.addEventListener("submit", (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value;

        addProperty(name);

        propertyForm.reset();

    });



    // Provider Form

    const providerForm = document.getElementById("providerForm");

    providerForm?.addEventListener("submit", (e) => {

        e.preventDefault();

        const provider = {

            name: document.getElementById("provider_name").value,
            service_type: document.getElementById("provider_service_type").value,
            phone: document.getElementById("provider_phone").value,
            email: document.getElementById("provider_email").value,
            rating: document.getElementById("provider_rating").value

        };

        addProvider(provider);

        providerForm.reset();

    });



    // Service Form

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
