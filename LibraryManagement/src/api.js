const API_URL = import.meta.env.VITE_API_URL;

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

  getBooks: (filters) => request(`/books${toQueryString(filters)}`),

  donateBook: (formData) =>
    request("/books", { method: "POST", body: formData }),

  updateBook: (id, formData) =>
    request(`/books/${id}`, { method: "PUT", body: formData }),

  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

  takeBook: (bookId) => request(`/books/${bookId}/take`, { method: "POST" }),

  cancelReservation: (id) => request(`/books/${id}/cancel`, { method: "POST" }),

  getMyDonations: (filters) =>
    request(`/books/mine/donated${toQueryString(filters)}`),

  getMyReservation: (filters) =>
    request(`/books/mine/reserved${toQueryString(filters)}`),

  adminGetBooks: (filters) => request(`/admin/books${toQueryString(filters)}`),

  adminDeleteBook: (id) => request(`/admin/books/${id}`, { method: "DELETE" }),

  adminCancelReservation: (id) =>
    request(`/admin/books/${id}/cancel`, { method: "POST" }),

  getNotifications: () => request("/notifications"),

  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: "POST" }),

  markAllNotificationsRead: () =>
    request("/notifications/read-all", { method: "POST" }),
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

function toQueryString(params) {
  const clean = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (clean.length === 0) return "";
  return (
    "?" +
    clean
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&")
  );
}
