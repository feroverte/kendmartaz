"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const JWT_SECRET = process.env.JWT_SECRET || "kendmart_secure_jwt_secret_token_2026";
const ADMIN_PATH = process.env.ADMIN_PATH || "kendmart-admin";
const COOKIE_NAME = "kendmart_admin_token";

// Helper to get auth header from cookies
async function getAuthHeader() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(COOKIE_NAME);
  if (tokenCookie) {
    return { "Authorization": `Bearer ${tokenCookie.value}` };
  }
  return {};
}

// Auth Actions
export async function adminLogin(email, password) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return { success: true, admin: data.admin };
    }
    return { success: false, error: data.error || "Login failed" };
  } catch (error) {
    console.error("Login request failed:", error);
    return { success: false, error: "Unable to connect to backend server" };
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return { success: true };
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(COOKIE_NAME);
  if (!tokenCookie) return false;

  try {
    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET);
    return decoded && decoded.role === "admin";
  } catch (e) {
    return false;
  }
}

// Settings / Stats Actions
export async function getSettings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/settings`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch settings");
    return await res.json();
  } catch (error) {
    console.error("getSettings failed:", error);
    // Fallback defaults
    return {
      total_impact_points: "4820",
      farmers_featured: "12",
      purchase_requests: "348",
      estimated_climate_impact: "8.4"
    };
  }
}

export async function updateSetting(key, value) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader())
    };
    const res = await fetch(`${BACKEND_URL}/api/settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({ key, value })
    });
    if (!res.ok) throw new Error("Failed to update setting");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("updateSetting failed:", error);
    throw error;
  }
}

// Farmers Actions
export async function getFarmers() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/farmers`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch farmers");
    return await res.json();
  } catch (error) {
    console.error("getFarmers failed:", error);
    return [];
  }
}

export async function createFarmer(data) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader())
    };
    const res = await fetch(`${BACKEND_URL}/api/farmers`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create farmer");
    
    revalidatePath("/");
    revalidatePath("/dashboard");
    return await res.json();
  } catch (error) {
    console.error("createFarmer failed:", error);
    throw error;
  }
}

export async function updateFarmer(id, data) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader())
    };
    const res = await fetch(`${BACKEND_URL}/api/farmers/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update farmer");
    revalidatePath("/");
    return await res.json();
  } catch (error) {
    console.error("updateFarmer failed:", error);
    throw error;
  }
}

export async function deleteFarmer(id) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/farmers/${id}`, {
      method: "DELETE",
      headers
    });
    if (!res.ok) throw new Error("Failed to delete farmer");

    revalidatePath("/");
    revalidatePath("/dashboard");
    return await res.json();
  } catch (error) {
    console.error("deleteFarmer failed:", error);
    throw error;
  }
}

// Requests Actions
export async function getRequests() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/requests`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch requests");
    return await res.json();
  } catch (error) {
    console.error("getRequests failed:", error);
    return [];
  }
}

export async function createRequest(data) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create request");
    
    revalidatePath("/");
    revalidatePath("/dashboard");
    return await res.json();
  } catch (error) {
    console.error("createRequest failed:", error);
    throw error;
  }
}

export async function updateRequestStatus(id, status) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader())
    };
    const res = await fetch(`${BACKEND_URL}/api/requests/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Failed to update request status");
    revalidatePath("/admin/manage");
    return await res.json();
  } catch (error) {
    console.error("updateRequestStatus failed:", error);
    throw error;
  }
}

export async function deleteRequest(id) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/requests/${id}`, {
      method: "DELETE",
      headers
    });
    if (!res.ok) throw new Error("Failed to delete request");
    revalidatePath("/admin/manage");
    return await res.json();
  } catch (error) {
    console.error("deleteRequest failed:", error);
    throw error;
  }
}

// Articles / Blog Actions
export async function getArticles() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/articles`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch articles");
    return await res.json();
  } catch (error) {
    console.error("getArticles failed:", error);
    return [];
  }
}

export async function getArticleById(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/articles/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch article");
    return await res.json();
  } catch (error) {
    console.error("getArticleById failed:", error);
    return null;
  }
}

export async function createArticle(data) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader())
    };
    const res = await fetch(`${BACKEND_URL}/api/articles`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create article");
    revalidatePath("/blog");
    return await res.json();
  } catch (error) {
    console.error("createArticle failed:", error);
    throw error;
  }
}

export async function updateArticle(id, data) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader())
    };
    const res = await fetch(`${BACKEND_URL}/api/articles/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update article");
    revalidatePath("/blog");
    revalidatePath(`/blog/${id}`);
    return await res.json();
  } catch (error) {
    console.error("updateArticle failed:", error);
    throw error;
  }
}

