const API_URL = "http://localhost:3001/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  getBooks: () => request("/books"),

  donateBook: (formData) =>
    request("/books", { method: "POST", body: formData }),

  updateBook: (id, formData) =>
    request(`/books/${id}`, { method: "PUT", body: formData }),

  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

  takeBook: (bookId) => request(`/books/${bookId}/take`, { method: "POST" }),

  cancelReservation: (id) => request(`/books/${id}/cancel`, { method: "POST" }),

  getMyDonations: () => request("/books/mine/donated"),
  getMyReservation: () => request("/books/mine/reserved"),
};

export const auth = {
  getToken,
  getUser: () => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },
  setSession: ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  isLoggedIn: () => !!getToken(),
};