export async function deleteArticle(id) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/articles/${id}`, {
      method: "DELETE",
      headers
    });
    if (!res.ok) throw new Error("Failed to delete article");
    revalidatePath("/blog");
    return await res.json();
  } catch (error) {
    console.error("deleteArticle failed:", error);
    throw error;
  }
}

// Page Content Actions
export async function getPageContent(key) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/page-content/${key}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch page content");
    return await res.json();
  } catch (error) {
    console.error("getPageContent failed:", error);
    return null;
  }
}

export async function updatePageContent(key, contentObj) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader())
    };
    const res = await fetch(`${BACKEND_URL}/api/page-content/${key}`, {
      method: "POST",
      headers,
      body: JSON.stringify(contentObj)
    });
    if (!res.ok) throw new Error("Failed to update page content");
    
    if (key === "mission_page") revalidatePath("/mission");
    if (key === "why_local_page") revalidatePath("/why-local");
    if (key === "research_page") revalidatePath("/research");
    if (key === "home_page") revalidatePath("/");
    if (key === "dashboard_page") revalidatePath("/dashboard");
    if (key === "external_articles") revalidatePath("/blog");
    
    return { success: true };
  } catch (error) {
    console.error("updatePageContent failed:", error);
    throw error;
  }
}

// Impact Maps Actions
export async function getImpactMaps() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/impact-maps`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch impact maps");
    return await res.json();
  } catch (error) {
    console.error("getImpactMaps failed:", error);
    return [];
  }
}

export async function upsertImpactMap(product, points) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(await getAuthHeader())
    };
    const res = await fetch(`${BACKEND_URL}/api/impact-maps`, {
      method: "POST",
      headers,
      body: JSON.stringify({ product, points })
    });
    if (!res.ok) throw new Error("Failed to upsert impact map");
    return await res.json();
  } catch (error) {
    console.error("upsertImpactMap failed:", error);
    throw error;
  }
}

export async function deleteImpactMap(product) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/impact-maps/${product}`, {
      method: "DELETE",
      headers
    });
    if (!res.ok) throw new Error("Failed to delete impact map");
    return await res.json();
  } catch (error) {
    console.error("deleteImpactMap failed:", error);
    throw error;
  }
}

// ----------------------------------------------------
// Listings Actions
// ----------------------------------------------------
export async function getListings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/listings`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch listings");
    return await res.json();
  } catch (error) {
    console.error("getListings failed:", error);
    return [];
  }
}

export async function getListingById(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/listings/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch listing");
    return await res.json();
  } catch (error) {
    console.error("getListingById failed:", error);
    return null;
  }
}

export async function createListing(data) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
    const res = await fetch(`${BACKEND_URL}/api/listings`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create listing");
    return await res.json();
  } catch (error) {
    console.error("createListing failed:", error);
    throw error;
  }
}

export async function updateListing(id, data) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
    const res = await fetch(`${BACKEND_URL}/api/listings/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update listing");
    return await res.json();
  } catch (error) {
    console.error("updateListing failed:", error);
    throw error;
  }
}

export async function deleteListing(id) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/listings/${id}`, {
      method: "DELETE",
      headers
    });
    if (!res.ok) throw new Error("Failed to delete listing");
    return await res.json();
  } catch (error) {
    console.error("deleteListing failed:", error);
    throw error;
  }
}

// ----------------------------------------------------
// Dataset Actions (Research Analytics)
// ----------------------------------------------------
export async function getDatasets(onlyPublic = false) {
  try {
    const url = onlyPublic 
      ? `${BACKEND_URL}/api/public/research`
      : `${BACKEND_URL}/api/datasets`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch datasets");
    return await res.json();
  } catch (error) {
    console.error("getDatasets failed:", error);
    return onlyPublic ? { datasets: [], settings: {} } : [];
  }
}

export async function getDatasetById(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/datasets/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch dataset");
    return await res.json();
  } catch (error) {
    console.error("getDatasetById failed:", error);
    return null;
  }
}

export async function createDataset(data) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  try {
    const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
    const res = await fetch(`${BACKEND_URL}/api/datasets`, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create dataset");
    revalidatePath("/admin/research");
    return await res.json();
  } catch (error) {
    console.error("createDataset failed:", error);
    throw error;
  }
}

export async function updateDataset(id, data) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  try {
    const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
    const res = await fetch(`${BACKEND_URL}/api/datasets/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update dataset");
    revalidatePath("/admin/research");
    revalidatePath("/research");
    return await res.json();
  } catch (error) {
    console.error("updateDataset failed:", error);
    throw error;
  }
}

export async function deleteDataset(id) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/datasets/${id}`, { method: "DELETE", headers });
    if (!res.ok) throw new Error("Failed to delete dataset");
    revalidatePath("/admin/research");
    revalidatePath("/research");
    return await res.json();
  } catch (error) {
    console.error("deleteDataset failed:", error);
    throw error;
  }
}

export async function uploadCsv(formData) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND_URL}/api/datasets/upload-csv`, {
      method: "POST",
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to upload CSV");
    }
    revalidatePath("/admin/research");
    revalidatePath("/research");
    return await res.json();
  } catch (error) {
    console.error("uploadCsv failed:", error);
    throw error;
  }
}

export async function generateDatasetInsights(id) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  try {
    const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
    const res = await fetch(`${BACKEND_URL}/api/datasets/${id}/generate-insights`, {
      method: "POST",
      headers
    });
    if (!res.ok) throw new Error("Failed to generate insights");
    return await res.json();
  } catch (error) {
    console.error("generateDatasetInsights failed:", error);
    throw error;
  }
}

// ----------------------------------------------------
// User Auth Actions
// ----------------------------------------------------
export async function registerUser(data) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok && result.success) {
      const cookieStore = await cookies();
      cookieStore.set("kendmart_user_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
      });
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error || "Registration failed" };
  } catch (error) {
    console.error("registerUser failed:", error);
    return { success: false, error: "Unable to connect to backend server" };
  }
}

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      const cookieStore = await cookies();
      cookieStore.set("kendmart_user_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/"
      });
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error || "Login failed" };
  } catch (error) {
    console.error("loginUser failed:", error);
    return { success: false, error: "Unable to connect to backend server" };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.set("kendmart_user_token", "", { maxAge: 0, path: "/" });
  return { success: true };
}

export async function checkUserSession() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("kendmart_user_token");
  if (!tokenCookie) return null;
  try {
    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET);
    if (decoded && decoded.role === "user") {
      const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
        headers: { "Authorization": `Bearer ${tokenCookie.value}` },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        return data.user || decoded;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

// ----------------------------------------------------
// Saved Listing Actions
// ----------------------------------------------------
export async function getSavedListings() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kendmart_user_token")?.value;
  if (!token) return [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/saved-listings`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("getSavedListings failed:", error);
    return [];
  }
}

export async function saveListing(listingId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kendmart_user_token")?.value;
  if (!token) return { success: false, error: "Not logged in" };
  try {
    const res = await fetch(`${BACKEND_URL}/api/saved-listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ listingId })
    });
    return await res.json();
  } catch (error) {
    console.error("saveListing failed:", error);
    return { success: false, error: error.message };
  }
}

export async function unsaveListing(savedId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kendmart_user_token")?.value;
  if (!token) return { success: false, error: "Not logged in" };
  try {
    const res = await fetch(`${BACKEND_URL}/api/saved-listings/${savedId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    return await res.json();
  } catch (error) {
    console.error("unsaveListing failed:", error);
    return { success: false, error: error.message };
  }
}

// Credits
export async function getCredits() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/credits`, { cache: "no-store" });
    return await res.json();
  } catch (error) {
    console.error("getCredits failed:", error);
    return [];
  }
}

export async function createCredit(data) {
  const auth = await getAuthHeader();
  if (!auth) return { success: false, error: "Not authenticated" };
  try {
    const res = await fetch(`${BACKEND_URL}/api/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    revalidatePath("/");
    return result;
  } catch (error) {
    console.error("createCredit failed:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCredit(id, data) {
  const auth = await getAuthHeader();
  if (!auth) return { success: false, error: "Not authenticated" };
  try {
    const res = await fetch(`${BACKEND_URL}/api/credits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    revalidatePath("/");
    return result;
  } catch (error) {
    console.error("updateCredit failed:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCredit(id) {
  const auth = await getAuthHeader();
  if (!auth) return { success: false, error: "Not authenticated" };
  try {
    const res = await fetch(`${BACKEND_URL}/api/credits/${id}`, {
      method: "DELETE",
      headers: { ...auth }
    });
    revalidatePath("/");
    return await res.json();
  } catch (error) {
    console.error("deleteCredit failed:", error);
    return { success: false, error: error.message };
  }
}
